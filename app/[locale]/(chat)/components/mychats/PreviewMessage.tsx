import {
  AiOutlineAudio,
 
} from "react-icons/ai";
import { getSenderFull } from "../logics/logics";
import { MdOutlineOndemandVideo } from "react-icons/md";
import { CiImageOn } from "react-icons/ci";
import { PiFilePdf } from "react-icons/pi";
export function MessagePreview({ chat, currentUser }: { chat: any; currentUser: any }) {
  const senderName = getSenderFull(currentUser, chat.users).name;

  let previewContent;
  switch (chat?.latestMessage?.type) {
    case "image":
      previewContent = (
        <>
          {senderName} sent an <CiImageOn className="text-blue-500 text-lg inline mx-[1px]" />
          image
        </>
      );
      break;
    case "audio":
      previewContent = (
        <>
          {senderName} sent an{" "}
          <AiOutlineAudio className="text-blue-500 text-lg inline mx-[1px]" /> audio
        </>
      );
      break;
    case "video":
      previewContent = (
        <>
          {senderName} sent a  <MdOutlineOndemandVideo className="text-blue-500 text-lg inline mx-[1px]" /> video
        </>
      );
      break;
    case "application":
      previewContent = (
        <>
          {senderName} sent a{" "}
          <PiFilePdf className="text-blue-500 text-lg inline mx-[1px]" /> Pdf
          file
        </>
      );
      break;
    default:
      if (chat?.latestMessage?.content) {
        previewContent =
          chat?.latestMessage?.content.length > 15
            ? chat?.latestMessage?.content.substring(0, 15) + "..."
            : chat?.latestMessage?.content;
      } else {
        previewContent = "Start a new conversation";
      }
  }

  return <>{previewContent}</>;
}
