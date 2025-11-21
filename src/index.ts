import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { UserController } from "./controllers/user.controller";
import { GardenController } from "./controllers/garden.controller";
import { authenticateToken, AuthRequest } from "./middleware/auth.middleware";
import { Utils } from "./utils";
import sensorController from "./controllers/sensor.controller";
import forumRoutes from "./routes/forum.routes";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const utils = new Utils();
const userController = new UserController(prisma, utils);
const gardenController = new GardenController(prisma, utils);

app.use(cors());
app.use(express.json());

app.post("/api/signup", async (req, res) => {
  await userController.createUser(req, res);
});

app.post("/api/login", async (req, res) => {
  await userController.login(req, res);
});

app.post("/api/genvegetables", async (req, res) => {
  await gardenController.putVegetables(req, res);
});

app.get("/api/vegetables", (req, res) => gardenController.getAll(req, res));

app.get(
  "/api/user/vegetables",
  authenticateToken as unknown as express.RequestHandler,
  (req: express.Request, res: express.Response) => gardenController.list(req as unknown as AuthRequest, res)
);

app.post(
  "/api/user/vegetable",
  authenticateToken as unknown as express.RequestHandler,
  (req: express.Request, res: express.Response) => gardenController.add(req as unknown as AuthRequest, res)
);

app.delete(
  "/api/user/vegetable/:id",
  authenticateToken as unknown as express.RequestHandler,
  (req: express.Request, res: express.Response) => gardenController.remove(req as unknown as AuthRequest, res)
);

app.use("/api/forum", forumRoutes);

app.use("/api", sensorController);

const PORT = process.env.PORT || 3000;
app
  .listen(PORT, () => {
    console.log(`REST API server ready at: http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server failed to start:", err);
  });
