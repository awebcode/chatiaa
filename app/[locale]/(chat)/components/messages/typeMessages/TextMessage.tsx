import { useMessageState } from "@/context/MessageContext";
import { IMessage } from "@/context/reducers/interfaces";
import React from "react";
import dynamic from "next/dynamic";
import { ChatSkeleton } from "../../mychats/ChatSkeleton";
import Time from "./Time";
import SeenBy from "./SeenBy";
const DisplayReaction = dynamic(() => import("./reactions/DisplayReaction"), {
  loading: () => <ChatSkeleton />,
  ssr: false,
});

// Import RepliedMessage dynamically
const RepliedMessage = dynamic(() => import("./reply/RepliedMessage"), {
  // loading: () => <ChatSkeleton />,
  ssr: false,
});

const RREsystem = dynamic(() => import("../RRE/RREsystem"), {
  // loading: () => <ChatSkeleton />,
  ssr: false,
});
const Status = dynamic(() => import("./Status"), {
  // loading: () => <ChatSkeleton />,
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
    <div
      className={`flex items-center gap-2 max-w-sm  ${
        isCurrentUserMessage ? "" : "flex-row-reverse"
      }`}
    >
      {/* Remove/Replay/Emoji */}
      <RREsystem message={message} isCurrentUserMessage={isCurrentUserMessage} />

      <div className="">
        <Time message={message} isCurrentUserMessage={isCurrentUserMessage} />

        <div
          className={`relative m-4 p-2 rounded  ${
            message?.sender?._id === currentChatUser?.userInfo?._id
              ? "bg-gray-200 text-gray-900 dark:text-gray-200 dark:bg-incoming-background rounded-bl-3xl"
              : "dark:bg-outgoing-background rounded-br-3xl bg-gray-300"
          }`}
        >
          <div className={""}>
            <div className="relative px-4 py-2">
            
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
                message={message}
                isLastSeenMessage={isLastSeenMessage}
                isUserOnline={isUserOnline}
                isCurrentUserMessage={isCurrentUserMessage}
              />
              {/* Seen by lists */}
              {message?.seenBy?.length > 0 && (
                <SeenBy message={message} currentUser={currentUser as any} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Time */}
    </div>
  );
};

export default TextMessage;
