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
const client_1 = require("@prisma/client");
const data_1 = require("./data");
const prisma = new client_1.PrismaClient();
function putVegetablesToDb() {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all(data_1.vegetables.map((element) => {
            prisma.vegetable.create({
                data: {
                    name: element.name,
                    description: element.description,
                    specifications: element.specifications,
                    sowing: element.sowing,
                    plantation: element.plantation,
                    harvest: element.harvest,
                    affinity: element.affinity,
                    bad_neighbors: element.bad_neighbors,
                },
            });
        }));
        yield prisma.$disconnect();
    });
}
putVegetablesToDb();
//# sourceMappingURL=vegetables.js.map