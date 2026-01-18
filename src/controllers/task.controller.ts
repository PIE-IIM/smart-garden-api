import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

export class TaskController {
  constructor(private prisma: PrismaClient) {}

  // POST /api/task
  async add(req: AuthRequest, res: Response) {
    const { title, description, category, plantId, dueDate, priority, reminder } = req.body;
    if (!title) {
      res.status(400).json({ message: "title requis." });
      return;
    }

    try {
      if (plantId) {
        const gardenVegetable = await this.prisma.gardenVegetable.findUnique({
          where: { id: plantId },
        });
        if (!gardenVegetable || gardenVegetable.userId !== req.user!.userId) {
          res.status(400).json({ message: "Plante invalide ou non autorisée." });
          return;
        }
      }

      const createdTask = await this.prisma.task.create({
        data: {
          title,
          description,
          category,
          plantId: plantId || null,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          priority,
          reminder,
          user: {
            connect: { id: req.user!.userId },
          },
        },
      });

      res.status(201).json({ taskId: createdTask.id });
    } catch (e: any) {
      res.status(500).json({ message: "Erreur serveur.", error: e.message });
    }
  }

  // PUT /api/task/:id
  async edit(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { title, description, category, plantId, dueDate, priority, reminder } = req.body;
    if (!title) {
      res.status(400).json({ message: "title requis." });
      return;
    }

    try {
      const task = await this.prisma.task.findUnique({ where: { id } });
      if (!task || task.userId !== req.user!.userId) {
        res.status(404).json({ message: "Tâche non trouvée ou non autorisé." });
        return;
      }

      if (plantId) {
        const gardenVegetable = await this.prisma.gardenVegetable.findUnique({
          where: { id: plantId },
        });
        if (!gardenVegetable || gardenVegetable.userId !== req.user!.userId) {
          res.status(400).json({ message: "Plante invalide ou non autorisée." });
          return;
        }
      }

      const updatedTask = await this.prisma.task.update({
        where: { id },
        data: {
          title,
          description,
          category,
          plantId: plantId || null,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          priority,
          reminder,
        },
      });

      res.status(200).json({ success: true, task: updatedTask });
    } catch (e: any) {
      res.status(500).json({ message: "Erreur serveur.", error: e.message });
    }
  }

  // DELETE /api/task/:id
  async remove(req: AuthRequest, res: Response) {
    const { id } = req.params;
    try {
      const task = await this.prisma.task.findUnique({ where: { id } });
      if (!task || task.userId !== req.user!.userId) {
        res.status(404).json({ message: "Tâche non trouvée ou non autorisé." });
        return;
      }
      await this.prisma.task.delete({ where: { id } });
      res.status(200).json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: "Erreur serveur", error: e.message });
    }
  }

  // GET /api/task
  async list(req: AuthRequest, res: Response) {
    try {
      const tasks = await this.prisma.task.findMany({
        where: { userId: req.user!.userId },
        orderBy: { dueDate: "asc" },
        include: {
          plant: true,
        },
      });
      res.status(200).json({ tasks });
    } catch (e: any) {
      res.status(500).json({ message: "Erreur serveur.", error: e.message });
    }
  }
}