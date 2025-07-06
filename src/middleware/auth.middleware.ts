import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Token manquant." });
    return;
  }
  const tokenRow = await prisma.token.findUnique({
    where: { id: token },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!tokenRow) {
    res.status(403).json({ message: "Token invalide." });
    return;
  }

  if (tokenRow.expireAt < new Date()) {
    res.status(403).json({ message: "Token expiré." });
    return;
  }

  req.user = {
    userId: tokenRow.userId,
    email: tokenRow.user!.email,
  };
  next();
}
