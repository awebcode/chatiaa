import { IChat, IMessage } from "@/context/reducers/interfaces";
import {
  encryptAndStoreData,
  getDecryptedChats,
  getDecryptedSelectedChat,
} from "./EncDecrypt";
export function updatelocallStorageChatAndSelectedChat(
  data: IMessage,
  chatId: string
): void {
  const storedChats = getDecryptedChats(process.env.NEXT_PUBLIC_CRYPTO_DATA_SECRET!);
  const storedSelectedChat: any = getDecryptedSelectedChat(
    process.env.NEXT_PUBLIC_CRYPTO_DATA_SECRET!
  );

  const isExistChatIndex = storedChats.findIndex((chat: IChat) => chat?._id === chatId);
  const isExistMessageInSelectechatIndex =
    storedSelectedChat?.messages?.messages.findIndex(
      (m: any) => m?._id === data?._id || m?.tempMessageId === data?.tempMessageId
    );

  if (isExistChatIndex !== -1) {
    const existingChat: any = storedChats[isExistChatIndex];
    if (storedSelectedChat?.messages) {
      if (isExistMessageInSelectechatIndex !== -1) {
        storedSelectedChat.messages.messages[isExistMessageInSelectechatIndex] = data;
      } else {
        storedSelectedChat.messages.messages.unshift(data);
      }
      //store encrypted selectedchat on localstorage
      encryptAndStoreData(
        storedSelectedChat,
        process.env.NEXT_PUBLIC_CRYPTO_DATA_SECRET!,
        "selectedChat"
      );
      // localStorage.setItem("selectedChat", JSON.stringify(storedSelectedChat));
    }
    storedChats[isExistChatIndex].latestMessage = data;
    const messageIndex = existingChat?.messages?.messages.findIndex(
      (m: IMessage) => m?._id === data._id || m?.tempMessageId === data.tempMessageId
    );

    if (existingChat?.messages) {
      if (messageIndex !== -1) {
        existingChat.messages.messages[messageIndex] = data;
      } else {
        existingChat.messages.messages.unshift(data);
      }
    }
    //store encrypted selectedchat on localstorage
    encryptAndStoreData(
      storedChats,
      process.env.NEXT_PUBLIC_CRYPTO_DATA_SECRET!,
      "chats"
    );
    // localStorage.setItem("chats", JSON.stringify(storedChats));
  }
}
