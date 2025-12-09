"use strict";
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
const task_controller_1 = require("./controllers/task.controller");
const forum_controller_1 = require("./controllers/forum.controller");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const utils = new utils_1.Utils();
const userController = new user_controller_1.UserController(prisma, utils);
const gardenController = new garden_controller_1.GardenController(prisma, utils);
const taskController = new task_controller_1.TaskController(prisma);
const forumController = new forum_controller_1.ForumController(prisma);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/api/signup", async (req, res) => {
    await userController.createUser(req, res);
});
app.post("/api/login", async (req, res) => {
    await userController.login(req, res);
});
app.get("/api/stats", auth_middleware_1.authenticateToken, async (req, res) => {
    await forumController.getUserStats(req, res);
});

app.get("/api/user/vegetables", auth_middleware_1.authenticateToken, (req, res) => gardenController.list(req, res));
app.get("/api/user", auth_middleware_1.authenticateToken, async (req, res) => {
    await userController.getUser(req, res);
});
app.put("/api/user", auth_middleware_1.authenticateToken, async (req, res) => {
    await userController.updateUser(req, res);
});
app.get("/api/user/topics", auth_middleware_1.authenticateToken, (req, res) => forumController.getUserTopics(req, res));
app.get("/api/user/comments", auth_middleware_1.authenticateToken, (req, res) => forumController.getUserComments(req, res));
app.post("/api/user/vegetable", auth_middleware_1.authenticateToken, (req, res) => gardenController.add(req, res));
app.delete("/api/user/vegetable/:id", auth_middleware_1.authenticateToken, (req, res) => gardenController.remove(req, res));
app.use("/api", sensor_controller_1.default);
app.get("/api/tags", auth_middleware_1.authenticateToken, (req, res) => forumController.getTags(req, res));
app.post("/api/tag", auth_middleware_1.authenticateToken, (req, res) => forumController.createTag(req, res));
app.post("/api/topic", auth_middleware_1.authenticateToken, (req, res) => forumController.createTopic(req, res));
app.get("/api/topics", auth_middleware_1.authenticateToken, (req, res) => forumController.getTopics(req, res));
app.get("/api/topic/:id", auth_middleware_1.authenticateToken, (req, res) => forumController.getTopic(req, res));
app.post("/api/topic/:id/comment", auth_middleware_1.authenticateToken, (req, res) => forumController.addComment(req, res));
const PORT = process.env.PORT || 3000;
app
    .listen(PORT, () => {
    console.log(`REST API server ready at: http://localhost:${PORT}`);
})
    .on("error", (err) => {
    console.error("Server failed to start:", err);
});
app.get("/api/task", auth_middleware_1.authenticateToken, (req, res) => taskController.list(req, res));
app.post("/api/task", auth_middleware_1.authenticateToken, (req, res) => taskController.add(req, res));
app.put("/api/task/:id", auth_middleware_1.authenticateToken, (req, res) => taskController.edit(req, res));
app.delete("/api/task/:id", auth_middleware_1.authenticateToken, (req, res) => taskController.remove(req, res));
//# sourceMappingURL=index.js.map