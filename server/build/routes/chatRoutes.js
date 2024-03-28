"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const ChatController_1 = require("../controllers/ChatController");
const uploadMiddleware_1 = __importDefault(require("../middlewares/uploadMiddleware"));
const chatRoute = express_1.default.Router();
chatRoute.route("/accessChats/:userId").post(authMiddleware_1.default, ChatController_1.accessChat);
chatRoute.route("/fetchChats").get(authMiddleware_1.default, ChatController_1.fetchChats);
chatRoute.route("/group").post(authMiddleware_1.default, ChatController_1.createGroupChat);
//updateGroupPhoto
chatRoute
    .route("/updateGroupNamePhoto")
    .put(authMiddleware_1.default, uploadMiddleware_1.default.single("file"), ChatController_1.updateGroupNamePhoto);
chatRoute.route("/removefromgroup").put(authMiddleware_1.default, ChatController_1.removeFromGroup);
chatRoute.route("/addtogroup").put(authMiddleware_1.default, ChatController_1.addToGroup);
chatRoute.route("/makeAdmin").put(authMiddleware_1.default, ChatController_1.makeAdmin);
chatRoute.route("/removeFromAdmin").put(authMiddleware_1.default, ChatController_1.removeFromAdmin);
chatRoute.route("/deleteSingleChat/:chatId").delete(authMiddleware_1.default, ChatController_1.deleteSingleChat);
//update messesage status as Block/Unblock
chatRoute
    .route("/updateChatStatusAsBlockOUnblock")
    .put(authMiddleware_1.default, ChatController_1.updateChatStatusAsBlockOrUnblock);
//leave from chat
chatRoute.route("/leaveChat").put(authMiddleware_1.default, ChatController_1.leaveFromChat);
//getFiles in a chat
chatRoute.get("/getFilesInChat/:chatId", authMiddleware_1.default, ChatController_1.getFilesInChat);
//getInitialFilesInChat
chatRoute.get("/getInitialFilesInChat/:chatId", authMiddleware_1.default, ChatController_1.getInitialFilesInChat);
// getUsersInAChat;
chatRoute.get("/getUsersInAChat/:chatId", authMiddleware_1.default, ChatController_1.getUsersInAChat);
exports.default = chatRoute;
