import React from "react";
import Image from "next/image";
import { IMessage } from "@/context/reducers/interfaces";
import { useMessageState } from "@/context/MessageContext";
import { calculateTime } from "@/functions/formatTime";

function ImageMessage({ message }: { message: IMessage }) {
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
        <Image
          src={`${message.file.url}`}
          alt={"Unknown file"}
          className={"rounded-lg w-auto h-auto"}
          height={300}
          width={300}
          loading="lazy"
        />
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

export default ImageMessage;
