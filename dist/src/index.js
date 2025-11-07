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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const user_controller_1 = require("./controllers/user.controller");
const garden_controller_1 = require("./controllers/garden.controller");
const auth_middleware_1 = require("./middleware/auth.middleware");
const utils_1 = require("./utils");
const sensor_controller_1 = __importDefault(require("./controllers/sensor.controller"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const utils = new utils_1.Utils();
const userController = new user_controller_1.UserController(prisma, utils);
const gardenController = new garden_controller_1.GardenController(prisma, utils);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/api/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield userController.createUser(req, res);
}));
app.post("/api/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield userController.login(req, res);
}));
app.post("/api/genvegetables", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield gardenController.putVegetables(req, res);
}));
app.get("/api/vegetables", (req, res) => gardenController.getAll(req, res));
app.get("/api/user/vegetables", auth_middleware_1.authenticateToken, (req, res) => gardenController.list(req, res));
app.post("/api/user/vegetable", auth_middleware_1.authenticateToken, (req, res) => gardenController.add(req, res));
app.delete("/api/user/vegetable/:id", auth_middleware_1.authenticateToken, (req, res) => gardenController.remove(req, res));
app.use("/api", sensor_controller_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`REST API server ready at: http://localhost:${PORT}`));
//# sourceMappingURL=index.js.map