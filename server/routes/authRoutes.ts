import express from "express";
import {
  register,
  login,
  getUser,
  allUsers,
  logout,
  deleteUser,
  getProfile,
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
authRoute.post("/logout", logout);
authRoute.delete("/deleteUser",authMiddleware, deleteUser);
export default authRoute;
