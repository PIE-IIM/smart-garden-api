import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

export class ForumController {
    constructor(private prisma: PrismaClient) { }

    // POST /api/topic - Créer un topic
    async createTopic(req: AuthRequest, res: Response) {
        const { title, content, tagIds } = req.body;

        if (!title || !content) {
            res.status(400).json({ message: "Titre et contenu requis." });
            return;
        }

        try {
            const topic = await this.prisma.topic.create({
                data: {
                    title,
                    content,
                    authorId: req.user!.userId,
                    tags: tagIds?.length ? {
                        create: tagIds.map((tagId: string) => ({
                            tag: { connect: { id: tagId } }
                        }))
                    } : undefined
                },
                include: {
                    author: { select: { id: true, name: true, email: true } },
                    tags: { include: { tag: true } },
                    _count: { select: { comments: true } }
                }
            });

            res.status(201).json(topic);
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // GET /api/topics - Récupérer tous les topics (avec filtrage par tag optionnel)
    async getTopics(req: AuthRequest, res: Response) {
        const { tagId } = req.query;

        try {
            const topics = await this.prisma.topic.findMany({
                where: tagId ? {
                    tags: { some: { tagId: tagId as string } }
                } : undefined,
                include: {
                    author: { select: { id: true, name: true } },
                    tags: { include: { tag: true } },
                    _count: { select: { comments: true } }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.status(200).json(topics);
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // GET /api/topic/:id - Récupérer un topic spécifique avec commentaires
    async getTopic(req: AuthRequest, res: Response) {
        const { id } = req.params;

        try {
            await this.prisma.topic.update({
                where: { id },
                data: { viewCount: { increment: 1 } }
            });

            const topic = await this.prisma.topic.findUnique({
                where: { id },
                include: {
                    author: { select: { id: true, name: true, email: true } },
                    tags: { include: { tag: true } },
                    comments: {
                        include: {
                            author: { select: { id: true, name: true } }
                        },
                        orderBy: { createdAt: 'asc' }
                    },
                    _count: { select: { comments: true } }
                }
            });

            if (!topic) {
                res.status(404).json({ message: "Topic non trouvé." });
                return;
            }

            res.status(200).json(topic);
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // POST /api/topic/:id/comment - Ajouter un commentaire
    async addComment(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const { content } = req.body;

        if (!content) {
            res.status(400).json({ message: "Contenu requis." });
            return;
        }

        try {
            const comment = await this.prisma.comment.create({
                data: {
                    content,
                    topicId: id,
                    authorId: req.user!.userId
                },
                include: {
                    author: { select: { id: true, name: true } }
                }
            });

            res.status(201).json(comment);
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // GET /api/tags - Récupérer tous les tags
    async getTags(req: AuthRequest, res: Response) {
        try {
            const tags = await this.prisma.forumTag.findMany({
                include: {
                    _count: { select: { topics: true } }
                }
            });

            res.status(200).json(tags);
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // POST /api/tag - Créer un tag (admin seulement)
    async createTag(req: AuthRequest, res: Response) {
        const { name } = req.body;

        if (!name) {
            res.status(400).json({ message: "Nom du tag requis." });
            return;
        }

        try {
            const tag = await this.prisma.forumTag.create({
                data: { name }
            });

            res.status(201).json(tag);
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // GET /api/user/stats - Récupérer les stats de l'utilisateur
    async getUserStats(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.userId;

            const topicsCount = await this.prisma.topic.count({
                where: { authorId: userId }
            });

            const commentsCount = await this.prisma.comment.count({
                where: { authorId: userId }
            });

            const plantsCount = await this.prisma.gardenVegetable.count({
                where: { userId }
            });

            res.status(200).json({
                topicsCount,
                commentsCount,
                plantsCount
            });
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }
}
