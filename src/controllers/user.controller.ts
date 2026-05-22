import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Login, Signup } from "../../models/models";
import { Request, Response } from "express";
import { Utils } from "../utils";
import { AuthRequest } from "../middleware/auth.middleware";
import crypto from "crypto";

const Mailjet = require("node-mailjet");

export class UserController {
  constructor(
    private prisma: PrismaClient,
    private utils: Utils
  ) { }

  async createUserSession(userId: string): Promise<string> {
    const token = this.utils.generateToken();

    const expireAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    await this.prisma.token.create({
      data: {
        id: token,
        expireAt,
        userId,
      },
    });

    return token;
  }

  async deleteUserSession(userId: string): Promise<void> {
    await this.prisma.token.delete({
      where: { userId },
    });
  }

  async getUser(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res
          .status(401)
          .json({ message: "Auth header is missing" });
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        return res
          .status(401)
          .json({ message: "Token Bearer is missing" });
      }

      const tokenData = await this.prisma.token.findUnique({
        where: { id: token },
      });

      if (!tokenData) {
        return res
          .status(404)
          .json({ message: "Invalid Token" });
      }

      const user = await this.prisma.user.findUnique({
        where: { id: tokenData.userId },
        select: {
          id: true,
          name: true,
          email: true,
          level: true,
          isPrivate: true,
        },
      });

      if (!user) {
        return res
          .status(404)
          .json({ message: "Utilisateur non trouvé" });
      }

      return res.status(200).json(user);
    } catch (error: any) {
      console.error("Erreur getUser:", error);

      return res.status(500).json({
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  async createUser(req: Request<{}, {}, Signup>, res: Response) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          message: "Tous les champs sont requis",
        });
      }

      const alreadyExists =
        await this.prisma.user.findUnique({
          where: { email },
        });

      if (alreadyExists) {
        return res.status(409).json({
          message: "Email déjà utilisé",
        });
      }

      const hashedPassword = await bcrypt.hash(
        password,
        10
      );

      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      const token = await this.createUserSession(
        user.id
      );

      return res.status(201).json({
        token,
      });
    } catch (error: any) {
      console.error("Erreur createUser:", error);

      return res.status(500).json({
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  async login(req: Request<{}, {}, Login>, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email et mot de passe requis",
        });
      }

      const currentUser =
        await this.prisma.user.findUnique({
          where: { email },
        });

      if (!currentUser) {
        return res.status(404).json({
          message: "Utilisateur introuvable",
        });
      }

      const passwordIsValid =
        await bcrypt.compare(
          password,
          currentUser.password
        );

      if (!passwordIsValid) {
        return res.status(403).json({
          message: "Mot de passe invalide",
        });
      }

      const existingToken =
        await this.prisma.token.findUnique({
          where: { userId: currentUser.id },
        });

      if (existingToken) {
        await this.deleteUserSession(
          currentUser.id
        );
      }

      const token =
        await this.createUserSession(
          currentUser.id
        );

      return res.status(200).json({
        token,
        userId: currentUser.id,
        userName: currentUser.name,
        email: currentUser.email,
        level: currentUser.level,
      });
    } catch (error: any) {
      console.error("Erreur login:", error);

      return res.status(500).json({
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  async updateUser(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const {
        name,
        email,
        level,
        isPrivate,
        password,
      } = req.body;

      const userId = req.user!.userId;

      if (email) {
        const existingUser =
          await this.prisma.user.findUnique({
            where: { email },
          });

        if (
          existingUser &&
          existingUser.id !== userId
        ) {
          return res.status(400).json({
            message:
              "Cet email est déjà utilisé.",
          });
        }
      }

      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
        : undefined;

      const updatedUser =
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            name: name || undefined,
            email: email || undefined,
            level:
              level !== undefined
                ? level
                : undefined,
            isPrivate:
              isPrivate !== undefined
                ? isPrivate
                : undefined,
            ...(hashedPassword && {
              password: hashedPassword,
            }),
          },
          select: {
            id: true,
            name: true,
            email: true,
            level: true,
            isPrivate: true,
          },
        });

      return res.status(200).json(updatedUser);
    } catch (error: any) {
      console.error("Erreur updateUser:", error);

      return res.status(500).json({
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  async getPublicProfile(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const { id } = req.params;

      const userProfile =
        await this.prisma.user.findUnique({
          where: { id },
          include: {
            gardenData: {
              select: {
                name: true,
                location: true,
              },
            },
            gardenSpaces: {
              select: {
                spaceName: true,
              },
            },
            _count: {
              select: {
                topics: true,
                posts: true,
                gardenVegetable: true,
                tutorials: true,
                comments: true,
              },
            },
          },
        });

      if (!userProfile) {
        return res.status(404).json({
          message: "Utilisateur non trouvé.",
        });
      }

      if (
        userProfile.isPrivate &&
        req.user?.userId !== id
      ) {
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
    } catch (error: any) {
      console.error(
        "Erreur getPublicProfile:",
        error
      );

      return res.status(500).json({
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  // POST /api/auth/forgot-password
  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email requis",
      });
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      // Toujours même réponse
      if (!user) {
        return res.status(200).json({
          message:
            "Si ce compte existe, un email a été envoyé.",
        });
      }

      // Génération token sécurisé
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Expiration 15 min
      const expireAt = new Date(
        Date.now() + 15 * 60 * 1000
      );

      // Supprime anciens tokens
      await this.prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
        },
      });

      // Création token
      await this.prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          userId: user.id,
          expireAt,
        },
      });

      // URL frontend
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      // Mailjet
      const mailjet = Mailjet.apiConnect(
        process.env.MAILJET_API_KEY,
        process.env.MAILJET_SECRET_KEY
      );

      await mailjet
        .post("send", {
          version: "v3.1",
        })
        .request({
          Messages: [
            {
              From: {
                Email: process.env.MAIL_FROM,
                Name: "Smart Garden",
              },

              To: [
                {
                  Email: email,
                },
              ],

              Subject:
                "Réinitialisation mot de passe",

              TextPart: `Bonjour ${user.name},

  Cliquez sur ce lien pour réinitialiser votre mot de passe :

  ${resetUrl}

  Ce lien expire dans 15 minutes.`,

              HTMLPart: `
                <h2>Réinitialisation mot de passe</h2>

                <p>Bonjour ${user.name},</p>

                <p>
                  Cliquez sur le bouton ci-dessous :
                </p>

                <a href="${resetUrl}"
                  style="
                    background:#22c55e;
                    color:white;
                    padding:12px 20px;
                    text-decoration:none;
                    border-radius:8px;
                    display:inline-block;
                  ">
                  Réinitialiser mon mot de passe
                </a>

                <p>
                  Ce lien expire dans 15 minutes.
                </p>
              `,
            },
          ],
        });

      return res.status(200).json({
        message:
          "Si ce compte existe, un email a été envoyé.",
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token et password requis",
      });
    }

    try {
      const resetToken =
        await this.prisma.passwordResetToken.findUnique({
          where: { token },
        });

      if (!resetToken) {
        return res.status(400).json({
          message: "Token invalide",
        });
      }

      // Vérifie expiration
      if (resetToken.expireAt < new Date()) {
        return res.status(400).json({
          message: "Token expiré",
        });
      }

      const hashedPassword = await bcrypt.hash(
        password,
        10
      );

      // Update password
      await this.prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          password: hashedPassword,
        },
      });

      // Supprime token
      await this.prisma.passwordResetToken.delete({
        where: {
          id: resetToken.id,
        },
      });

      return res.status(200).json({
        message:
          "Mot de passe modifié avec succès",
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }
}