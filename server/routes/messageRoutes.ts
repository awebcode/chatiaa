import express from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  addRemoveEmojiReactions,
  allMessages,
  editMessage,
  getMessageReactions,
  replyMessage,
  sendMessage,
  updateAllMessageStatusSeen,
  updateChatMessageAsDeliveredController,
  updateChatMessageController,
  
  updateMessageStatusAsRemove,
  updateMessageStatusAsUnsent,
} from "../controllers/messageController";
import uploadMiddleware from "../middlewares/uploadMiddleware";


const messageRoute = express.Router();

messageRoute.route("/allmessages/:chatId").get(authMiddleware, allMessages);
messageRoute
  .route("/getMessageReactions/:messageId")
  .get(authMiddleware, getMessageReactions);
messageRoute
  .route("/sentmessage")
  .post(authMiddleware, uploadMiddleware.array("files"), sendMessage);
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


//editMessage

messageRoute
  .route("/editMessage")
  .put(authMiddleware, uploadMiddleware.array("files"), editMessage);
//replyMessage
messageRoute
  .route("/replyMessage")
  .post(authMiddleware, uploadMiddleware.array("files"), replyMessage);

//addRemoveEmojiReactions

messageRoute.post("/addRemoveEmojiReactions", authMiddleware, addRemoveEmojiReactions);
export default messageRoute;
