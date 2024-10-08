//?socketIO cluster modules
import { cpus } from "os";
import { setupMaster, setupWorker } from "@socket.io/sticky"; // Import for sticky session management
import { createAdapter, setupPrimary } from "@socket.io/cluster-adapter"; // Import for cluster adapter
import cluster from "cluster";
import { getIoInstance, initializeSocket } from "./common/initSocketIO";
import { createServer } from "http";
import { Chat } from "./model/ChatModel";
import { User } from "./model/UserModel";
import { sentGroupNotifyMessage, sentSocketTextMessage } from "./controllers/functions";
import { emitEventToGroupUsers, emitEventToOnlineUsers, markMessageAsDeliverdAfteronlineFriend } from "./common/groupSocket";
import { checkOnlineUsers, getSocketConnectedUser } from "./common/checkIsOnline";
import { Express } from "express";
import type { Socket } from "socket.io";

export const socketINIT = (app: Express) => {
  //@@ configuring server with cluster load balancer
  const PORT = process.env.PORT || 5000;
  let numCPUs =
    process.env.NODE_ENV === "production" ? Math.max(cpus().length / 2, 1) : 1;

  if (cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);
    const httpServer = createServer();

    // setup sticky sessions
    setupMaster(httpServer, {
      loadBalancingMethod: "round-robin",
    });

    // setup connections between the workers
    setupPrimary();

    // needed for packets containing buffers (you can ignore it if you only send plaintext objects)
    // Node.js < 16.0.0
    cluster.setupPrimary({
      serialization: "json", //set this for json data sent to another socket
    });

    httpServer.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker) => {
      console.log(`Worker ${worker.process.pid} died`);
      cluster.fork();
    });
  } else {
    //@ Setting socket io cluster adapters
    const httpServer = createServer(app);
    initializeSocket(httpServer); //* initialize the Socket.IO instance
    const io = getIoInstance();
    // use the cluster adapter
    io.adapter(createAdapter());

    // setup connection with the primary process
    setupWorker(io);
    // WebSocket server logic
    io.on("connection", (socket: Socket) => {
      //join in group chat
      socket.on("join", (data: any) => {
        socket.join(data.chatId);
        io.emit("join", data.chatId);
      });
      //single
      socket.on("setup", async (userData) => {
        socket.join(userData.userId);
        await checkOnlineUsers(userData.userId, socket.id);
        //store connected users

        // Filtered users from chats
        const chatUsers = await Chat.find({ users: userData.userId });

        // Iterate through chat users and add online users to alreadyConnectedOnlineUsers
        await Promise.all(
          chatUsers.map(async (chatUser) => {
            await Promise.all(
              chatUser.users.map(async (chatUserId: any) => {
                const receiverId = await getSocketConnectedUser(chatUserId.toString());
                if (receiverId) {
                  const { userId } = receiverId;
                  const id = userId.toString(); // Convert userId to string

                  io.to(id).emit("addOnlineUsers", {
                    chatId: chatUser._id,
                    userId: userData.userId,
                    socketId: socket.id,
                    userInfo: await User.findById(userData.userId).select(
                      "name image lastActive"
                    ), ///new adduserdata send to others connected friends
                  });
                }
              })
            );
          })
        );

        // Emit the event only if there are connected users
        // if (alreadyConnectedOnlineUsers.length > 0) {
        //   socket.emit("alreadyConnectedOnlineUsers", alreadyConnectedOnlineUsers);
        // }

        // io.emit("setup", users);
        console.log("Client connected", socket.id);
      });

      // Handle incoming messages from clients
      socket.on("sentMessage", async (message: any) => {
        // Broadcast the message to all connected clients
        const data = await sentSocketTextMessage({
          chat: message.chatId,
          sender: message.senderId,
          content: message.content,
          tempMessageId: message.tempMessageId,
        });
        if (message.isGroupChat) {
          await emitEventToGroupUsers(io, "receiveMessage", message.chatId, data);

          //  socket.emit("receiveMessage", message);
        } else {
          //all connected clients in room
          //  io.to(message.chatId)
          //    .to(message.receiverId)
          //    .emit("receiveMessage", {
          //      ...message,
          //      receiverId: message.receiverId,
          //      chat: { _id: message.chatId },
          //    });

          // console.log({data})
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
      socket.on("deliveredAllMessageAfterReconnect", async (data: any) => {
        await markMessageAsDeliverdAfteronlineFriend(socket, data.userId);
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
        await emitEventToGroupUsers(
          socket,
          "groupCreatedNotifyReceived",
          data.chatId,
          data
        );
      });
      //singleChat createdNitify
      socket.on("chatCreatedNotify", (data) => {
        socket.to(data.to).emit("chatCreatedNotifyReceived", data);
      });
      //singlechatDeletedNotify
      socket.on("singleChatDeletedNotify", async (data) => {
        const receiverId = await getSocketConnectedUser(data.receiverId);
        if (receiverId) {
          socket.to(receiverId?.socketId).emit("singleChatDeletedNotifyReceived", data);
        }
      });

      //leave from group chat
      socket.on("groupChatLeaveNotify", async (data) => {
        const leaveMessage = await sentGroupNotifyMessage({
          chatId: data.chatId,
          user: data.currentUser,
          message: `${data?.currentUser?.name} Leave from the group`,
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
      socket.on("chatBlockedNotify", async (data) => {
        const receiverId = await getSocketConnectedUser(data.receiverId);
        if (receiverId) {
          socket.to(receiverId?.socketId).emit("chatBlockedNotifyReceived", data);
        }
      });

      //group events
      // userRemoveFromGroupNotify
      socket.on("userRemoveFromGroupNotify", async (data: any) => {
        const userRemoveMessage = await sentGroupNotifyMessage({
          chatId: data.chatId,
          user: data.currentUser,
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
          user: data.currentUser,
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
          user: data.currentUser,
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
          data?.chatId,
          data
        );
      });
      ///deletedAllMessageInChatNotify

      socket.on("deletedAllMessageInChatNotify", async (data: any) => {
        await emitEventToGroupUsers(
          socket,
          "deletedAllMessageInChatNotify",
          data.chatId,
          data
        );
      });
      //update_group_info
      socket.on("update_group_info", async (data: any) => {
        await emitEventToGroupUsers(socket, "update_group_info_Received", data._id, data);
      });
      //calling system start
      socket.on("sent_call_invitation", async (data: any) => {
        if (data.isGroupChat) {
          await emitEventToGroupUsers(
            socket,
            "received_incoming_call",
            data.chatId,
            data
          );

          //  socket.emit("receiveMessage", message);
        } else {
          //all connected clients in room
          socket.to(data.receiver?._id).emit("received_incoming_call", { ...data });
        }
      });
      //accept call
      socket.on("call_accepted", async (data: any) => {
        //all connected clients in room
        socket.to(data.receiver?._id).emit("user:call_accepted", { ...data });
      });

      //reject call
      socket.on("call_rejected", async (data: any) => {
        //all connected clients in room
        socket.to(data.receiver?._id).emit("user:call_rejected", { ...data });
      });
      //caller_call_rejected
      socket.on("caller_call_rejected", async (data: any) => {
        //all connected clients in room
        if (data.isGroupChat) {
          await emitEventToGroupUsers(
            socket,
            "caller_call_rejected_received",
            data.chatId,
            data
          );

          //  socket.emit("receiveMessage", message);
        } else {
          //all connected clients in room
          socket
            .to(data.receiver?._id)
            .emit("caller_call_rejected_received", { ...data });
        }
      });

      //update:on-call-count
      socket.on("update:on-call-count", async (data: any) => {
        const foundChat = await Chat.findById(data.chatId);
        //all connected clients in room
        if (foundChat?.isGroupChat) {
          await emitEventToGroupUsers(
            socket,
            "update:on-call-count_received",
            data.chatId,
            data
          );

          //  socket.emit("receiveMessage", message);
        } else {
          // Populate users field if it's not already populated
          const receiver = await foundChat?.populate(
            "users",
            "name email image lastActive"
          );
          //all single user
          receiver?.users?.forEach(async (user) => {
            const isConnected = await getSocketConnectedUser(user?._id.toString());
            if (isConnected) {
              io.to(isConnected?.socketId).emit("update:on-call-count_received", {
                ...data,
              });
            }
          });
        }
      });
      //user-on-call-message
      socket.on("user-on-call-message", async (data: any) => {
        const foundChat = await Chat.findById(data.chatId);
        const userOncallMessage = await sentGroupNotifyMessage({
          chatId: data.chatId,
          user: data.user,
          message: data.message,
          type: data.type === "call-notify" ? "call-notify" : "notify",
        });
        const userOncallData = {
          message: { ...userOncallMessage.toObject() },
          user: data.user,
          chatId: data.chatId,
        };
        //all connected clients in room
        if (foundChat?.isGroupChat) {
          await emitEventToGroupUsers(
            socket,
            "user-on-call-message_received",
            data.chatId,
            userOncallData
          );

          //  socket.emit("receiveMessage", message);
        } else {
          // Populate users field if it's not already populated
          const receiver = await foundChat?.populate(
            "users",
            "name email image lastActive"
          );
          //all single user
          receiver?.users?.forEach(async (user) => {
            const isConnected = await getSocketConnectedUser(user?._id.toString());
            if (isConnected) {
              io.to(isConnected?.socketId).emit("user-on-call-message_received", {
                ...userOncallData,
              });
            }
          });
        }
      });

      //@@@@@@ calling system end

      // Handle client disconnection
      // Keep track of disconnected sockets

      socket.on("disconnect", async () => {
        try {
          const leaveId = await getSocketConnectedUser(socket.id);
          if (leaveId) {
            socket.leave(leaveId.userId.toString());

            const userId = leaveId.userId.toString();

            // Emit leave user event to online users
            const eventData = {
              userId: userId,
              socketId: socket.id,
            };
            await emitEventToOnlineUsers(io, "leaveOnlineUsers", userId, eventData);

            // Remove the user from the database

            console.log("Client disconnected:", socket.id);
          }
        } catch (error) {
          console.error("Error handling disconnection:", error);
        }
      });
    });

    // Start the server
    // const PORT = process.env.PORT || 5000;
    // connectDb();
    // app.use(notFoundHandler);
    // app.use(errorHandler);
    // server.listen(PORT, () => {
    //   console.log(`Server is listening on port ${PORT}`);
    // });
  }

  //> Errors handlers
};