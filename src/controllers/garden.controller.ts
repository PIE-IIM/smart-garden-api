import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import { Utils } from "../utils";
import { AuthRequest } from "../middleware/auth.middleware";



export interface GardenSpace {
  id?: string,
  name: string,
  area: object[],
}

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
      res.status(500).json({ message: "Error." });

    }
  }

  //POST: /api/gardenspace
  async addGardenSpace(req: AuthRequest, res: Response) {
    const { gardenSpaces } = req.body
    const id = req.user!.userId;

    if (!id || !gardenSpaces) {
      res.status(400).json({ message: "Missing fields" });
      return
    }

    const gardenSpacesDb = await this.prisma.gardenSpace.findMany({
      where: { userId: req.user!.userId },
    });


    try {
      await Promise.all(
        gardenSpaces.map((gardenSpace: GardenSpace) => {

          if (gardenSpace.id) {
            return this.prisma.gardenSpace.update({
              where: { id: gardenSpace.id },
              data: {
                userId: req.user!.userId,
                spaceName: gardenSpace.name,
                area: gardenSpace.area
              }
            })
          } else {
            return this.prisma.gardenSpace.create({
              data: {
                userId: req.user!.userId,
                spaceName: gardenSpace.name,
                area: gardenSpace.area
              }
            })
          }


        }
        )
      )

      res.status(201).json({ message: 'ok' })
    } catch {
      res.status(500).json({ message: "Error." });
    }

  }

  async gardenSpace(req: AuthRequest, res: Response) {
    const rows = await this.prisma.gardenSpace.findMany({
      where: { userId: req.user!.userId },
    });
    res.status(200).json(rows);
  }

  // GET /api/garden - GardenData 
  async getGardenData(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const garden = await this.prisma.gardenData.findUnique({
        where: { userId },
        select: {
          id: true,
          name: true,
          location: true,
          userId: true,
        },
      });

      res.status(200).json(garden ?? null);
    } catch (e: any) {
      res.status(500).json({ message: "Erreur serveur", error: e.message });
    }
  }

  // PUT /api/garden GardenData (name/location)
  async updateGardenData(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { name, location } = req.body as { name?: string; location?: string };

      const garden = await this.prisma.gardenData.upsert({
        where: { userId },
        update: {
          name: name ?? undefined,
          location: location ?? undefined,
        },
        create: {
          name: name ?? "Mon jardin",
          location: location ?? "",
          userId,
        },
        select: {
          id: true,
          name: true,
          location: true,
          userId: true,
        },
      });

      res.status(200).json(garden);
    } catch (e: any) {
      res.status(500).json({ message: "Erreur serveur", error: e.message });
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
      const gardenVegetable = await this.prisma.gardenVegetable.findUnique({
        where: { id: req.params.id },
      });

      if (!gardenVegetable) {
        res.status(404).json({});
        return;
      }

      if (gardenVegetable.userId !== req.user!.userId) {
        res.status(403).json({ message: "Non autorisé" });
        return;
      }

      await this.prisma.gardenVegetable.delete({
        where: { id: req.params.id },
      });

      res.status(200).json({ success: "success" });
    } catch (e: any) {
      res.status(500).json({ message: "Erreur serveur", error: e.message });
    }
  }
}
