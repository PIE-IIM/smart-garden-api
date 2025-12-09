import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import bcrypt from "bcryptjs";
import { Login, Signup } from "../../models/models";
import { Request, Response } from "express";
import { Utils } from "../utils";
import { AuthRequest } from "../middleware/auth.middleware";

export class UserController {
  constructor(private prisma: PrismaClient, private utils: Utils) {}

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
      select: { id: true, name: true, email: true },
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
      userName: currentUser.name,
      email: currentUser.email,
    });
    return;
  }

  // PUT /api/user - Mettre à jour le profil utilisateur
  async updateUser(req: AuthRequest, res: Response) {
      const { name, email, phone, bio } = req.body;
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

          const updatedUser = await this.prisma.user.update({
              where: { id: userId },
              data: {
                  name: name || undefined,
                  email: email || undefined,
              },
              select: {
                  id: true,
                  name: true,
                  email: true,
              }
          });

          res.status(200).json(updatedUser);
      } catch (e: any) {
          res.status(500).json({ message: "Erreur serveur.", error: e.message });
      }
  }
}
