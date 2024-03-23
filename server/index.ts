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
config();
import { sentSocketTextMessage } from "./controllers/functions";
import { Chat } from "./model/ChatModel";
import { Types } from "mongoose";
const app = express();
// app.use(uploadMiddleware.array("files"));

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

const server = createServer(app);
export const io = new Server(server, {
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

export const getSocketConnectedUser = (id: string | Types.ObjectId) => {
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
  socket.on("sentMessage", async (message: any) => {
    // Broadcast the message to all connected clients
    const data = await sentSocketTextMessage({
      chat: message.chatId,
      sender: message.senderId,
      content: message.content,
    });
    if (message.isGroupChat) {
      const chatUsers = await Chat.findById(message.chatId);
      // console.log({chatU})
      chatUsers?.users.forEach((user) => {
        const receiverId = getSocketConnectedUser(user.toString());
        if (receiverId) {
          io.to(message.groupChatId)
            .to(receiverId.socketId)
            .emit("receiveMessage", {
              ...data.toObject(),
              receiverId: message.receiverId,
            });
        }
      });

      //  socket.emit("receiveMessage", message);
    } else {
      //all connected clients in room
      io.to(message.chatId)
        .to(message.receiverId)
        .emit("receiveMessage", { ...data.toObject(), receiverId: message.receiverId });
    }
  });

  //ReplyMessage

  socket.on("replyMessage", async (message: any) => {});
  //EditMessage

  socket.on("editMessage", async (message: any) => {});
  //addReactionOnMessage

  socket.on("addReactionOnMessage", async (message: any) => {});
  //remove_remove_All_unsentMessage

  socket.on("remove_remove_All_unsentMessage", async (message: any) => {
    if (message.groupChat) {
      io.to(message.chatId).emit("remove_remove_All_unsentMessage", message);
    } else {
      io.to(message.receiverId).emit("remove_remove_All_unsentMessage", message);
    }
  });
  //removeFromAll

  //deliveredMessage
  socket.on("seenMessage", (message: any) => {
    socket.to(message.receiverId).emit("receiveSeenMessage", message);
  });
  //deliveredMessage
  socket.on("deliveredMessage", (message: any) => {
    socket.to(message.receiverId).emit("receiveDeliveredMessage", message);
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

  //groupCreatedNotify

  socket.on("groupCreatedNotify", async (data) => {
    const chatUsers = await Chat.findById(data.chatId);
    chatUsers?.users.forEach((user) => {
      const receiverId = getSocketConnectedUser(user.toString());
      if (receiverId) {
        io.to(data.chatId)
          .to(receiverId.socketId)
          
          .emit("groupCreatedNotifyReceived", {
            ...data.toObject(),
            receiverId: receiverId.id,
          });
      }
    })
    
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
