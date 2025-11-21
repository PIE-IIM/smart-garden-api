import { PrismaClient } from "@prisma/client";
import { ForumController } from "../controllers/forum.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { Router, RequestHandler } from "express";

const router = Router();
const prisma = new PrismaClient();
const forumController = new ForumController(prisma);

router.get("/categories", (req, res) => forumController.listCategories(req, res));
router.get("/topics", (req, res) => forumController.listTopics(req, res));
router.post("/topics", authenticateToken as RequestHandler, (req, res) => forumController.createTopic(req, res));
router.post("/comments", authenticateToken as RequestHandler, (req, res) => forumController.addComment(req, res));
router.post("/topics/solve", authenticateToken as RequestHandler, (req, res) => forumController.markAsSolved(req, res));

export default router;
