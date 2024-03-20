import { useMessageState } from "@/context/MessageContext";
import { IMessage } from "@/context/reducers/interfaces";
import { calculateTime } from "@/functions/formatTime";
import React from "react";
import dynamic from "next/dynamic";
import { ChatSkeleton } from "../../mychats/ChatSkeleton";
const DisplayReaction = dynamic(() => import("./reactions/DisplayReaction"), {
  loading: () => <ChatSkeleton />,
  ssr: false,
});

// Import RepliedMessage dynamically
const RepliedMessage = dynamic(() => import("./reply/RepliedMessage"), {
  loading: () => <ChatSkeleton />,
  ssr: false,
});

const RREsystem = dynamic(() => import("../RRE/RREsystem"), {
  loading: () => <ChatSkeleton />,
  ssr: false,
});
const Status = dynamic(() => import("./Status"), {
  loading: () => <ChatSkeleton />,
  ssr: false,
});
const TextMessage = ({
  message,
  isLastSeenMessage,
  isUserOnline,
  isCurrentUserMessage,
}: {
  message: IMessage;
  isLastSeenMessage: boolean;
  isUserOnline: boolean;
  isCurrentUserMessage: boolean;
}) => {
  const { selectedChat: currentChatUser, user: currentUser } = useMessageState();
  return (
    <div className="flex items-center gap-2 max-w-sm md:max-w-2xl">
      {/* Remove/Replay/Emoji */}
      <RREsystem message={message} />

      <div
        className={`relative m-4 p-1 rounded  ${
          message.sender._id === currentChatUser?.userInfo._id
            ? "bg-incoming-background rounded-bl-3xl"
            : "bg-outgoing-background rounded-br-3xl"
        }`}
      >
        <div className={""}>
          <div className="relative px-4 py-2">
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
          </div>
        </div>
        <div className={"absolute -top-5 right-1 flex items-end gap-1"}>
          <span className={"text-bubble-meta text-[11px] pt-1 min-w-fit"}>
            {calculateTime(message.createdAt)}
          </span>
          <span className={"text-bubble-meta"}></span>
        </div>
      </div>
    </div>
  );
};

export default TextMessage;
