import { useMessageState } from "@/context/MessageContext";
import { IMessage } from "@/context/reducers/interfaces";
import { calculateTime } from "@/functions/formatTime";
import React from "react";

const TextMessage = ({ message }: { message: IMessage }) => {
  const { selectedChat: currentChatUser } = useMessageState();
  return (
    <div
      className={`p-1 rounded-lg ${
        message.sender._id === currentChatUser?.userInfo._id
          ? "bg-incoming-background"
          : "bg-outgoing-background"
      }`}
    >
      <div className={"relative"}>
        <div className="px-4 py-2">
          <span className={"break-all text-sm font-thin text-gray-200"}>{message.content}</span>
        
        </div>
        <div className={"absolute -bottom-5 right-1 flex items-end gap-1"}>
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
