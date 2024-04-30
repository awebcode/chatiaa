import { IChat, IMessage } from "@/context/reducers/interfaces";

export function updatelocallStorageChatAndSelectedChat(
  data: IMessage,
  chatId: string
): void {
  const storedChats: IChat[] = JSON.parse(localStorage.getItem("chats") || "[]");
  const storedSelectedChat: any = JSON.parse(
    localStorage.getItem("selectedChat") || "{}"
  );

  const isExistChatIndex = storedChats.findIndex((chat: IChat) => chat?._id === chatId);
  const isExistMessageInSelectechatIndex = storedSelectedChat.messages.messages.findIndex(
    (m: any) => m?._id === data?._id || m?.tempMessageId === data?.tempMessageId
  );

  if (isExistChatIndex !== -1) {
    const existingChat: any = storedChats[isExistChatIndex];

    if (isExistMessageInSelectechatIndex !== -1) {
      storedSelectedChat.messages.messages[isExistMessageInSelectechatIndex] = data;
    } else {
      storedSelectedChat.messages.messages.unshift(data);
    }
    localStorage.setItem("selectedChat", JSON.stringify(storedSelectedChat));

    storedChats[isExistChatIndex].latestMessage = data;
    const messageIndex = existingChat.messages.messages.findIndex(
      (m: IMessage) => m._id === data._id || m.tempMessageId === data.tempMessageId
    );

    if (messageIndex !== -1) {
      existingChat.messages.messages[messageIndex] = data;
    } else {
      existingChat.messages.messages.unshift(data);
    }
    localStorage.setItem("chats", JSON.stringify(storedChats));
  }
}
