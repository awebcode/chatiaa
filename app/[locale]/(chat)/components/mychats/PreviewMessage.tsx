import { AiOutlineAudio } from "react-icons/ai";
import { MdOutlineOndemandVideo } from "react-icons/md";
import { CiImageOn } from "react-icons/ci";
import { PiFilePdf } from "react-icons/pi";
import { IChat } from "@/context/reducers/interfaces";
import { Tuser } from "@/store/types";
import { RenderMessageWithEmojis } from "../logics/checkEmoji";
export function MessagePreview({
  chat,
  currentUser,
}: {
  chat: IChat;
  currentUser: Tuser;
}) {
  const isCurrentUserSender = chat?.latestMessage?.sender?._id === currentUser?._id;
  const senderName =
    chat?.latestMessage?.sender?._id === currentUser?._id
      ? "you"
      : chat?.latestMessage?.sender?.name.slice(0, 10);
  let previewContent;
  switch (chat?.latestMessage?.type) {
    case "image":
      previewContent = (
        <span
          className={`${
            !chat?.latestMessage?.isSeen && !isCurrentUserSender ? "font-bold" : ""
          }`}
        >
          <span className="font-bold text-blue-400">{senderName}</span> sent an{" "}
          <CiImageOn className="text-blue-500 text-lg inline mx-[1px]" />
          image
        </span>
      );
      break;
    case "audio":
      previewContent = (
        <span
          className={`${
            !chat?.latestMessage?.isSeen && !isCurrentUserSender ? "font-bold" : ""
          }`}
        >
          <span className="font-bold text-blue-400">{senderName}</span> sent an{" "}
          <AiOutlineAudio className="text-blue-500 text-lg inline mx-[1px]" /> audio
        </span>
      );
      break;
    case "video":
      previewContent = (
        <span
          className={`${
            !chat?.latestMessage?.isSeen && !isCurrentUserSender ? "font-bold" : ""
          }`}
        >
          <span className="font-bold text-blue-400">{senderName}</span> sent a{" "}
          <MdOutlineOndemandVideo className="text-blue-500 text-lg inline mx-[1px]" />{" "}
          video
        </span>
      );
      break;
    case "application":
      previewContent = (
        <span
          className={`${
            !chat?.latestMessage?.isSeen && !isCurrentUserSender ? "font-bold" : ""
          }`}
        >
          <span className="font-bold text-blue-400">{senderName}</span> sent a{" "}
          <PiFilePdf className="text-blue-500 text-lg inline mx-[1px]" /> Pdf file
        </span>
      );
      break;
    default:
      if (chat?.latestMessage?.content) {
        previewContent = (
          <span
            className={`${
              chat.isGroupChat &&
              chat?.latestMessage?.content &&
              !chat?.latestMessage?.isSeen &&
              !isCurrentUserSender &&
              chat?.latestMessage?.sender?._id !== currentUser?._id
                ? "font-bold"
                : !chat?.latestMessage?.isSeen &&
                  !isCurrentUserSender &&
                  chat?.latestMessage?.status !== "seen"
                ? "font-bold"
                : "font-medium"
            }`}
          >
            <span className="font-bold text-blue-400">{senderName}</span>{" "}
            {/* // chat?.latestMessage?.status !== "seen" */}
            {chat?.latestMessage?.content.length > 25
              ? chat?.latestMessage?.type?.includes("notify" || "call-notify")
                ? chat?.latestMessage?.content.substring(0, 25) + "..."
                : RenderMessageWithEmojis(
                    chat?.latestMessage?.content.substring(0, 25),
                    false
                  ) + "..."
              : chat?.latestMessage?.type?.includes("notify" || "call-notify")
              ? chat?.latestMessage?.content.substring(0, 25) + "..."
              : RenderMessageWithEmojis(chat?.latestMessage?.content, false)}
          </span>
        );
      } else {
        previewContent = "Start a new conversation";
      }
  }
  return <>{previewContent}</>;
}
