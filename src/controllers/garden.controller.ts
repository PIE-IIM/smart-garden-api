import { Prisma, PrismaClient, Vegetable } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { Request, Response } from "express";
import { Utils } from "../utils";
import { vegetables } from "../../constants/data";

export class GardenController {
  constructor(
    private prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      DefaultArgs
    >,
    private utils: Utils
  ) {}

  async putVegetables(req: Request<{}, {}, Vegetable>, res: Response) {
    vegetables.map(async element => {
            await this.prisma.vegetable.create({
                data: {
                    name: element.name,
                    description: element.description,
                    specifications: element.caracteristiques,
                    sowing: element.semis,
                    plantation: element.plantation,
                    harvest: element.recolte,
                    affinity: element.affinites,
                    bad_neighbors: element.mauvais_voisins
                }
            })
        })
    res.status(201).json();
    return;
  }
}
