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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = ((_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1]) || req.cookies.authToken;
    // console.log()
    // console.log({token})
    if (!token) {
        return next(new errorHandler_1.CustomErrorHandler("Unauthorized - No token provided", 401));
    }
    try {
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, "your-secret-key");
        // Attach the decoded data to the request for further use
        req.id = decoded.id;
        next();
    }
    catch (error) {
        console.log({ authMiddleware: error });
        next(new errorHandler_1.CustomErrorHandler("Unauthorized - Invalid token", 401));
    }
});
exports.default = authMiddleware;
