import { Server, Socket } from "socket.io";
import { Chat } from "../model/ChatModel";
import { getSocketConnectedUser } from "..";

// Function to emit an event to users within a chat
export const emitEventToGroupUsers = async (
  io: Server | Socket,
  event: string,
  chatId: string,
  data: any
) => {
  const chatUsers = await Chat.findById(chatId);

  chatUsers?.users.forEach((userId: any) => {
    const receiverId = getSocketConnectedUser(userId.toString());
    if (receiverId) {
      const { id, socketId } = receiverId;
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

  chats.map((chat: any) => {
    if (!chat.latestMessage) {
      return; // Skip chats without a latest message
    }
    // Update the latest message's status to "delivered"
    if (
      chat.latestMessage?.status === "unseen" &&
      chat.latestMessage?.sender.toString() !== userId
    ) {
      const receiverId = getSocketConnectedUser(chat.latestMessage?.sender.toString());
      if (receiverId) {
        io.to(receiverId.socketId).emit("receiveDeliveredAllMessageAfterReconnect",{chatId:chat?._id});
      }
    }
  });
};
