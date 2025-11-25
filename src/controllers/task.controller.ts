import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

export class TaskController {
  constructor(private prisma: PrismaClient) { }

  // POST /api/task
  async add(req: AuthRequest, res: Response) {
    const { title, description, category, plant, dueDate, priority, reminder } = req.body;
    if (!title) {
      res.status(400).json({ message: "title requis." });
      return;
    }
    try {
      const createdTask = await this.prisma.task.create({
        data: {
          title,
          description,
          category,
          plant,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          priority,
          reminder,
          userId: req.user!.userId,
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
    const { title, description, category, plant, dueDate, priority, reminder } = req.body;
    if (!title) {
      res.status(400).json({ message: "title requis." });
      return;
    }
    try {
      // Vérifier que la tâche appartient à l'utilisateur
      const task = await this.prisma.task.findUnique({ where: { id } });
      if (!task || task.userId !== req.user!.userId) {
        res.status(404).json({ message: "Tâche non trouvée ou non autorisé." });
        return;
      }
      const updatedTask = await this.prisma.task.update({
        where: { id },
        data: {
          title,
          description,
          category,
          plant,
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
}