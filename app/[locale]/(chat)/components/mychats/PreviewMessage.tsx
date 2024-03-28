import { AiOutlineAudio } from "react-icons/ai";
import { getSenderFull } from "../logics/logics";
import { MdOutlineOndemandVideo } from "react-icons/md";
import { CiImageOn } from "react-icons/ci";
import { PiFilePdf } from "react-icons/pi";
import { IChat } from "@/context/reducers/interfaces";
import { Tuser } from "@/store/types";
export function MessagePreview({
  chat,
  currentUser,
}: {
  chat: IChat;
  currentUser: Tuser;
}) {
  const senderName =
    chat?.latestMessage?.sender?._id === currentUser?._id
      ? "You"
      : chat?.latestMessage?.sender?.name;
  let previewContent;
  switch (chat?.latestMessage?.type) {
    case "image":
      previewContent = (
        <span className={`${!chat?.latestMessage?.isSeen?"font-bold":""}`}>
          {senderName} sent an{" "}
          <CiImageOn className="text-blue-500 text-lg inline mx-[1px]" />
          image
        </span>
      );
      break;
    case "audio":
      previewContent = (
        <span className={`${!chat?.latestMessage?.isSeen?"font-bold":""}`}>
          {senderName} sent an{" "}
          <AiOutlineAudio className="text-blue-500 text-lg inline mx-[1px]" /> audio
        </span>
      );
      break;
    case "video":
      previewContent = (
        <span className={`${!chat?.latestMessage?.isSeen?"font-bold":""}`}>
          {senderName} sent a{" "}
          <MdOutlineOndemandVideo className="text-blue-500 text-lg inline mx-[1px]" />{" "}
          video
        </span>
      );
      break;
    case "application":
      previewContent = (
         <span className={`${!chat?.latestMessage?.isSeen?"font-bold":""}`}>
          {senderName} sent a{" "}
          <PiFilePdf className="text-blue-500 text-lg inline mx-[1px]" /> Pdf file
        </span>
      );
      break;
    default:
      if (chat?.latestMessage?.content && !chat?.latestMessage?.isSeen) {
        previewContent =
          chat?.latestMessage?.content.length > 25
            ? chat?.latestMessage?.content.substring(0, 25) + "..."
            : chat?.latestMessage?.content;
      } else if (chat?.latestMessage?.content && chat?.latestMessage?.isSeen) {
        previewContent = (
          <span className="font-bold">
            {chat?.latestMessage?.content.length > 25
              ? chat?.latestMessage?.content.substring(0, 25) + "..."
              : chat?.latestMessage?.content}
          </span>
        );
         
      } else {
        previewContent = "Start a new conversation";
      }
  }

  return <>{previewContent}</>;
}
