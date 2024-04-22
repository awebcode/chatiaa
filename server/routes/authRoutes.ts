import express from "express";
import {
  register,
  login,
  getUser,
  allUsers,
  logout,
  deleteUser,
  getProfile,
  allUsersForAddgroupExclueWhoinAlreadyChat,
  updateUser,
  deleteUserByAdmin,
  allAdminUsers,
  getOnlineUsersInMyChats,
} from "../controllers/authControllers";
import authMiddleware from "../middlewares/authMiddleware";
import uploadMiddleware from "../middlewares/uploadMiddleware";

const authRoute = express.Router();

// Registration route
authRoute.post("/register", uploadMiddleware.single("image"), register);
// Login route
authRoute.post("/login", login);
authRoute.get("/getUser", authMiddleware, getUser);
authRoute.get("/getProfile/:userId", authMiddleware, getProfile);
authRoute.get("/getUsers", authMiddleware, allUsers);
//allAdminUsers
authRoute.get("/allAdminUsers", authMiddleware, allAdminUsers);

//getOnlineUsersInMyChats
authRoute.get("/getOnlineUsersInMyChats", authMiddleware, getOnlineUsersInMyChats);
authRoute.put(
  "/updateUser",
  authMiddleware,
  uploadMiddleware.single("file"),
  updateUser
);
//allUsersForAddgroupExclueWhoinAlreadyChat
authRoute.get(
  "/allUsersForAddgroupExclueWhoinAlreadyChat/:chatId",
  authMiddleware,
  allUsersForAddgroupExclueWhoinAlreadyChat
);
authRoute.post("/logout", logout);
authRoute.delete("/deleteUser",authMiddleware, deleteUser);
//deleteUserByAdmin

authRoute.delete("/deleteUserByAdmin/:userId", authMiddleware, deleteUserByAdmin);
export default authRoute;
