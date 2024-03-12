"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const ChatController_1 = require("../controllers/ChatController");
const chatRoute = express_1.default.Router();
chatRoute.route("/accessChats/:userId").post(authMiddleware_1.default, ChatController_1.accessChat);
chatRoute.route("/fetchChats").get(authMiddleware_1.default, ChatController_1.fetchChats);
chatRoute.route("/group").post(authMiddleware_1.default, ChatController_1.createGroupChat);
chatRoute.route("/rename").put(authMiddleware_1.default, ChatController_1.renameGroup);
chatRoute.route("/removefromgroup").put(authMiddleware_1.default, ChatController_1.removeFromGroup);
chatRoute.route("/addtogroup").put(authMiddleware_1.default, ChatController_1.addToGroup);
chatRoute.route("/makeAdmin").put(authMiddleware_1.default, ChatController_1.makeAdmin);
chatRoute.route("/removeFromAdmin").put(authMiddleware_1.default, ChatController_1.removeFromAdmin);
chatRoute.route("/deleteSingleChat/:chatId").delete(authMiddleware_1.default, ChatController_1.deleteSingleChat);
exports.default = chatRoute;
