import React from "react";
import Image from "next/image";
import { IMessage } from "@/context/reducers/interfaces";
import { useMessageState } from "@/context/MessageContext";
import { calculateTime } from "@/functions/formatTime";
import dynamic from "next/dynamic";
import Time from "./Time";
import { handleDownload } from "@/config/handleDownload";
import { RiDownloadCloudFill } from "react-icons/ri";
import FullScreenPreview from "../../chatheader/media/FullScreen";
const RREsystem = dynamic(() => import("../RRE/RREsystem"));
const Status = dynamic(() => import("./Status"));
const DisplayReaction = dynamic(() => import("./reactions/DisplayReaction"));

// Import RepliedMessage dynamically
const RepliedMessage = dynamic(() => import("./reply/RepliedMessage"));
function ImageMessage({
  message,
  isCurrentUserMessage,
}: {
  message: IMessage;
  isCurrentUserMessage: boolean;
}) {
  const { selectedChat: currentChatUser, user: currentUser } = useMessageState();
  return (
    <div className="flex items-center gap-2 max-w-sm md:max-w-2xl">
      {/* Remove/Replay/Emoji */}
      <RREsystem message={message} isCurrentUserMessage={isCurrentUserMessage} />
      <div className="">
        <Time message={message} isCurrentUserMessage={isCurrentUserMessage} />
        <div
          className={`m-4 p-1 rounded-lg ${
            message?.sender?._id === currentChatUser?.userInfo?._id
              ? "bg-gray-200 text-gray-900 dark:text-gray-200 dark:bg-incoming-background rounded-bl-3xl"
              : "dark:bg-outgoing-background rounded-br-3xl bg-gray-300"
          }`}
        >
          <div className={""}>
            <div className={"relative"}>
              {/* Reply */}
              <div className="pt-6"><RepliedMessage message={message} currentUser={currentUser as any} /></div>
              <Image
                src={`${message.file.url}`}
                alt={"Unknown file"}
                className={"rounded-lg w-auto h-auto"}
                height={300}
                width={300}
                loading="lazy"
              />
              <FullScreenPreview file={{ url: message?.file?.url, type: message.type }} />
              <RiDownloadCloudFill
                className="absolute bottom-1 right-1 text-xl cursor-pointer text-gray-300"
                onClick={() => handleDownload(message?.file?.url)}
              />

              {/* REACTIONS */}
              {message.reactions?.length > 0 && (
                <DisplayReaction
                  message={message}
                  reactions={message.reactions}
                  isCurrentUserMessage={isCurrentUserMessage}
                  reactionsGroup={message.reactionsGroup}
                />
              )}
              {/* message status */}
              <Status
                isCurrentUserMessage={isCurrentUserMessage}
                message={message}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageMessage;
