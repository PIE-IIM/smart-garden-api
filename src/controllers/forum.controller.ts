import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

// Augment Express request to include `user` added by authentication middleware
declare module 'express-serve-static-core' {
    interface Request {
        user?: { userId?: string | number | bigint };
    }
}

export class ForumController {
    constructor(private prisma: PrismaClient) { }

    // Catégories
    async listCategories(_req: Request, res: Response) {
        const categories = await (this.prisma as any).forumCategory.findMany();
        res.status(200).json(categories);
    }

    // Topics list paginée/filtrée + recherche
    async listTopics(req: Request, res: Response) {
        const { page = 1, limit = 10, categoryId, search, tagId } = req.query;
        let where: any = {};
        if (categoryId) where.categoryId = BigInt(categoryId as string);
        if (search)
            where.title = { contains: search as string, mode: "insensitive" };
        if (tagId) {
            where.topicTags = { some: { tagId: BigInt(tagId as string) } };
        }

        const topics = await (this.prisma as any).forumTopic.findMany({
            where,
            skip: (+page - 1) * +limit,
            take: +limit,
            include: {
                user: true,
                category: true,
                topicTags: { include: { tag: true } },
                comments: true,
            },
            orderBy: { createdAt: "desc" }, // ou paramétrable
        });
        res.status(200).json(topics);
    }

    // Créer un topic
    async createTopic(req: Request, res: Response) {
        const { title, content, categoryId, tags = [] } = req.body;
        const userId = req.user?.userId;
        if (!userId || !title || !categoryId) {
            res.status(400).json({ error: "Manque des champs." });
            return;
        }
        const topic = await (this.prisma as any).forumTopic.create({
            data: {
                title,
                userId,
                categoryId: BigInt(categoryId),
                topicTags: {
                    create: tags.map((tagId: string) => ({ tagId: BigInt(tagId) })),
                },
                comments: {
                    create: content ? [{ content, userId }] : [],
                },
            },
            include: { comments: true, topicTags: true },
        });
        res.status(201).json(topic);
    }

    // Ajouter une réponse à un topic
    async addComment(req: Request, res: Response) {
        const { topicId, content } = req.body;
        const userId = req.user?.userId;
        if (!userId || !content || !topicId) {
            res.status(400).json({ error: "Manque des champs." });
            return;
        }
        const comment = await (this.prisma as any).forumComment.create({
            data: {
                topicId: BigInt(topicId),
                userId,
                content,
            },
        });
        res.status(201).json(comment);
    }

    // Marquer une réponse comme solution
    async markAsSolved(req: Request, res: Response) {
        const { topicId } = req.body;
        await (this.prisma as any).forumTopic.update({
            where: { id: BigInt(topicId) },
            data: { solved: true },
        });
        res.status(200).json({ success: true });
    }
}
