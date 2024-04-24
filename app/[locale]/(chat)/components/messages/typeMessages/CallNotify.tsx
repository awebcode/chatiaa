import { useMessageState } from "@/context/MessageContext";
import { IMessage } from "@/context/reducers/interfaces";
import React from "react";
import dynamic from "next/dynamic";
import Time from "./Time";
import LoaderComponent from "@/components/Loader";
const SeenBy = dynamic(() => import("./seenby/SeenBy"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});
const DisplayReaction = dynamic(() => import("./reactions/DisplayReaction"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});

// Import RepliedMessage dynamically
const RepliedMessage = dynamic(() => import("./reply/RepliedMessage"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});

const RREsystem = dynamic(() => import("../RRE/RREsystem"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});
const Status = dynamic(() => import("./Status"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});
const CallNotify = ({
  message,
  isCurrentUserMessage,
}: {
  message: IMessage;
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
          className={`relative  m-4 p-[2px]  rounded  ${
            message?.sender?._id === currentChatUser?.userInfo?._id
              ? "bg-gray-200 text-gray-900 dark:text-gray-200 dark:bg-incoming-background rounded-tr-lg"
              : "dark:bg-outgoing-background rounded-br-lg bg-gray-300"
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
              <Status message={message} isCurrentUserMessage={isCurrentUserMessage} />
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

export default CallNotify;
