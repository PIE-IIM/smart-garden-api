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
    //use to generate vegetables in database
    // async putVegetables(req: Request<{}, {}, Vegetable>, res: Response) {
    //   await Promise.all(
    //     vegetables.map(async (vegetable) => {
    //       const createdVegetable = await this.prisma.vegetable.create({
    //         data: {
    //           name: vegetable.name,
    //           description: vegetable.description,
    //           specifications: vegetable.specifications,
    //           sowing: vegetable.sowing,
    //           plantation: vegetable.plantation,
    //           harvest: vegetable.harvest,
    //           affinity: vegetable.affinity,
    //           bad_neighbors: vegetable.bad_neighbors,
    //         },
    //       });
    //       const vegetableImage = vegetableImages.find(
    //         (element) => element.name === vegetable.name
    //       );
    //       if (vegetableImage) {
    //         await this.prisma.vegetableImage.create({
    //           data: {
    //             url: vegetableImage.url,
    //             vegetableId: createdVegetable.id,
    //           },
    //         });
    //       }
    //     })
    //   );
    //   res.status(201).json();
    // }
    // GET /api/vegetables (public)
    // async getAll(_req: Request, res: Response) {
    //   const vegetables = await this.prisma.vegetable.findMany();
    //   const images = await this.prisma.vegetableImage.findMany();
    //   const vegetablesList: Vegetable[] = vegetables;
    //   vegetablesList.map((vegetable) => {
    //     const vegetableImages = images.filter(
    //       (image: { vegetableId: string; url: string }) => image.vegetableId === vegetable.id
    //     );
    //     vegetable.images = vegetableImages.map((image: { url: string }) => image.url);
    //   });
    //   res.status(200).json(vegetablesList);
    // }
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
        // const images = await this.prisma.vegetableImage.findMany();
        // const vegetablesList: Vegetable[] = rows.map((row: any) => {
        //   const vegetableWithId: Vegetable = {
        //     ...row.vegetable,
        //     gardenVegetableId: row.id,
        //   };
        //   return vegetableWithId;
        // });
        // vegetablesList.map((vegetable) => {
        //   const vegetableImages = images.filter(
        //     (image: { vegetableId: string; url: string }) =>
        //       image.vegetableId === vegetable.id
        //   );
        //   vegetable.images = vegetableImages.map(
        //     (image: { url: string }) => image.url
        //   );
        // });
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