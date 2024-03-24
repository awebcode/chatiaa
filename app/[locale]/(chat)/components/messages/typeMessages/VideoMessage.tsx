import React from "react";
import { IMessage } from "@/context/reducers/interfaces";
import { useMessageState } from "@/context/MessageContext";
import { calculateTime } from "@/functions/formatTime";
import dynamic from "next/dynamic";
import Time from "./Time";
const RREsystem = dynamic(() => import("../RRE/RREsystem"));
const Status = dynamic(() => import("./Status"))
const DisplayReaction = dynamic(() => import("./reactions/DisplayReaction"));

// Import RepliedMessage dynamically
const RepliedMessage = dynamic(() => import("./reply/RepliedMessage"));
function VideoMessage({
  message,
  isLastSeenMessage,
  isUserOnline,
  isCurrentUserMessage,
}: {
  message: IMessage;
  isLastSeenMessage: boolean;
  isUserOnline: boolean;
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
          <div className={"relative"}>
            <div className="h-72 w-72">
              <video
                src={`${message.file.url}`}
                controls
                className={"rounded-lg w-full h-full"}
                // height={300}
                // width={300}
              />
            </div>
            {/* Reply */}
            <RepliedMessage message={message} currentUser={currentUser as any} />
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
              isLastSeenMessage={isLastSeenMessage}
              isUserOnline={isUserOnline}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoMessage;
