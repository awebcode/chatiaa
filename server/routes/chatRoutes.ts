import express from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { accessChat, addToGroup, createGroupChat, deleteSingleChat, fetchChats, leaveFromChat, makeAdmin, removeFromAdmin, removeFromGroup, renameGroup, updateChatStatusAsBlockOrUnblock } from "../controllers/ChatController";


const chatRoute = express.Router();

chatRoute.route("/accessChats/:userId").post(authMiddleware, accessChat);
chatRoute.route("/fetchChats").get(authMiddleware, fetchChats);
chatRoute.route("/group").post(authMiddleware, createGroupChat);
chatRoute.route("/rename").put(authMiddleware, renameGroup);
chatRoute.route("/removefromgroup").put(authMiddleware, removeFromGroup);
chatRoute.route("/addtogroup").put(authMiddleware, addToGroup);
chatRoute.route("/makeAdmin").put(authMiddleware, makeAdmin);
chatRoute.route("/removeFromAdmin").put(authMiddleware, removeFromAdmin);
chatRoute.route("/deleteSingleChat/:chatId").delete(authMiddleware, deleteSingleChat);

//update messesage status as Block/Unblock

chatRoute
  .route("/updateChatStatusAsBlockOUnblock")
  .put(authMiddleware, updateChatStatusAsBlockOrUnblock);

  //leave from chat

chatRoute
  .route("/leaveChat")
  .put(authMiddleware, leaveFromChat);
export default chatRoute;