import express from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  accessChat,
  addToGroup,
  createGroupChat,
  deleteSingleChat,
  fetchChats,
  getFilesInChat,
  getInitialFilesInChat,
  getUsersInAChat,
  leaveFromChat,
  makeAdmin,
  removeFromAdmin,
  removeFromGroup,
  updateChatStatusAsBlockOrUnblock,
  updateGroupNamePhoto,
} from "../controllers/ChatController";
import uploadMiddleware from "../middlewares/uploadMiddleware";

const chatRoute = express.Router();

chatRoute.route("/accessChats/:userId").post(authMiddleware, accessChat);
chatRoute.route("/fetchChats").get(authMiddleware, fetchChats);
chatRoute.route("/group").post(authMiddleware, createGroupChat);
//updateGroupPhoto
chatRoute
  .route("/updateGroupNamePhoto")
  .put(authMiddleware, uploadMiddleware.single("file"), updateGroupNamePhoto);
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

chatRoute.route("/leaveChat").put(authMiddleware, leaveFromChat);
//getFiles in a chat
chatRoute.get("/getFilesInChat/:chatId", authMiddleware, getFilesInChat);
//getInitialFilesInChat
chatRoute.get("/getInitialFilesInChat/:chatId", authMiddleware, getInitialFilesInChat);
// getUsersInAChat;
chatRoute.get("/getUsersInAChat/:chatId", authMiddleware, getUsersInAChat);
export default chatRoute;
