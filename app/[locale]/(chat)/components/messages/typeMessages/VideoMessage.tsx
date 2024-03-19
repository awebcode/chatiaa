import React from "react";
import { IMessage } from "@/context/reducers/interfaces";
import { useMessageState } from "@/context/MessageContext";
import { calculateTime } from "@/functions/formatTime";

function VideoMessage({ message }: { message: IMessage }) {
  const { user: userInfo, selectedChat: currentChatUser } = useMessageState();

  return (
    <div
      className={`p-1 rounded-lg ${
        message.sender._id === currentChatUser?.userInfo._id
          ? "bg-incoming-background"
          : "bg-outgoing-background"
      }`}
    >
      <div className={"relative"}>
        <div className="h-72 w-72"><video
          src={`${message.file.url}`}
          controls
          className={"rounded-lg w-full h-full"}
          // height={300}
          // width={300}
        /></div>
        <div className={"absolute bottom-1 right-1 flex items-end gap-1"}>
          <span className={"text-bubble-meta text-[11px] pt-1 min-w-fit"}>
            {calculateTime(message.createdAt)}
          </span>
          <span className={"text-bubble-meta"}></span>
        </div>
      </div>
    </div>
  );
}

export default VideoMessage;
