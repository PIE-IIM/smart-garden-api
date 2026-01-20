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
import { SocialController } from "./controllers/social.controller";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const utils = new Utils();
const userController = new UserController(prisma, utils);
const gardenController = new GardenController(prisma, utils);
const taskController = new TaskController(prisma);
const socialController = new SocialController(prisma);

app.use(cors());
app.use(express.json());

// ===== AUTH =====
app.post("/api/signup", async (req, res) => {
  await userController.createUser(req, res);
});

app.post("/api/login", async (req, res) => {
  await userController.login(req, res);
});

// ===== USER =====
app.get("/api/user", authenticateToken, async (req, res) => {
  await userController.getUser(req, res);
});

app.put("/api/user", authenticateToken, async (req, res) => {
  await userController.updateUser(req, res);
});

app.get("/api/stats", authenticateToken, async (req, res) => {
  await socialController.getUserStats(req, res);
});

// ===== GARDEN =====
app.get("/api/user/vegetables", authenticateToken, (req, res) =>
  gardenController.list(req, res)
);

app.post("/api/user/vegetable", authenticateToken, (req, res) =>
  gardenController.add(req, res)
);

app.post("/api/onboarding", authenticateToken, (req, res) =>
  gardenController.addOnboarding(req, res)
)

app.post("/api/gardenspace", authenticateToken, (req, res) =>
  gardenController.addGardenSpace(req, res)
)

app.get("/api/gardenspace", authenticateToken, (req, res) =>
  gardenController.gardenSpace(req, res)
)

app.delete("/api/user/vegetable/:id", authenticateToken, (req, res) =>
  gardenController.remove(req, res)
);

// ===== SENSORS =====
app.use("/api", sensorController);

// ===== TASKS =====
app.get("/api/task", authenticateToken, (req, res) =>
  taskController.list(req, res)
);

app.post("/api/task", authenticateToken, (req, res) =>
  taskController.add(req, res)
);

app.put("/api/task/:id", authenticateToken, (req, res) =>
  taskController.edit(req, res)
);

app.delete("/api/task/:id", authenticateToken, (req, res) =>
  taskController.remove(req, res)
);

app.patch("/api/task/:id/toggle", authenticateToken, (req, res) =>
  taskController.toggle(req, res)
);

// ===== FORUM / TOPICS =====
app.get("/api/tags", authenticateToken, (req, res) =>
  socialController.getTags(req, res)
);

app.post("/api/tag", authenticateToken, (req, res) =>
  socialController.createTag(req, res)
);

app.post("/api/topic", authenticateToken, (req, res) =>
  socialController.createTopic(req, res)
);

app.get("/api/topics", authenticateToken, (req, res) =>
  socialController.getTopics(req, res)
);

app.get("/api/topic/:id", authenticateToken, (req, res) =>
  socialController.getTopic(req, res)
);

app.post("/api/topic/:id/comment", authenticateToken, (req, res) =>
  socialController.addTopicComment(req, res)
);

app.get("/api/user/topics", authenticateToken, (req, res) =>
  socialController.getUserTopics(req, res)
);

app.get("/api/user/comments", authenticateToken, (req, res) =>
  socialController.getUserTopicComments(req, res)
);

// ===== POSTS (Social) =====
app.post("/api/post", authenticateToken, (req, res) =>
  socialController.createPost(req, res)
);

app.get("/api/posts", authenticateToken, (req, res) =>
  socialController.getPosts(req, res)
);

app.post("/api/post/:id/like", authenticateToken, (req, res) =>
  socialController.togglePostLike(req, res)
);

app.post("/api/post/:id/comment", authenticateToken, (req, res) =>
  socialController.addPostComment(req, res)
);

app.get("/api/post/:id/comments", authenticateToken, (req, res) =>
  socialController.getPostComments(req, res)
);

app.delete("/api/post/:id", authenticateToken, (req, res) =>
  socialController.deletePost(req, res)
);

app.get("/api/user/posts", authenticateToken, (req, res) =>
  socialController.getUserPosts(req, res)
);

// ===== TUTORIALS =====
app.post("/api/tutorial", authenticateToken, (req, res) =>
  socialController.createTutorial(req, res)
);

app.get("/api/tutorials", authenticateToken, (req, res) =>
  socialController.getTutorials(req, res)
);

app.get("/api/tutorial/:id", authenticateToken, (req, res) =>
  socialController.getTutorial(req, res)
);

app.post("/api/tutorial/:id/like", authenticateToken, (req, res) =>
  socialController.toggleTutorialLike(req, res)
);

app.delete("/api/tutorial/:id", authenticateToken, (req, res) =>
  socialController.deleteTutorial(req, res)
);

app.get("/api/user/tutorials", authenticateToken, (req, res) =>
  socialController.getUserTutorials(req, res)
);

app.get("/api/categories", authenticateToken, (req, res) =>
  socialController.getCategories(req, res)
);

const PORT = process.env.PORT || 3000;
app
  .listen(PORT, () => {
    console.log(`REST API server ready at: http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server failed to start:", err);
  });
