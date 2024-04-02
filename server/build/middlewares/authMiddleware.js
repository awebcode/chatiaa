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
    console.log("Headers:", req.headers); // Log headers to check Authorization header
    console.log("Cookies:", req.cookies); // Log cookies to check authToken and other relevant cookies
    console.log("NODE_ENV:", process.env.NODE_ENV); // Log NODE_ENV to ensure it's set correctly
    console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET); // Log NEXTAUTH_SECRET to ensure it's set correctly
    console.log("Token:", JSON.stringify(req.headers.token)); // Log the token object as a string
    console.log("Cookies:", JSON.stringify(req.cookies)); // Log cookies to check authToken and other relevant cookies
    const token = 
    // req.header("Authorization")?.split(" ")[1] ||
    req.cookies.authToken ||
        req.cookies["next-auth.session-token"] ||
        req.cookies["__Secure-next-auth.session-token"];
    if (token === "undefined") {
        return next(new errorHandler_1.CustomErrorHandler("Unauthorized - No token provided", 401));
    }
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
