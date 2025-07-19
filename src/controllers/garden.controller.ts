import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Utils } from "../utils";
import { vegetables, vegetableImages } from "../../constants/data";
import { Vegetable } from "../../models/models";
import { AuthRequest } from "../middleware/auth.middleware";

export class GardenController {
  constructor(private prisma: PrismaClient, private utils: Utils) {}

  //use to generate vegetables in database
  async putVegetables(req: Request<{}, {}, Vegetable>, res: Response) {
    await Promise.all(
      vegetables.map(async (vegetable) => {
        const createdVegetable = await this.prisma.vegetable.create({
          data: {
            name: vegetable.name,
            description: vegetable.description,
            specifications: vegetable.specifications,
            sowing: vegetable.sowing,
            plantation: vegetable.plantation,
            harvest: vegetable.harvest,
            affinity: vegetable.affinity,
            bad_neighbors: vegetable.bad_neighbors,
          },
        });

        const vegetableImage = vegetableImages.find(
          (element) => element.name === vegetable.name
        );

        if (vegetableImage) {
          await this.prisma.vegetableImage.create({
            data: {
              url: vegetableImage.url,
              vegetableId: createdVegetable.id,
            },
          });
        }
      })
    );

    res.status(201).json();
  }

  // GET /api/vegetables (public)
  async getAll(_req: Request, res: Response) {
    const vegetables = await this.prisma.vegetable.findMany();
    const images = await this.prisma.vegetableImage.findMany();
    const vegetablesList: Vegetable[] = vegetables;
    vegetablesList.map((vegetable) => {
      const vegetableImages = images.filter(
        (image) => image.vegetableId === vegetable.id
      );
      vegetable.images = vegetableImages.map((image) => image.url);
    });
    res.status(200).json(vegetablesList);
  }

  // POST /api/user/vegetable   body: { vegetableId }
  async add(req: AuthRequest, res: Response): Promise<void> {
    const { vegetableId } = req.body as { vegetableId: string };
    if (!vegetableId) {
      res.status(400).json({ message: "vegetableId requis." });
      return;
    }
    try {
      await this.prisma.gardenVegetable.create({
        data: { userId: req.user!.userId, vegetableId },
      });
      res.status(201).json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: "Erreur serveur." });
    }
  }

  // GET /api/user/vegetables
  async list(req: AuthRequest, res: Response) {
    const rows = await this.prisma.gardenVegetable.findMany({
      where: { userId: req.user!.userId },
      include: { vegetable: true },
    });
    const images = await this.prisma.vegetableImage.findMany();
    const vegetablesList: Vegetable[] = rows.map((row) => row.vegetable);
    vegetablesList.map((vegetable) => {
      const vegetableImages = images.filter(
        (image) => image.vegetableId === vegetable.id
      );
      vegetable.images = vegetableImages.map((image) => image.url);
    });
    res.status(200).json(vegetablesList);
  }

  // DELETE /api/user/vegetable/:id
  async remove(req: AuthRequest, res: Response) {
    await this.prisma.gardenVegetable.deleteMany({
      where: { userId: req.user!.userId, vegetableId: req.params.id },
    });
    res.sendStatus(204);
  }
}
