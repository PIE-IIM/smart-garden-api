import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Utils } from "../utils";
import { Vegetable, vegetables, vegetableImages } from "../../constants/data";

export class GardenController {
  constructor(private prisma: PrismaClient, private utils: Utils) {}

  //use to generate vegetables in database
  async putVegetables(req: Request<{}, {}, Vegetable>, res: Response) {
    vegetables.map(async (vegetable) => {
      await this.prisma.vegetable.create({
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
      const currentVegetable = await this.prisma.vegetable.findFirst({
        where: { name: vegetable.name },
      });

      if (vegetableImage && currentVegetable) {
        await this.prisma.vegetableImage.create({
          data: {
            url: vegetableImage.url,
            vegetableId: currentVegetable.id,
          },
        });
      }
    });
    res.status(201).json();
    return;
  }

  // GET /api/vegetables (public)
  async getAll(_req: Request, res: Response) {
    const list = await this.prisma.vegetable.findMany({
      orderBy: { name: "asc" },
    });
    res.status(200).json(list);
  }
}
