"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authControllers_1 = require("../controllers/authControllers");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const uploadMiddleware_1 = __importDefault(require("../middlewares/uploadMiddleware"));
const authRoute = express_1.default.Router();
// Registration route
authRoute.post("/register", uploadMiddleware_1.default.single("pic"), authControllers_1.register);
// Login route
authRoute.post("/login", authControllers_1.login);
authRoute.get("/getUser", authMiddleware_1.default, authControllers_1.getUser);
authRoute.get("/getUsers", authMiddleware_1.default, authControllers_1.allUsers);
authRoute.post("/logout", authControllers_1.logout);
exports.default = authRoute;
