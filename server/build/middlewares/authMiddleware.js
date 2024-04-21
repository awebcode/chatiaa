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
const jwt_2 = require("next-auth/jwt");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = yield (0, jwt_2.getToken)({ req, secret: process.env.NEXTAUTH_SECRET });
        // const session = await getServerSession(req, res, serverAuthOptions); //i can access more data using it like name,email,role,etc what i will provide on serverAuthOptions>session callback
        const authToken = req.cookies.authToken ||
            req.cookies[process.env.NODE_ENV === "production"
                ? "__Secure-next-auth.session-token"
                : "next-auth.session-token"] ||
            (req.headers.authorization && req.headers.authorization.split(" ")[1]);
        console.log({
            getToken: token,
            cookToken: req.cookies,
            headersToken: req.headers.authorization,
            reQcooSqareBracket: req.cookies[process.env.NODE_ENV === "production"
                ? "__Secure-next-auth.session-token"
                : "next-auth.session-token"],
        });
        let decoded;
        // console.log({ authToken, secret: process.env.NEXTAUTH_SECRET! });
        if (authToken) {
            if (authToken === "undefined") {
                return next(new errorHandler_1.CustomErrorHandler("Unauthorized -No token provided", 401));
            }
            decoded = yield (0, jwt_1.decode)({
                token: authToken,
                secret: process.env.NEXTAUTH_SECRET,
            });
        }
        if (!(token === null || token === void 0 ? void 0 : token.email) && !(decoded === null || decoded === void 0 ? void 0 : decoded.sub)) {
            return next(new errorHandler_1.CustomErrorHandler("Unauthorized -Plese login and continue", 401));
        }
        // console.log({ decoded, token, session, authToken: req.cookies.authToken });
        if (!(token === null || token === void 0 ? void 0 : token.email) && decoded) {
            //it will needed when will access  data by server side next js
            req.id = decoded === null || decoded === void 0 ? void 0 : decoded.id;
            next();
        }
        else if (token === null || token === void 0 ? void 0 : token.email) {
            req.id = token === null || token === void 0 ? void 0 : token.id;
            next();
        }
    }
    catch (error) {
        console.log({ authMiddleware: error });
        return next(new errorHandler_1.CustomErrorHandler("Unauthorized - Invalid token", 401));
    }
});
exports.default = authMiddleware;
