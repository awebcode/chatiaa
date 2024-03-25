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
      io.to(chatId)
        .to(socketId)
        .emit(event, {
          ...data,
          receiverId: id,
        });
    }
  });
};

// Example usage:
// io and socket can be passed as arguments to the function when it's called
// emitEventToChatUsers(io, "remove_remove_All_unsentMessage", message.chatId, message);
