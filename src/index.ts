import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { UserController } from "./controllers/user.controller";
import { GardenController } from "./controllers/garden.controller";
import { authenticateToken } from "./middleware/auth.middleware";
import { Utils } from "./utils";
import sensorController from "./controllers/sensor.controller";
import { TaskController } from "./controllers/task.controller";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const utils = new Utils();
const userController = new UserController(prisma, utils);
const gardenController = new GardenController(prisma, utils);
const taskController = new TaskController(prisma);

app.use(cors());
app.use(express.json());

app.post("/api/signup", async (req, res) => {
  await userController.createUser(req, res);
});

app.post("/api/login", async (req, res) => {
  await userController.login(req, res);
});

// app.get("/api/vegetables", (req, res) => gardenController.getAll(req, res));

app.get("/api/user", authenticateToken, async (req, res) => {
  await userController.getUser(req, res);
});

app.get("/api/user/vegetables", authenticateToken, (req, res) =>
  gardenController.list(req, res)
);

app.post("/api/user/vegetable", authenticateToken, (req, res) =>
  gardenController.add(req, res)
);

app.delete("/api/user/vegetable/:id", authenticateToken, (req, res) =>
  gardenController.remove(req, res)
);

app.use("/api", sensorController);

app.post("/api/task", authenticateToken, (req, res) =>
  taskController.add(req, res)
);

app.put("/api/task/:id", authenticateToken, (req, res) =>
  taskController.edit(req, res)
);

app.delete("/api/task/:id", authenticateToken, (req, res) =>
  taskController.remove(req, res)
);

const PORT = process.env.PORT || 3000;
app
  .listen(PORT, () => {
    console.log(`REST API server ready at: http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server failed to start:", err);
  });
