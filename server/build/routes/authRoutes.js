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
authRoute.post("/register", uploadMiddleware_1.default.single("image"), authControllers_1.register);
// Login route
authRoute.post("/login", authControllers_1.login);
authRoute.get("/getUser", authMiddleware_1.default, authControllers_1.getUser);
authRoute.get("/getProfile/:userId", authMiddleware_1.default, authControllers_1.getProfile);
authRoute.get("/getUsers", authMiddleware_1.default, authControllers_1.allUsers);
//allUsersForAddgroupExclueWhoinAlreadyChat
authRoute.get("/allUsersForAddgroupExclueWhoinAlreadyChat/:chatId", authMiddleware_1.default, authControllers_1.allUsersForAddgroupExclueWhoinAlreadyChat);
authRoute.post("/logout", authControllers_1.logout);
authRoute.delete("/deleteUser", authMiddleware_1.default, authControllers_1.deleteUser);
exports.default = authRoute;
