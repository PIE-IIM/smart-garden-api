"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GardenController = void 0;
const data_1 = require("../../constants/data");
class GardenController {
    constructor(prisma, utils) {
        this.prisma = prisma;
        this.utils = utils;
    }
    //use to generate vegetables in database
    putVegetables(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(data_1.vegetables.map((vegetable) => __awaiter(this, void 0, void 0, function* () {
                const createdVegetable = yield this.prisma.vegetable.create({
                    data: {
                        name: vegetable.name,
                        description: vegetable.description,
                        specifications: vegetable.specifications,
                        sowing: vegetable.sowing,
                        plantation: vegetable.plantation,
                        harvest: vegetable.harvest,
                        affinity: vegetable.affinity,
                        bad_neighbors: vegetable.bad_neighbors,
                    },
                });
                const vegetableImage = data_1.vegetableImages.find((element) => element.name === vegetable.name);
                if (vegetableImage) {
                    yield this.prisma.vegetableImage.create({
                        data: {
                            url: vegetableImage.url,
                            vegetableId: createdVegetable.id,
                        },
                    });
                }
            })));
            res.status(201).json();
        });
    }
    // GET /api/vegetables (public)
    getAll(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const vegetables = yield this.prisma.vegetable.findMany();
            const images = yield this.prisma.vegetableImage.findMany();
            const vegetablesList = vegetables;
            vegetablesList.map((vegetable) => {
                const vegetableImages = images.filter((image) => image.vegetableId === vegetable.id);
                vegetable.images = vegetableImages.map((image) => image.url);
            });
            res.status(200).json(vegetablesList);
        });
    }
    // POST /api/user/vegetable   body: { vegetableId }
    add(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { vegetableId } = req.body;
            if (!vegetableId) {
                res.status(400).json({ message: "vegetableId requis." });
                return;
            }
            try {
                const createdVegetable = yield this.prisma.gardenVegetable.create({
                    data: { userId: req.user.userId, vegetableId },
                });
                res.status(201).json({ gardenVegetableId: createdVegetable.id });
            }
            catch (e) {
                res.status(500).json({ message: "Erreur serveur." });
            }
        });
    }
    // GET /api/user/vegetables
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this.prisma.gardenVegetable.findMany({
                where: { userId: req.user.userId },
                include: { vegetable: true },
            });
            const images = yield this.prisma.vegetableImage.findMany();
            const vegetablesList = rows.map((row) => {
                const vegetableWithId = Object.assign(Object.assign({}, row.vegetable), { gardenVegetableId: row.id });
                return vegetableWithId;
            });
            vegetablesList.map((vegetable) => {
                const vegetableImages = images.filter((image) => image.vegetableId === vegetable.id);
                vegetable.images = vegetableImages.map((image) => image.url);
            });
            res.status(200).json(vegetablesList);
        });
    }
    // DELETE /api/user/vegetable/:id
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.gardenVegetable.delete({
                    where: { userId: req.user.userId, id: req.params.id },
                });
                res.status(200).json({ success: "success" });
            }
            catch (e) {
                res.status(500).json({ message: "Erreur serveur", error: e.message });
            }
        });
    }
}
exports.GardenController = GardenController;
//# sourceMappingURL=garden.controller.js.map