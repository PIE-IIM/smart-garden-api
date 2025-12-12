import { PrismaClient, TutorialType, TutorialCategory } from "@prisma/client";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

export class SocialController {
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

    // POST /api/topic/:id/comment - Ajouter un commentaire à un topic
    async addTopicComment(req: AuthRequest, res: Response) {
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

    // GET /api/user/topics - Récupérer les topics de l'utilisateur connecté
    async getUserTopics(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.userId;

            const topics = await this.prisma.topic.findMany({
                where: { authorId: userId },
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

    // GET /api/user/comments - Récupérer les commentaires de l'utilisateur connecté (topics)
    async getUserTopicComments(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.userId;

            const comments = await this.prisma.comment.findMany({
                where: { authorId: userId },
                include: {
                    author: { select: { id: true, name: true } },
                    topic: {
                        select: {
                            id: true,
                            title: true,
                            tags: { include: { tag: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.status(200).json(comments);
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // POST /api/post - Créer un post
    async createPost(req: AuthRequest, res: Response) {
        const { content, images } = req.body;

        if (!content) {
            res.status(400).json({ message: "Contenu requis." });
            return;
        }

        try {
            const post = await this.prisma.post.create({
                data: {
                    content,
                    images: images || [],
                    authorId: req.user!.userId,
                },
                include: {
                    author: { select: { id: true, name: true, email: true } },
                    _count: { 
                        select: { 
                            likes: true,
                            comments: true 
                        } 
                    }
                }
            });

            res.status(201).json(post);
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // GET /api/posts - Récupérer tous les posts
    async getPosts(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.userId;

            const posts = await this.prisma.post.findMany({
                include: {
                    author: { select: { id: true, name: true, email: true } },
                    _count: { 
                        select: { 
                            likes: true,
                            comments: true 
                        } 
                    },
                    likes: {
                        where: { userId },
                        select: { id: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            const postsWithLikeStatus = posts.map(post => ({
                ...post,
                isLikedByUser: post.likes.length > 0,
                likes: undefined
            }));

            res.status(200).json(postsWithLikeStatus);
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // POST /api/post/:id/like - Liker/Unliker un post
    async togglePostLike(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const userId = req.user!.userId;

        try {
            const existingLike = await this.prisma.postLike.findUnique({
                where: {
                    postId_userId: {
                        postId: id,
                        userId: userId
                    }
                }
            });

            if (existingLike) {
                await this.prisma.postLike.delete({
                    where: { id: existingLike.id }
                });
                res.status(200).json({ message: "Post unliké.", liked: false });
            } else {
                await this.prisma.postLike.create({
                    data: {
                        postId: id,
                        userId: userId
                    }
                });
                res.status(201).json({ message: "Post liké.", liked: true });
            }
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // POST /api/post/:id/comment - Ajouter un commentaire à un post
    async addPostComment(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const { content } = req.body;

        if (!content) {
            res.status(400).json({ message: "Contenu requis." });
            return;
        }

        try {
            const comment = await this.prisma.postComment.create({
                data: {
                    content,
                    postId: id,
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

    // GET /api/post/:id/comments - Récupérer les commentaires d'un post
    async getPostComments(req: AuthRequest, res: Response) {
        const { id } = req.params;

        try {
            const comments = await this.prisma.postComment.findMany({
                where: { postId: id },
                include: {
                    author: { select: { id: true, name: true } }
                },
                orderBy: { createdAt: 'asc' }
            });

            res.status(200).json(comments);
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // DELETE /api/post/:id - Supprimer un post
    async deletePost(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const userId = req.user!.userId;

        try {
            const post = await this.prisma.post.findUnique({
                where: { id }
            });

            if (!post) {
                res.status(404).json({ message: "Post non trouvé." });
                return;
            }

            if (post.authorId !== userId) {
                res.status(403).json({ message: "Non autorisé." });
                return;
            }

            await this.prisma.post.delete({
                where: { id }
            });

            res.status(200).json({ message: "Post supprimé." });
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // GET /api/user/posts - Récupérer les posts de l'utilisateur connecté
    async getUserPosts(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.userId;

            const posts = await this.prisma.post.findMany({
                where: { authorId: userId },
                include: {
                    author: { select: { id: true, name: true } },
                    _count: { 
                        select: { 
                            likes: true,
                            comments: true 
                        } 
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.status(200).json(posts);
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // POST /api/tutorial - Créer un tutoriel
    async createTutorial(req: AuthRequest, res: Response) {
        const { 
            title, 
            description, 
            type, 
            category,
            videoUrl,
            videoDuration,
            thumbnail,
            content,
            images 
        } = req.body;

        if (!title || !type || !category) {
            res.status(400).json({ message: "Titre, type et catégorie requis." });
            return;
        }

        if (type === 'VIDEO' && !videoUrl) {
            res.status(400).json({ message: "URL de la vidéo requise pour un tutoriel vidéo." });
            return;
        }

        if (type === 'ARTICLE' && !content) {
            res.status(400).json({ message: "Contenu requis pour un article." });
            return;
        }

        try {
            const tutorial = await this.prisma.tutorial.create({
                data: {
                    title,
                    description,
                    type: type as TutorialType,
                    category: category as TutorialCategory,
                    videoUrl,
                    videoDuration,
                    thumbnail,
                    content,
                    images: images || [],
                    authorId: req.user!.userId,
                },
                include: {
                    author: { select: { id: true, name: true } },
                    _count: { select: { likes: true } }
                }
            });

            res.status(201).json(tutorial);
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // GET /api/tutorials - Récupérer tous les tutoriels (avec filtres)
    async getTutorials(req: AuthRequest, res: Response) {
        const { category, type } = req.query;

        try {
            const userId = req.user!.userId;

            const tutorials = await this.prisma.tutorial.findMany({
                where: {
                    ...(category && { category: category as TutorialCategory }),
                    ...(type && { type: type as TutorialType })
                },
                include: {
                    author: { select: { id: true, name: true } },
                    _count: { select: { likes: true } },
                    likes: {
                        where: { userId },
                        select: { id: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            const tutorialsWithLikeStatus = tutorials.map(tutorial => ({
                ...tutorial,
                isLikedByUser: tutorial.likes.length > 0,
                likes: undefined
            }));

            res.status(200).json(tutorialsWithLikeStatus);
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // GET /api/tutorial/:id - Récupérer un tutoriel spécifique
    async getTutorial(req: AuthRequest, res: Response) {
        const { id } = req.params;

        try {
            const userId = req.user!.userId;

            await this.prisma.tutorial.update({
                where: { id },
                data: { viewCount: { increment: 1 } }
            });

            const tutorial = await this.prisma.tutorial.findUnique({
                where: { id },
                include: {
                    author: { select: { id: true, name: true, email: true } },
                    _count: { select: { likes: true } },
                    likes: {
                        where: { userId },
                        select: { id: true }
                    }
                }
            });

            if (!tutorial) {
                res.status(404).json({ message: "Tutoriel non trouvé." });
                return;
            }

            const tutorialWithLikeStatus = {
                ...tutorial,
                isLikedByUser: tutorial.likes.length > 0,
                likes: undefined
            };

            res.status(200).json(tutorialWithLikeStatus);
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // POST /api/tutorial/:id/like - Liker/Unliker un tutoriel
    async toggleTutorialLike(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const userId = req.user!.userId;

        try {
            const existingLike = await this.prisma.tutorialLike.findUnique({
                where: {
                    tutorialId_userId: {
                        tutorialId: id,
                        userId: userId
                    }
                }
            });

            if (existingLike) {
                await this.prisma.tutorialLike.delete({
                    where: { id: existingLike.id }
                });
                res.status(200).json({ message: "Tutoriel unliké.", liked: false });
            } else {
                await this.prisma.tutorialLike.create({
                    data: {
                        tutorialId: id,
                        userId: userId
                    }
                });
                res.status(201).json({ message: "Tutoriel liké.", liked: true });
            }
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // DELETE /api/tutorial/:id - Supprimer un tutoriel
    async deleteTutorial(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const userId = req.user!.userId;

        try {
            const tutorial = await this.prisma.tutorial.findUnique({
                where: { id }
            });

            if (!tutorial) {
                res.status(404).json({ message: "Tutoriel non trouvé." });
                return;
            }

            if (tutorial.authorId !== userId) {
                res.status(403).json({ message: "Non autorisé." });
                return;
            }

            await this.prisma.tutorial.delete({
                where: { id }
            });

            res.status(200).json({ message: "Tutoriel supprimé." });
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // GET /api/user/tutorials - Récupérer les tutoriels de l'utilisateur connecté
    async getUserTutorials(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.userId;

            const tutorials = await this.prisma.tutorial.findMany({
                where: { authorId: userId },
                include: {
                    author: { select: { id: true, name: true } },
                    _count: { select: { likes: true } }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.status(200).json(tutorials);
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // GET /api/categories - Récupérer les catégories disponibles
    async getCategories(req: AuthRequest, res: Response) {
        try {
            const categories = ['ASTUCES', 'DIY', 'TECHNIQUES'];
            res.status(200).json(categories);
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }

    // GET /api/stats - Récupérer les stats de l'utilisateur
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

            const postsCount = await this.prisma.post.count({
                where: { authorId: userId }
            });

            const tutorialsCount = await this.prisma.tutorial.count({
                where: { authorId: userId }
            });

            res.status(200).json({
                topicsCount,
                commentsCount,
                plantsCount,
                postsCount,
                tutorialsCount
            });
        } catch (e: any) {
            res.status(500).json({ message: "Erreur serveur.", error: e.message });
        }
    }
}
