import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Utils } from "../utils";
import { Vegetable, vegetables } from "../../constants/data";

export class GardenController {
  constructor(private prisma: PrismaClient, private utils: Utils) {}

  //use to generate vegetables in database
  async putVegetables(req: Request<{}, {}, Vegetable>, res: Response) {
    vegetables.map(async (element) => {
      await this.prisma.vegetable.create({
        data: {
          name: element.name,
          description: element.description,
          specifications: element.specifications,
          sowing: element.sowing,
          plantation: element.plantation,
          harvest: element.harvest,
          affinity: element.affinity,
          bad_neighbors: element.bad_neighbors,
        },
      });
    });
    res.status(201).json();
    return;
  }
}
