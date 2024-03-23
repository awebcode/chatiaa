import React from "react";
import Image from "next/image";
import { IMessage } from "@/context/reducers/interfaces";
import { useMessageState } from "@/context/MessageContext";
import { calculateTime } from "@/functions/formatTime";
import dynamic from "next/dynamic";
import Time from "./Time";
const RREsystem = dynamic(() => import("../RRE/RREsystem"));
const Status = dynamic(() => import("./Status"));
const DisplayReaction = dynamic(() => import("./reactions/DisplayReaction"));

// Import RepliedMessage dynamically
const RepliedMessage = dynamic(() => import("./reply/RepliedMessage"));
function ImageMessage({
  message,
  isLastSeenMessage,
  isUserOnline,
  isCurrentUserMessage,
}: {
  message: IMessage;
  isLastSeenMessage: boolean;
  isUserOnline: boolean;
  isCurrentUserMessage:boolean
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
            message.sender._id === currentChatUser?.userInfo._id
              ? "bg-incoming-background"
              : "bg-outgoing-background"
          }`}
        >
          <div className={"relative"}>
            <Image
              src={`${message.file.url}`}
              alt={"Unknown file"}
              className={"rounded-lg w-auto h-auto"}
              height={300}
              width={300}
              loading="lazy"
            />
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

export default ImageMessage;
