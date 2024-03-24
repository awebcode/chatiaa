import { Chat } from "../model/ChatModel";
import { Message } from "../model/MessageModel";
import { User } from "../model/UserModel";

type TnewMessage = {
  sender: string;
  content: string;
  chat: string;
};
export const sentSocketTextMessage = async (newMessage: TnewMessage) => {
  try {
    var data = {
      sender: newMessage.sender,
      content: newMessage.content,
      chat: newMessage.chat,
      type: "text",
    };
    let message: any;
    message = await Message.create(data);

    message = await message.populate("sender", "name image email lastActive");
    message = await message.populate("chat");
    // message = await message.populate("chat")
    message = await User.populate(message, {
      path: "sender chat.users",
      select: "name image email lastActive",
    });

    await Chat.findByIdAndUpdate(newMessage.chat, { latestMessage: message });
    return message;
  } catch (error) {
    console.log({ error });
  }
};


export const leaveFromGroupMessage = async (newMessage: { chatId: string, user: { _id: string; name:string,email:string,image:string}}) => {
  try {
    var data = {
      sender: newMessage.user._id,
      content: `${newMessage.user.name} Leave from the group`,
      chat: newMessage.chatId,
      type: "leave",
      status: "leave",
    };
    let message: any;
    message = await Message.create(data);

    message = await message.populate("sender", "name image email lastActive");
    message = await message.populate("chat");
    // message = await message.populate("chat")
    message = await User.populate(message, {
      path: "sender chat.users",
      select: "name image email lastActive",
    });

    await Chat.findByIdAndUpdate(newMessage.chatId, { latestMessage: message });
    return message;
  } catch (error) {
    console.log({ error });
  }
};

//get file type

export const getFileType = async (
  file: Express.Multer.File
): Promise<string | undefined> => {
  try {
    const { fileTypeFromFile } = await (eval('import("file-type")') as Promise<
      typeof import("file-type")
    >);
    const detectedType = await fileTypeFromFile(file.path);
    let type: string | undefined;

    if (detectedType) {
      // Assign type based on detected MIME type
      const mimeType = detectedType.mime.split("/")[0];
      switch (mimeType) {
        case "image":
          type = "image";
          break;
        case "audio":
          type = "audio";
          break;
        case "video":
          type = "video";
          break;
        case "application":
          type = "application";
          break;
        default:
          type = "file";
          break;
      }
    } else {
      type = ""; // Return undefined if MIME type is not detected
    }

    return type;
  } catch (error) {
    console.error("Error detecting file type:", error);
    throw error;
  }
};
