import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Token manquant.' });
    return;
  }
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      res.status(403).json({ message: 'Token invalide.' });
      return;
    }
    req.user = payload as any;
    next();
  });
}
