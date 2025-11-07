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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function authenticateToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const authHeader = req.headers["authorization"];
        const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Token manquant." });
            return;
        }
        const tokenRow = yield prisma.token.findUnique({
            where: { id: token },
            include: { user: { select: { id: true, email: true } } },
        });
        if (!tokenRow) {
            res.status(403).json({ message: "Token invalide." });
            return;
        }
        if (tokenRow.expireAt < new Date()) {
            res.status(403).json({ message: "Token expiré." });
            return;
        }
        req.user = {
            userId: tokenRow.userId,
            email: tokenRow.user.email,
        };
        next();
    });
}
//# sourceMappingURL=auth.middleware.js.map