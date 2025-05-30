import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import bcrypt from "bcryptjs";
import { Signup } from "../../models/models";
import { Request, Response } from "express";

export class UserController {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

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
    res.status(201).json("ok");
    return;
  }
}
