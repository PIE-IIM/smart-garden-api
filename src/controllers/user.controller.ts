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
          publicName: true,
          email: true,
          level: true,
          isPrivate: true,
          isPremium: true,
          language: true,
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
          publicName: name,
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
        isPrivate: currentUser.isPrivate,
        publicName: currentUser.publicName,
        isPremium: currentUser.isPremium,
        language: currentUser.language,
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
        publicName,
        isPremium,
        language,
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
            publicName:
              publicName !== undefined
                ? publicName
                : undefined,
            isPremium:
              isPremium !== undefined
                ? isPremium
                : undefined,
            language:
              language !== undefined
                ? language
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
            publicName: true,
            isPremium: true,
            language: true,
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
      console.log(
        `Demande reset password pour : ${email}`
      );

      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(200).json({
          message:
            "Si ce compte existe, un email a été envoyé.",
        });
      }

      // Vérification ENV
      if (
        !process.env.MAILJET_API_KEY ||
        !process.env.MAILJET_SECRET_KEY ||
        !process.env.MAIL_FROM
      ) {
        console.error(
          "Variables Mailjet manquantes"
        );

        return res.status(500).json({
          message:
            "Configuration email manquante",
        });
      }

      const tempPassword = crypto
        .randomBytes(9)
        .toString("base64url")
        .slice(0, 12);

      const hashedPassword = await bcrypt.hash(
        tempPassword,
        10
      );

      const mailjet = Mailjet.apiConnect(
        process.env.MAILJET_API_KEY,
        process.env.MAILJET_SECRET_KEY
      );

      console.log(
        "Tentative d'envoi email Mailjet API..."
      );

      const result = await mailjet
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
                "🌱 Smart Garden • Réinitialisation du mot de passe",

              TextPart: `
  Bonjour ${user.name || "Jardinier"},

  Vous avez demandé la réinitialisation de votre mot de passe.

  Votre mot de passe temporaire :

  ${tempPassword}

  Nous vous recommandons de le modifier rapidement depuis votre profil.

  L'équipe Smart Garden.
  `,

              HTMLPart: `
  <div style="
    background:#f4f7f5;
    padding:40px 20px;
    font-family:Arial,sans-serif;
  ">
    <div style="
      max-width:600px;
      margin:auto;
      background:white;
      border-radius:20px;
      overflow:hidden;
      box-shadow:0 10px 30px rgba(0,0,0,0.08);
    ">

      <!-- HEADER -->
      <div style="
        background:linear-gradient(135deg,#22c55e,#16a34a);
        padding:40px 20px;
        text-align:center;
        color:white;
      ">
        <h1 style="
          margin:0;
          font-size:32px;
        ">
          🌱 Smart Garden
        </h1>

        <p style="
          margin-top:10px;
          font-size:16px;
          opacity:0.9;
        ">
          Réinitialisation du mot de passe
        </p>
      </div>

      <!-- CONTENT -->
      <div style="
        padding:40px 30px;
        color:#1f2937;
      ">
        <h2 style="
          margin-top:0;
          font-size:24px;
        ">
          Bonjour ${user.name || "Jardinier"} 👋
        </h2>

        <p style="
          font-size:16px;
          line-height:1.7;
          color:#4b5563;
        ">
          Vous avez demandé la réinitialisation de votre mot de passe.
        </p>

        <p style="
          font-size:16px;
          line-height:1.7;
          color:#4b5563;
        ">
          Voici votre nouveau mot de passe temporaire :
        </p>

        <!-- PASSWORD BOX -->
        <div style="
          background:#f3f4f6;
          border:2px dashed #22c55e;
          border-radius:14px;
          padding:20px;
          text-align:center;
          margin:30px 0;
        ">
          <span style="
            font-size:28px;
            font-weight:bold;
            letter-spacing:3px;
            color:#16a34a;
          ">
            ${tempPassword}
          </span>
        </div>

        <p style="
          font-size:15px;
          line-height:1.7;
          color:#6b7280;
        ">
          Pour votre sécurité, nous vous recommandons
          de modifier ce mot de passe dès votre prochaine connexion.
        </p>

        <!-- BUTTON -->
        <div style="
          text-align:center;
          margin-top:35px;
        ">
          <a href="smartgarden://login"
            style="
              background:#22c55e;
              color:white;
              padding:14px 28px;
              border-radius:12px;
              text-decoration:none;
              font-weight:bold;
              display:inline-block;
              font-size:16px;
            ">
            Ouvrir Smart Garden
          </a>
        </div>
      </div>

      <!-- FOOTER -->
      <div style="
        background:#f9fafb;
        padding:25px;
        text-align:center;
        font-size:13px;
        color:#9ca3af;
        border-top:1px solid #e5e7eb;
      ">
        © ${new Date().getFullYear()} Smart Garden<br/>
        Prenez soin de votre jardin 🌿
      </div>
    </div>
  </div>
  `,
            },
          ],
        });

      console.log(
        "Email envoyé avec succès !"
      );

      console.log(result.body);

      await this.prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
        },
      });

      console.log(
        "Mot de passe mis à jour."
      );

      return res.status(200).json({
        message:
          "Si ce compte existe, un email a été envoyé.",
      });
    } catch (error: any) {
      console.error(
        "Erreur forgotPassword:",
        error
      );

      return res.status(500).json({
        message:
          "Impossible d'envoyer l'email",
        error: error.message,
      });
    }
  }
}