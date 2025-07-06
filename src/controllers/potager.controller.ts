import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Utils } from "../utils";


export class PotagerController {
  constructor(private prisma: PrismaClient, private utils: Utils) {}

  // POST /api/user/vegetable   body: { vegetableId }
async add(req: AuthRequest, res: Response): Promise<void> {
const { vegetableId } = req.body as { vegetableId: string };
if (!vegetableId) {
    res.status(400).json({ message: 'vegetableId requis.' });
    return;             
}

try {
    await this.prisma.potager.create({ data: { userId: req.user!.userId, vegetableId } });
    res.sendStatus(201);   
} catch (e: any) {
    if (e.code === 'P2002')
    res.status(409).json({ message: 'Déjà ajouté.' });
    else
    res.status(500).json({ message: 'Erreur serveur.' });
}
}

    // GET /api/user/vegetables
  async list(req: AuthRequest, res: Response) {
    const rows = await this.prisma.potager.findMany({
      where  : { userId: req.user!.userId },
      include: { vegetable: true },
    });
    res.status(200).json(rows.map(r => r.vegetable));
  }


  // DELETE /api/user/vegetable/:id
  async remove(req: AuthRequest, res: Response) {
    await this.prisma.potager.deleteMany({
      where: { userId: req.user!.userId, vegetableId: req.params.id },
    });
    res.sendStatus(204);
  }
}
