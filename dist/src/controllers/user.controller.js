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
exports.UserController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserController {
    constructor(prisma, utils) {
        this.prisma = prisma;
        this.utils = utils;
    }
    createUserSession(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = this.utils.generateToken();
            const now = new Date();
            const expireAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            yield this.prisma.token.create({
                data: {
                    id: token,
                    expireAt: expireAt,
                    userId: userId,
                },
            });
            return token;
        });
    }
    deleteUserSession(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.token.delete({
                where: { userId: userId },
            });
        });
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ message: "Auth header is missing" });
            }
            const token = authHeader.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: "Token Bearer is missing" });
            }
            const tokenData = yield this.prisma.token.findUnique({
                where: { id: token },
            });
            if (!tokenData) {
                return res.status(404).json({ message: "Invalid Token" });
            }
            const user = yield this.prisma.user.findUnique({
                where: { id: tokenData.userId },
                select: { id: true, name: true, email: true },
            });
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }
            res.status(200).json(user);
        });
    }
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                res.status(403).json();
                return;
            }
            const alreadyExists = yield this.prisma.user.findUnique({
                where: { email },
            });
            if (alreadyExists) {
                res.status(403).json();
                return;
            }
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            yield this.prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
            });
            const currentUser = yield this.prisma.user.findUnique({
                where: { email },
            });
            if (!currentUser) {
                res.sendStatus(500);
                return;
            }
            const token = yield this.createUserSession(currentUser.id);
            res.status(201).json({ token: token });
            return;
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            if (!email || !password) {
                res.sendStatus(403);
                return;
            }
            const currentUser = yield this.prisma.user.findUnique({
                where: { email },
            });
            if (!currentUser) {
                res.sendStatus(404);
                return;
            }
            const passwordIsValid = yield bcryptjs_1.default.compare(password, currentUser.password);
            if (!passwordIsValid) {
                res.sendStatus(403);
                return;
            }
            const userHasToken = yield this.prisma.token.findUnique({
                where: { userId: currentUser.id },
            });
            if (userHasToken) {
                yield this.deleteUserSession(currentUser.id);
            }
            const token = yield this.createUserSession(currentUser.id);
            res.status(200).json({
                token: token,
                userName: currentUser.name,
                email: currentUser.email,
            });
            return;
        });
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map