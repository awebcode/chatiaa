import { SET_MESSAGES } from "@/context/reducers/actions";
import { IChat, IMessage } from "@/context/reducers/interfaces";
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
    return "text"; // Handle other types if needed
  }
};

//send files and update sender/user ui

interface IMessageData {
  senderId: string;
  receiverId: string;
  chatId: string;
  content: string;
  file: { url: string } | null;
  type: string;
  image: string;
  isGroupChat: boolean;
  groupChatId: string | null;
  sender: Tuser;
  tempMessageId: string;
  isReply: {
    messageId: IMessage | null;
    repliedBy: Tuser | null;
  } | null;
  isEdit: {
    messageId: IMessage | null;
    editedBy: Tuser | null;
  } | null;
}
export const updateSenderMessagesUI = async (
  currentUser: Tuser | null,
  selectedChat: IChat | null,
  file: File | null,
  fileType: string,
  dispatch: (action: any) => void,
  isReply?: IMessage | null,
  isEdit?: IMessage | null
) => {
  if (!currentUser || !selectedChat) return;
  const tempMessageId = v4();
  const messageData: IMessageData = {
    senderId: currentUser._id,
    receiverId: selectedChat.userInfo._id,
    chatId: selectedChat.chatId as any,
    content: "",
    file: file ? { url: URL.createObjectURL(file) } : null,
    type: fileType || "text",
    image: currentUser.image,
    isGroupChat: selectedChat.isGroupChat || false,
    groupChatId: selectedChat.isGroupChat ? selectedChat.chatId : (null as any),
    sender: currentUser,
    tempMessageId,
    isReply: isReply?._id ? { messageId: isReply , repliedBy: currentUser } : null,
    isEdit: isEdit?._id ? { messageId: isEdit, editedBy: currentUser } : null,
  };
  // console.log({isEdit,isReply})
  dispatch({
    type: SET_MESSAGES,
    payload: {
      ...messageData,
      addMessageType: isReply ? "replyMessage" : isEdit ? "editMessage" : "text",
    },
  });
  return tempMessageId;
};
