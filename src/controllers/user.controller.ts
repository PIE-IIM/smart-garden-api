import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import bcrypt from "bcryptjs";
import { Login, Signup } from "../../models/models";
import { Request, Response } from "express";
import { Utils } from "../utils";
import { AuthRequest } from "../middleware/auth.middleware";
import nodemailer from "nodemailer";

export class UserController {
  constructor(private prisma: PrismaClient, private utils: Utils) { }

  async createUserSession(userId: string): Promise<string> {
    const token = this.utils.generateToken();
    const now = new Date();
    const expireAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await this.prisma.token.create({
      data: {
        id: token,
        expireAt: expireAt,
        userId: userId,
      },
    });

    return token;
  }

  async deleteUserSession(userId: string): Promise<void> {
    await this.prisma.token.delete({
      where: { userId: userId },
    });
  }

  async getUser(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Auth header is missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token Bearer is missing" });
    }

    const tokenData = await this.prisma.token.findUnique({
      where: { id: token },
    });

    if (!tokenData) {
      return res.status(404).json({ message: "Invalid Token" });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: tokenData.userId },
      select: { id: true, name: true, email: true, level: true, isPrivate: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(user);
  }

  async createUser(req: Request<{}, {}, Signup>, res: Response) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(403).json();
      return;
    }

    const alreadyExists = await this.prisma.user.findUnique({
      where: { email },
    });
    if (alreadyExists) {
      res.status(403).json();
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    const currentUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!currentUser) {
      res.sendStatus(500);
      return;
    }
    const token = await this.createUserSession(currentUser.id);

    res.status(201).json({ token: token });
    return;
  }

  async login(req: Request<{}, {}, Login>, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      res.sendStatus(403);
      return;
    }
    const currentUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!currentUser) {
      res.sendStatus(404);
      return;
    }
    const passwordIsValid = await bcrypt.compare(
      password,
      currentUser.password
    );
    if (!passwordIsValid) {
      res.sendStatus(403);
      return;
    }
    const userHasToken = await this.prisma.token.findUnique({
      where: { userId: currentUser.id },
    });
    if (userHasToken) {
      await this.deleteUserSession(currentUser.id);
    }

    const token = await this.createUserSession(currentUser.id);

    res.status(200).json({
      token: token,
      userId: currentUser.id,
      userName: currentUser.name,
      email: currentUser.email,
      level: currentUser.level
    });
    return;
  }

  // PUT /api/user - Mettre à jour le profil utilisateur
  async updateUser(req: AuthRequest, res: Response) {
    const { name, email, phone, bio, level, isPrivate, password } = req.body;
    const userId = req.user!.userId;

    try {
      if (email) {
        const existingUser = await this.prisma.user.findUnique({
          where: { email }
        });

        if (existingUser && existingUser.id !== userId) {
          res.status(400).json({ message: "Cet email est déjà utilisé." });
          return;
        }
      }


      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
        : undefined;

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: name || undefined,
          email: email || undefined,
          level: level ?? undefined,
          isPrivate: isPrivate !== undefined ? isPrivate : undefined,
          ...(hashedPassword ? { password: hashedPassword } : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          level: true,
          isPrivate: true,
        }
      });

      res.status(200).json(updatedUser);
    } catch (e: any) {
      res.status(500).json({ message: "Erreur serveur.", error: e.message });
    }
  }

  // GET /api/user/:id/profile - Voir le profil public
  async getPublicProfile(req: AuthRequest, res: Response) {
    const { id } = req.params;
    try {
      const userProfile = await this.prisma.user.findUnique({
        where: { id },
        include: {
          gardenData: {
            select: { name: true, location: true }
          },
          gardenSpaces: {
            select: { spaceName: true }
          },
          _count: {
            select: { topics: true, posts: true, gardenVegetable: true, tutorials: true, comments: true }
          }
        }
      });

      if (!userProfile) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }

      if (userProfile.isPrivate && req.user?.userId !== id) {
        return res.status(200).json({
          id: userProfile.id,
          name: userProfile.name,
          level: userProfile.level,
          createdAt: userProfile.createdAt,
          isPrivate: true,
        });
      }

      return res.status(200).json({
        id: userProfile.id,
        name: userProfile.name,
        level: userProfile.level,
        createdAt: userProfile.createdAt,
        isPrivate: false,
        stats: userProfile._count,
        garden: userProfile.gardenData,
        spaces: userProfile.gardenSpaces,
      });

    } catch (e: any) {
      return res.status(500).json({ message: "Erreur serveur.", error: e.message });
    }
  }

  // POST /api/auth/forgot-password
  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Return 200 to prevent email enumeration
        return res.status(200).json({ message: "Si ce compte existe, un email a été envoyé." });
      }

      // Generate a random 8-character password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      await this.prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      // Email transport configuration
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"Smart Garden" <${process.env.SMTP_USER || "noreply@smartgarden.com"}>`,
        to: email,
        subject: "Smart Garden - Votre nouveau mot de passe",
        text: `Bonjour ${user.name || "Jardinier"},\n\nVous avez demandé la réinitialisation de votre mot de passe.\n\nVoici votre nouveau mot de passe temporaire : ${tempPassword}\n\nNous vous conseillons de le modifier rapidement depuis votre profil.\n\nL'équipe Smart Garden.`,
      };

      // If no SMTP configured, log to console for dev mode
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("\n=== AVERTISSEMENT SMTP NON CONFIGURÉ ===");
        console.warn(`Email qui aurait été envoyé à: ${email}`);
        console.warn(`Nouveau mot de passe généré: ${tempPassword}`);
        console.warn("========================================\n");
      } else {
        await transporter.sendMail(mailOptions);
      }

      return res.status(200).json({ message: "Si ce compte existe, un email a été envoyé." });
    } catch (error: any) {
      console.error("Erreur forgotPassword:", error);
      return res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }
}
