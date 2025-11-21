"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const crypto_1 = __importDefault(require("crypto"));
class Utils {
    generateToken() {
        const token = crypto_1.default.randomBytes(32).toString('hex');
        return token;
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map