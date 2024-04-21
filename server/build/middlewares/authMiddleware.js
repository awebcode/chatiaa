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
const jwt_1 = require("next-auth/jwt"); //for decoding next-auth_session_token
const next_1 = require("next-auth/next");
const serverAuthOptions_1 = require("../config/serverAuthOptions");
const jwt_2 = require("next-auth/jwt");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const token = yield (0, jwt_2.getToken)({ req, secret: process.env.NEXTAUTH_SECRET });
        const session2 = yield (0, next_1.unstable_getServerSession)(req, res, serverAuthOptions_1.serverAuthOptions); //i can access more data using it like name,email,role,etc what i will provide on serverAuthOptions>session callback
        const session = yield (0, next_1.getServerSession)(req, res, serverAuthOptions_1.serverAuthOptions); //i can access more data using it like name,email,role,etc what i will provide on serverAuthOptions>session callback
        const authToken = req.cookies.authToken ||
            (req.headers.authorization && req.headers.authorization.split(" ")[1]);
        let decoded;
        // // console.log({ authToken, secret: process.env.NEXTAUTH_SECRET! });
        if (authToken) {
            if (authToken === "undefined") {
                return next(new errorHandler_1.CustomErrorHandler("Unauthorized -No token provided", 401));
            }
            decoded = yield (0, jwt_1.decode)({
                token: authToken,
                secret: process.env.NEXTAUTH_SECRET,
            });
        }
        // if (!session?.user?.email && !decoded?.sub) {
        //   return next(new CustomErrorHandler("Unauthorized -Plese login and continue", 401));
        // }
        console.log({ session, decoded, authToken, token, session2 });
        req.id =
            ((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id) ||
                (token === null || token === void 0 ? void 0 : token.sub) ||
                (decoded === null || decoded === void 0 ? void 0 : decoded.sub) ||
                ((_b = session2 === null || session2 === void 0 ? void 0 : session2.user) === null || _b === void 0 ? void 0 : _b.id);
        next();
    }
    catch (error) {
        console.log({ authMiddleware: error });
        return next(new errorHandler_1.CustomErrorHandler("Unauthorized - Invalid token", 401));
    }
});
exports.default = authMiddleware;
