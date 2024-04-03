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
const errorHandler_1 = require("./errorHandler");
const next_1 = require("next-auth/next");
const serverAuthOptions_1 = require("../config/serverAuthOptions");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const session = yield (0, next_1.getServerSession)(req, res, serverAuthOptions_1.serverAuthOptions);
        if (session && session.user) {
            console.log({ session: session.user.id });
        }
        if (session && session.user) {
            req.id = (_a = session.user) === null || _a === void 0 ? void 0 : _a.id;
        }
        next();
    }
    catch (error) {
        console.log({ authMiddleware: error });
        next(new errorHandler_1.CustomErrorHandler("Unauthorized - Invalid token", 401));
    }
});
exports.default = authMiddleware;
