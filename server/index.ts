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
import { sentGroupNotifyMessage, sentSocketTextMessage } from "./controllers/functions";
import { Chat } from "./model/ChatModel";
import { Types } from "mongoose";
import { Message } from "./model/MessageModel";
import { emitEventToGroupUsers } from "./common/groupSocket";
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

type TsocketUsers = {
  id: string;
  socketId: string;
};
let users: TsocketUsers[] = [];

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
  return users.find((user) => user.id === id || user.socketId === id);
};
// WebSocket server logic
io.on("connection", (socket: Socket) => {
  socket.on("setup", async (userData) => {
    socket.join(userData.id);
    checkOnlineUsers(userData.id, socket.id);
    //store connected users
    let alreadyConnectedOnlineUsers: TsocketUsers[] = [];
    //only send online users notify there who connected with new connected user
    const chats = await Chat.find({ users: { $elemMatch: { $eq: userData.id } } });
    chats?.forEach((chatUsers) => {
      chatUsers?.users.forEach((userId: any) => {
        const receiverId = getSocketConnectedUser(userId.toString());
        if (receiverId) {
          const { id, socketId } = receiverId;
          const existsConn = alreadyConnectedOnlineUsers.find((conn) => conn.id === id);
          if (existsConn) {
            return;
          } else {
            alreadyConnectedOnlineUsers.push({ id, socketId });
          }
          io.to(id).emit("addOnlineUsers", { id: userData.id, socketId: socket.id });
        }
      });
    });
    //send to new connected users
    socket.emit("alreadyConnectedOnlineUsers", alreadyConnectedOnlineUsers);

    // io.emit("setup", users);
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
      await emitEventToGroupUsers(io, "receiveMessage", message.chatId, data);

      //  socket.emit("receiveMessage", message);
    } else {
      //all connected clients in room
      io.to(message.chatId)
        .to(message.receiverId)
        .emit("receiveMessage", { ...data, receiverId: message.receiverId });
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
      await emitEventToGroupUsers(
        socket,
        "remove_remove_All_unsentMessage",
        message.chatId,
        message
      );
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
  socket.on("startTyping", async (data: any) => {
    if (data.isGroupChat) {
      await emitEventToGroupUsers(socket, "typing", data.groupChatId, data);
    } else {
      socket.to(data.receiverId).emit("typing", data);
    }
  });
  // Handle stop typing
  socket.on("stopTyping", async (data: any) => {
    if (data.isGroupChat) {
      await emitEventToGroupUsers(socket, "stopTyping", data.groupChatId, data);
    } else {
      socket.to(data.receiverId).emit("stopTyping", data);
    }
  });

  //groupCreatedNotify

  socket.on("groupCreatedNotify", async (data) => {
    await emitEventToGroupUsers(socket, "groupCreatedNotifyReceived", data.chatId, data);
  });
  //singleChat createdNitify
  socket.on("chatCreatedNotify", (data) => {
    socket.to(data.to).emit("chatCreatedNotifyReceived", data);
  });
  //singlechatDeletedNotify
  socket.on("singleChatDeletedNotify", (data) => {
    const receiverId = getSocketConnectedUser(data.receiverId);
    if (receiverId) {
      socket
        .to(receiverId?.socketId)
        .emit("singleChatDeletedNotifyReceived", { chatId: data.chatId });
    }
  });

  //leave from group chat
  socket.on("groupChatLeaveNotify", async (data) => {
    const leaveMessage = await sentGroupNotifyMessage({
      chatId: data.chatId,
      user: data.currentUser,
      message: `${data.currentUser.name} Leave from the group`,
    });
    const leaveData = {
      ...leaveMessage.toObject(),
      user: data.currentUser,
      chatId: data.chatId,
    };
    await emitEventToGroupUsers(
      socket,
      "groupChatLeaveNotifyReceived",
      data.chatId,
      leaveData
    );
  });

  //chat blocked notify

  //singlechatDeletedNotify
  socket.on("chatBlockedNotify", (data) => {
    const receiverId = getSocketConnectedUser(data.receiverId);
    if (receiverId) {
      socket.to(receiverId?.socketId).emit("chatBlockedNotifyReceived", data);
    }
  });

  //group events
  // userRemoveFromGroupNotify
  socket.on("userRemoveFromGroupNotify", async (data: any) => {
    const userRemoveMessage = await sentGroupNotifyMessage({
      chatId: data.chatId,
      user: data.currentUser._id,
      message: `${data.currentUser.name} remove ${data.user.name}  from the group`,
    });
    const userRemoveData = {
      message: { ...userRemoveMessage.toObject() },
      user: data.user,
      chatId: data.chatId,
    };
    await emitEventToGroupUsers(
      io,
      "userRemoveFromGroupNotifyReceived",
      data.chatId,
      userRemoveData
    );
  });
  // makeAdminToGroupNotify
  socket.on("makeAdminToGroupNotify", async (data: any) => {
    const makeAdminMessage = await sentGroupNotifyMessage({
      chatId: data.chatId,
      user: data.currentUser._id,
      message: `${data.currentUser.name} added ${data.user.name} as  group admin`,
    });
    const makeAdminData = {
      message: { ...makeAdminMessage.toObject() },
      user: data.user,
      chatId: data.chatId,
    };
    await emitEventToGroupUsers(
      io,
      "makeAdminToGroupNotifyReceived",
      data.chatId,
      makeAdminData
    );
  });
  // adminRemoveFromGroupNotify
  socket.on("adminRemoveFromGroupNotify", async (data: any) => {
    const adminRemoveMessage = await sentGroupNotifyMessage({
      chatId: data.chatId,
      user: data.currentUser._id,
      message: `${data.currentUser.name} removed ${data.user.name} from  group admin`,
    });
    const adminRemoveData = {
      message: { ...adminRemoveMessage.toObject() },
      user: data.user,
      chatId: data.chatId,
    };
    await emitEventToGroupUsers(
      io,
      "adminRemoveFromGroupNotifyReceived",
      data.chatId,
      adminRemoveData
    );
  });

  // Handle seenPushGroupMessage
  socket.on("seenPushGroupMessage", async (data: any) => {
    await emitEventToGroupUsers(
      socket,
      "seenPushGroupMessageReceived",
      data.chatId,
      data
    );
  });
  
  //deliveredGroupMessageReceived
   socket.on("deliveredGroupMessage", async (data: any) => {
     await emitEventToGroupUsers(
       socket,
       "deliveredGroupMessageReceived",
       data.chatId,
       data
     );
   });

   //update_group_info
    socket.on("update_group_info", async (data: any) => {
      await emitEventToGroupUsers(socket, "update_group_info_Received", data._id, data);
    });
  //@@@@@@ calling system end
  // Handle client disconnection
  socket.on("disconnect", async (data) => {
    // Emit the updated users array after a user disconnects
    //only send online users notify there who connected with me
    const leaveId = getSocketConnectedUser(socket.id);
    if (leaveId) {
      socket.leave(leaveId.id);
    }

    const chats = await Chat.find({ users: { $elemMatch: { $eq: leaveId?.id } } });
    chats?.forEach((chatUsers) => {
      chatUsers?.users.forEach((userId: any) => {
        const receiverId = getSocketConnectedUser(userId.toString());
        if (receiverId) {
          const { id, socketId } = receiverId;
          io.to(socketId).emit("leaveOnlineUsers", {
            id: leaveId?.id,
            socketId: socket.id,
          });
        }
      });
    });
    //remove from users array
    await removeUser(socket.id);

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
