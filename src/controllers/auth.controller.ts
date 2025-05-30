import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10");
const JWT_SECRET = process.env.JWT_SECRET!;



export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email et mot de passe requis." });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });
    if (!user) {
      res.status(401).json({ message: "Identifiants invalides." });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: "Identifiants invalides." });
      return;
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
    return;
  }
};
