"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GardenController = void 0;
class GardenController {
    prisma;
    utils;
    constructor(prisma, utils) {
        this.prisma = prisma;
        this.utils = utils;
    }
    // POST /api/user/vegetable   body: { vegetableId }
    async add(req, res) {
        const { vegetableId } = req.body;
        if (!vegetableId) {
            res.status(400).json({ message: "vegetableId requis." });
            return;
        }
        try {
            const createdVegetable = await this.prisma.gardenVegetable.create({
                data: { userId: req.user.userId, vegetableId },
            });
            res.status(201).json({ gardenVegetableId: createdVegetable.id });
        }
        catch (e) {
            res.status(500).json({ message: "Erreur serveur." });
        }
    }
    // GET /api/user/vegetables
    async list(req, res) {
        const rows = await this.prisma.gardenVegetable.findMany({
            where: { userId: req.user.userId },
        });
        res.status(200).json(rows);
    }
    // DELETE /api/user/vegetable/:id
    async remove(req, res) {
        try {
            await this.prisma.gardenVegetable.delete({
                where: { userId: req.user.userId, id: req.params.id },
            });
            res.status(200).json({ success: "success" });
        }
        catch (e) {
            res.status(500).json({ message: "Erreur serveur", error: e.message });
        }
    }
}
exports.GardenController = GardenController;
//# sourceMappingURL=garden.controller.js.map