import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Utils } from "../utils";
import { Vegetable, vegetables } from "../../constants/data";

export class GardenController {
  constructor(
    private prisma: PrismaClient,
    private utils: Utils
  ) {}

  async putVegetables(req: Request<{}, {}, Vegetable>, res: Response) {
    try {
      await Promise.all(
        vegetables.map(async (element) => {
          await this.prisma.vegetable.create({
            data: {
              name: element.name,
              description: element.description,
              specifications: element.caracteristiques,
              sowing: element.semis,
              plantation: element.plantation,
              harvest: element.recolte,
              affinity: element.affinites,
              bad_neighbors: element.mauvais_voisins,
            },
          });
        })
      );
      res.status(201).json({ message: "Vegetables added successfully" });
    } catch (error) {
      console.error("Failed to add vegetables:", error);
      res.status(500).json({ error: "Failed to add vegetables" });
    }
  }

  async getVegetables(req: Request, res: Response) {
    try {
      res.status(200).json(vegetables);
    } catch (error) {
      console.error("Failed to retrieve vegetables:", error);
      res.status(500).json({ error: "Failed to retrieve vegetables" });
    }
  }
}
