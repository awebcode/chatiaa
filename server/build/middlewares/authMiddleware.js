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
const jwt_1 = require("next-auth/jwt");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = 
    // req.header("Authorization")?.split(" ")[1] ||
    req.cookies["next-auth.session-token"] ||
        req.cookies["__Secure-next-auth.session-token"];
    console.log({ token });
    // if (token === "undefined") {
    //   return next(new CustomErrorHandler("Unauthorized - No token provided", 401));
    // }
    if (!token) {
        return next(new errorHandler_1.CustomErrorHandler("Unauthorized - No token provided", 401));
    }
    try {
        const decoded = yield (0, jwt_1.decode)({
            token,
            secret: process.env.NEXTAUTH_SECRET,
        });
        req.id = decoded === null || decoded === void 0 ? void 0 : decoded.id;
        next();
    }
    catch (error) {
        console.log({ authMiddleware: error });
        next(new errorHandler_1.CustomErrorHandler("Unauthorized - Invalid token", 401));
    }
});
exports.default = authMiddleware;
