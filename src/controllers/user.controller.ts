import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import bcrypt from "bcryptjs";
import { Login, Signup } from "../../models/models";
import { Request, Response } from "express";

export class UserController {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async createUser(req: Request<{}, {}, Signup>, res: Response) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.sendStatus(403).json();
      return;
    }

    const alreadyExists = await this.prisma.user.findUnique({
      where: { email },
    });
    if (alreadyExists) {
      res.sendStatus(403).json();
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
    res.sendStatus(201).json("ok");
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
      currentUser.password,
    );
    if (!passwordIsValid) {
      res.sendStatus(403);
      return;
    }
    res.sendStatus(200).json("ok");
    return;
  }
}
