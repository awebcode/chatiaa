import express from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  addRemoveEmojiReactions,
  allMessages,
  editMessage,
  replyMessage,
  sendMessage,
  updateAllMessageStatusSeen,
  updateChatMessageAsDeliveredController,
  updateChatMessageController,
  updateChatStatusAsBlockOrUnblock,
  updateMessageStatusAsRemove,
  updateMessageStatusAsUnsent,
} from "../controllers/messageController";
import uploadMiddleware from "../middlewares/uploadMiddleware";

const messageRoute = express.Router();

messageRoute.route("/allmessages/:chatId").get(authMiddleware, allMessages);
messageRoute
  .route("/sentmessage")
  .post(authMiddleware, uploadMiddleware.single("image"), sendMessage);
messageRoute
  .route("/updateMessageStatus")
  .patch(authMiddleware, updateChatMessageController);
messageRoute
  .route("/updateMessageStatusSeen/:chatId")
  .put(authMiddleware, updateAllMessageStatusSeen);

//update All messages status after rejoin/login a user
messageRoute
  .route("/updateMessageStatusDelivered/:userId")
  .put(authMiddleware, updateChatMessageAsDeliveredController);

//update messesage status as remove

messageRoute
  .route("/updateMessageStatusRemove")
  .put(authMiddleware, updateMessageStatusAsRemove);

//update messesage status as unsent
messageRoute
  .route("/updateMessageStatusUnsent")
  .put(authMiddleware, updateMessageStatusAsUnsent);

//update messesage status as Block/Unblock

messageRoute
  .route("/updateChatStatusAsBlockOUnblock")
  .put(authMiddleware, updateChatStatusAsBlockOrUnblock);
//editMessage

messageRoute
  .route("/editMessage")
  .put(authMiddleware, uploadMiddleware.single("image"), editMessage);
//replyMessage
messageRoute
  .route("/replyMessage")
  .post(authMiddleware, uploadMiddleware.single("image"), replyMessage);

//addRemoveEmojiReactions

messageRoute.post("/addRemoveEmojiReactions", authMiddleware, addRemoveEmojiReactions);
export default messageRoute;
