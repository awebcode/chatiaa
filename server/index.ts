// server.ts
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import connectDb from "./config/connectDb";
import cloudinaryConfig from "./config/cloudinaryConfig";

import { config } from "dotenv";
import authRoute from "./routes/authRoutes";
import chatRoute from "./routes/chatRoutes";
import messageRoute from "./routes/messageRoutes";
import { User } from "./model/UserModel";
import cookieParser from "cookie-parser";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
config();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Enable CORS for all routes

const corsOptions = {
  origin: ["http://localhost:3000", "https://messengaria.vercel.app"], // Allow requests from this specific origin
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());

cloudinaryConfig();

app.use("/api/v1", authRoute);
app.use("/api/v1", chatRoute);
app.use("/api/v1", messageRoute);
type TUser = {
  id: string;
  socketId: string;
};
let users: TUser[] = [];

const checkOnlineUsers = (id: string, socketId: string) => {
  if (!users.some((user) => user.id === id)) {
    users.push({ socketId, id });
  }
};
const removeUser = async (socketId: string) => {
  const removedUserIndex = users.findIndex((user) => user.socketId === socketId);

  if (removedUserIndex !== -1) {
    const removedUser = users[removedUserIndex];
    users.splice(removedUserIndex, 1);

    try {
      //update lastActivity time
      await User.findOneAndUpdate(
        { _id: removedUser.id },
        { $set: { lastActive: new Date(Date.now()) } },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating lastActive:", error);
    }
  }
};

const getUser = (id: string) => {
  return users.find((user) => user.id === id);
};
// WebSocket server logic
io.on("connection", (socket: Socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData.id);
    checkOnlineUsers(userData.id, socket.id);
    io.emit("setup", users);
    console.log("Client connected");
  });
  socket.on("join", (data: any) => {
    socket.join(data.chatId);
    io.emit("join", data.chatId);
  });

  // Handle incoming messages from clients
  socket.on("sentMessage", (message: any) => {
    // Broadcast the message to all connected clients
    if (message.isGroupChat) {
      io.to(message.groupChatId).emit("receiveMessage", message);
      //  socket.emit("receiveMessage", message);
    } else {
      //all connected clients in room
      socket.to(message.receiverId).emit("receiveMessage", message);
      socket.emit("receiveMessage", message);
    }
  });
  //deliveredMessage
  socket.on("deliveredMessage", (message: any) => {
     socket.broadcast.to(message.receiverId).emit("receiveDeliveredMessage", message);
  });

  //deliveredAllMessageAfterReconnect -To all users
  socket.on("deliveredAllMessageAfterReconnect", (message: any) => {
    io.emit("receiveDeliveredAllMessageAfterReconnect", message);
  });
  // Handle typing
  socket.on("startTyping", (data: any) => {
    if (data.isGroupChat) {
      socket.to(data.groupChatId).emit("typing", data);
    } else {
      socket.in(data.receiverId).emit("typing", data);
    }
  });
  // Handle stop typing
  socket.on("stopTyping", (data: any) => {
    if (data.isGroupChat) {
      socket.to(data.groupChatId).emit("stopTyping", data);
    } else {
      socket.in(data.receiverId).emit("stopTyping", data);
    }
  });
  //@@@@@@ calling system start

  socket.on("user:call", ({ to, offer, user, chatId }) => {
    io.to(to).emit("incomming:call", { from: user._id, offer, user, chatId }); //from=socket.id prev
  });
  socket.on("call:rejected", ({ to, user }) => {
    io.to(to).emit("call:rejected", { from: user._id, user });
  });
  socket.on("call:accepted", ({ to, ans, user }) => {
    // console.log({ to, ans, user });
    io.to(to).emit("call:accepted", { from: user._id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer, user }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: user._id, offer, user });
  });

  socket.on("peer:nego:done", ({ to, ans, user }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: user._id, ans });
  });
  //groupCreatedNotify

  socket.on("groupCreatedNotify", (data) => {
    data.forEach((userId: any) => {
      socket.to(userId).emit("groupCreatedNotifyReceived");
    });
  });
  //singleChat createdNitify
  socket.on("chatCreatedNotify", (data) => {
    console.log({ chatCreatedNotify: data });
    socket.to(data.to).emit("chatCreatedNotifyReceived");
  });
  //chatDeletedNotify
  socket.on("chatDeletedNotify", (data) => {
    data.forEach((userId: any) => {
      socket.to(userId).emit("chatDeletedNotifyReceived");
    });
  });
  //@@@@@@ calling system end
  // Handle client disconnection
  socket.on("disconnect", async (data) => {
    await removeUser(socket.id);
    // Emit the updated users array after a user disconnects
    io.emit("setup", users);
    console.log("Client disconnected");
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
connectDb();
app.use(notFoundHandler);
app.use(errorHandler);
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
