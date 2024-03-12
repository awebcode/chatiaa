"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const messageController_1 = require("../controllers/messageController");
const uploadMiddleware_1 = __importDefault(require("../middlewares/uploadMiddleware"));
const messageRoute = express_1.default.Router();
messageRoute.route("/allmessages/:chatId").get(authMiddleware_1.default, messageController_1.allMessages);
messageRoute
    .route("/sentmessage")
    .post(authMiddleware_1.default, uploadMiddleware_1.default.single("image"), messageController_1.sendMessage);
messageRoute
    .route("/updateMessageStatus")
    .patch(authMiddleware_1.default, messageController_1.updateChatMessageController);
messageRoute
    .route("/updateMessageStatusSeen/:chatId")
    .put(authMiddleware_1.default, messageController_1.updateAllMessageStatusSeen);
//update All messages status after rejoin/login a user
messageRoute
    .route("/updateMessageStatusDelivered/:userId")
    .put(authMiddleware_1.default, messageController_1.updateChatMessageAsDeliveredController);
//update messesage status as remove
messageRoute
    .route("/updateMessageStatusRemove")
    .put(authMiddleware_1.default, messageController_1.updateMessageStatusAsRemove);
//update messesage status as unsent
messageRoute
    .route("/updateMessageStatusUnsent")
    .put(authMiddleware_1.default, messageController_1.updateMessageStatusAsUnsent);
//update messesage status as Block/Unblock
messageRoute
    .route("/updateChatStatusAsBlockOUnblock")
    .put(authMiddleware_1.default, messageController_1.updateChatStatusAsBlockOrUnblock);
//editMessage
messageRoute
    .route("/editMessage")
    .put(authMiddleware_1.default, uploadMiddleware_1.default.single("image"), messageController_1.editMessage);
//replyMessage
messageRoute
    .route("/replyMessage")
    .post(authMiddleware_1.default, uploadMiddleware_1.default.single("image"), messageController_1.replyMessage);
//addRemoveEmojiReactions
messageRoute.post("/addRemoveEmojiReactions", authMiddleware_1.default, messageController_1.addRemoveEmojiReactions);
exports.default = messageRoute;
