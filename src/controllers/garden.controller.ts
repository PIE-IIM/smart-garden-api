import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Utils } from "../utils";
import { vegetables, vegetableImages } from "../../constants/data";
import { Vegetable } from "../../models/models";

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
    const vegetables = await this.prisma.vegetable.findMany();
    const images = await this.prisma.vegetableImage.findMany();
    const vegetableList: Vegetable[] = vegetables;
    vegetableList.map((vegetable) => {
      const vegetableImages = images.filter(
        (image) => image.vegetableId === vegetable.id
      );
      vegetable.images = vegetableImages.map((image) => image.url);
    });
    res.status(200).json(vegetableList);
  }
}
