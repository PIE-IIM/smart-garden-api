import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import { Utils } from "../utils";
import { AuthRequest } from "../middleware/auth.middleware";

export class GardenController {
  constructor(private prisma: PrismaClient, private utils: Utils) { }

  // POST /api/user/vegetable   body: { vegetableId }
  async add(req: AuthRequest, res: Response): Promise<void> {
    const { vegetableId } = req.body as { vegetableId: string };
    if (!vegetableId) {
      res.status(400).json({ message: "vegetableId requis." });
      return;
    }
    try {
      const createdVegetable = await this.prisma.gardenVegetable.create({
        data: { userId: req.user!.userId, vegetableId },
      });
      res.status(201).json({ gardenVegetableId: createdVegetable.id });
    } catch (e: any) {
      res.status(500).json({ message: "Erreur serveur." });
    }
  }

  // POST /api/onboarding
  async addOnboarding(req: AuthRequest, res: Response) {
    const { level, gardenName, gardenLocation } = req.body
    const id = req.user!.userId;

    if (!level || !gardenName || !gardenLocation || !id) {
      res.status(400).json({ message: "Missing fields" });
      return
    }
    try {
      await this.prisma.gardenData.create({
        data: { name: gardenName, location: gardenLocation, userId: req.user!.userId }
      })
      await this.prisma.user.update({
        where: { id },
        data: {
          level: level
        }
      })
      res.status(201).json({ message: 'ok' })
    } catch (e: any) {
      res.status(500).json({ message: "Erreur serveur." });

    }
  }

  // GET /api/user/vegetables
  async list(req: AuthRequest, res: Response) {
    const rows = await this.prisma.gardenVegetable.findMany({
      where: { userId: req.user!.userId },
    });
    res.status(200).json(rows);
  }

  // DELETE /api/user/vegetable/:id
  async remove(req: AuthRequest, res: Response) {
    try {
      await this.prisma.gardenVegetable.delete({
        where: { userId: req.user!.userId, id: req.params.id },
      });
      res.status(200).json({ success: "success" });
    } catch (e: any) {
      res.status(500).json({ message: "Erreur serveur", error: e.message });
    }
  }
}
