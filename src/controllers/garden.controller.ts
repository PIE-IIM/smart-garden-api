import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { Request, Response } from "express";
import { Utils } from "../utils";
import { Vegetable, vegetables } from "../../constants/data";

export class GardenController {
  constructor(
    private prisma: PrismaClient,
    private utils: Utils
  ) {}

  //use to generate vegetables in database
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
