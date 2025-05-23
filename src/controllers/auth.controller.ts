import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;
const JWT_SECRET = process.env.JWT_SECRET!;

export const signup: RequestHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email et mot de passe requis.' });
      return;
    }
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, email: true, name: true },
    });
    res.status(201).json({ user });
    return;
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ message: 'Email déjà utilisé.' });
      return;
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
    return;
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email et mot de passe requis.' });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });
    if (!user) {
      res.status(401).json({ message: 'Identifiants invalides.' });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: 'Identifiants invalides.' });
      return;
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
    return;
  }
};
