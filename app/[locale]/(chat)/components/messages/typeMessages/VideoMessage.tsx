import React from "react";
import { IMessage } from "@/context/reducers/interfaces";
import { useMessageState } from "@/context/MessageContext";
import { calculateTime } from "@/functions/formatTime";
import dynamic from "next/dynamic";
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
      <RREsystem message={message} />
      <div
        className={`m-4 p-1 rounded-lg ${
          message.sender._id === currentChatUser?.userInfo._id
            ? "bg-incoming-background"
            : "bg-outgoing-background"
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
              reactions={message.reactions}
              isCurrentUserMessage={isCurrentUserMessage}
              reactionsGroup={message.reactionsGroup}
            />
          )}
          {/* message status */}
          <Status
            message={message}
            isLastSeenMessage={isLastSeenMessage}
            isUserOnline={isUserOnline}
          />
          <div className={"absolute bottom-1 right-1 flex items-end gap-1"}>
            <span className={"text-bubble-meta text-[11px] pt-1 min-w-fit"}>
              {calculateTime(message.createdAt)}
            </span>
            <span className={"text-bubble-meta"}></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoMessage;
