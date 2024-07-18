import { parentPort, workerData } from "worker_threads";
import { Chat } from "../model/ChatModel"; // Adjust the path as needed
import { User } from "../model/UserModel"; // Adjust the path as needed
import { getSocketConnectedUser } from "../index"; // Adjust the path as needed

(async () => {
  try {
    const { userId, socketId } = workerData;
    const chatUsers = await Chat.find({ users: userId });

    const onlineUsersData: any = [];
    await Promise.all(
      chatUsers.map(async (chatUser: any) => {
        await Promise.all(
          chatUser.users.map(async (chatUserId: any) => {
            const receiverId = await getSocketConnectedUser(chatUserId.toString());
            if (receiverId) {
              const { userId: receiverUserId } = receiverId;
              const id = receiverUserId.toString();

              const userInfo = await User.findById(userId).select(
                "name image lastActive"
              );

              onlineUsersData.push({
                chatId: chatUser._id,
                userId,
                socketId,
                userInfo,
                receiverId: id,
              });
            }
          })
        );
      })
    );

    // Send the data back to the main thread
    parentPort?.postMessage(onlineUsersData);
  } catch (error) {
    let err = error as Error;
    parentPort?.postMessage({ error: err.message });
  }
})();
