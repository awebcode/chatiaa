import { Server, Socket } from "socket.io";
import { Chat } from "../model/ChatModel";
import { getSocketConnectedUser } from "..";
import { Types } from "mongoose";
import { User } from "../model/UserModel";

// Function to emit an event to users within a chat
export const emitEventToGroupUsers = async (
  io: Server | Socket,
  event: string,
  chatId: string,
  data: any
) => {
  const chatUsers = await Chat.findById(chatId);

  chatUsers?.users.forEach(async (chatUserId: any) => {
    const receiverId = await getSocketConnectedUser(chatUserId.toString());

    if (receiverId) {
      const { userId, socketId } = receiverId;
      const id = userId.toString();
      //.to(chatId)
      io.to(socketId).emit(event, {
        ...data,
        receiverId: id,
      });
    }
  });
};

// Example usage:
// io and socket can be passed as arguments to the function when it's called
// emitEventToChatUsers(io, "remove_remove_All_unsentMessage", message.chatId, message);

export const markMessageAsDeliverdAfteronlineFriend = async (
  io: Server | Socket,
  userId: string
) => {
  const chats = await Chat.find({ users: { $in: [userId] } }).populate("latestMessage");

  if (!chats || chats.length === 0) {
    return;
  }

  chats.map(async (chat: any) => {
    if (!chat.latestMessage) {
      return; // Skip chats without a latest message
    }
    // Update the latest message's status to "delivered"
    if (
      chat.latestMessage?.status === "unseen" &&
      chat.latestMessage?.sender.toString() !== userId
    ) {
      const receiverId = await getSocketConnectedUser(
        chat.latestMessage?.sender.toString()
      );
      // const senderId = await getSocketConnectedUser(
      //  userId
      // );
      if (receiverId) {
        io.to(receiverId.socketId)
          .emit("receiveDeliveredAllMessageAfterReconnect", {
            chatId: chat?._id,
          });
      }
    }
  });
};
//chats of chat

// Function to emit an event to online users based on userId
export const emitEventToOnlineUsers = async (
  io: Server | Socket,
  eventName: string,
  userId?: string | Types.ObjectId,
  eventData?: any
) => {
  try {
    let userInfo = await User.findById(userId);
    if (eventName === "leaveOnlineUsers" && userInfo) {
      //when user updated then update online status
      userInfo = await User.findByIdAndUpdate(
        userId,
        { onlineStatus: "offline", socketId: null, lastActive: Date.now() },
        { new: true }
      );
    }

    const chats = await Chat.find({ users: { $elemMatch: { $eq: userId } } });
    chats?.forEach((chatUsers) => {
      chatUsers?.users.forEach(async (chatUserId: any) => {
        const receiverId = await getSocketConnectedUser(chatUserId.toString());
        //check if any user is online
        const userIds = chatUsers?.users?.map((user: any) => user?.toString());

        // Query onlineUsersModel for online status of filtered users
        const onlineUsers = await User.find({
          _id: { $in: userIds },
          onlineStatus: { $in: ["online", "busy"] },
        });

        // Map the online status to userIds
        const onlineUserIds = onlineUsers.map((user) => user?._id?.toString());
        const isAnyGroupUserOnline = chatUsers?.users?.some((user) => {
          return onlineUserIds.includes(user?.toString()) && onlineUserIds.length > 1;
        });
        if (receiverId) {
          const { userId, socketId } = receiverId;
          io.to(socketId).emit(eventName, {
            ...eventData,
            chatId: chatUsers?._id,
            isAnyGroupUserOnline,
            userInfo: {
              userId: userInfo?._id,
              lastActive: userInfo?.lastActive,
              onlineStatus: userInfo?.onlineStatus,
            },
          });
        }
      });
    });
  } catch (error) {
    console.error("Error emitting event to online users:", error);
  }
};
