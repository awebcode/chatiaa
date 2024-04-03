import { SET_MESSAGES } from "@/context/reducers/actions";
import { IChat } from "@/context/reducers/interfaces";
import { Tuser } from "@/store/types";
import { v4 } from "uuid";

// Define a function to check the file type
interface FileData {
  type: string;
}
export const fileTypeChecker = (file: FileData): string => {
  if (file.type.startsWith("image/")) {
    return "image";
  } else if (file.type.startsWith("audio/")) {
    return "audio";
  } else if (file.type.startsWith("video/")) {
    return "video";
  } else if (file.type.startsWith("application/")) {
    return "application";
  } else {
    return ""; // Handle other types if needed
  }
};





//send files and update sender/user ui

interface IMessageData {
    senderId: string;
    receiverId: string;
    chatId: string;
    content: string;
    file: { url: string };
    type: string;
    image: string;
    isGroupChat: boolean ;
    groupChatId: string | null;
    sender: Tuser;
    tempMessageId: string
}
export const updateSenderMessagesUI = async(
  currentUser: Tuser | null,
  selectedChat: IChat | null,
  file: File,
  fileType: string,
  dispatch: (action: any) => void
) => {
  if (!currentUser || !selectedChat) return;
  const  tempMessageId= v4();
  const messageData: IMessageData = {
    senderId: currentUser._id,
    receiverId: selectedChat.userInfo._id,
    chatId: selectedChat.chatId as any,
    content: "",
    file: { url: URL.createObjectURL(file) },
    type: fileType,
    image: currentUser.image,
    isGroupChat: selectedChat.isGroupChat || false,
    groupChatId: selectedChat.isGroupChat ? selectedChat.chatId : (null as any),
    sender: currentUser,
    tempMessageId,
  };

  dispatch({ type: SET_MESSAGES, payload: messageData });
  return  tempMessageId 
};