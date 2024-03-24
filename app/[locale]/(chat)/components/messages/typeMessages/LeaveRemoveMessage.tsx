import { IMessage } from "@/context/reducers/interfaces";
import React from "react";
import Time from "./Time";
import { IoReturnUpBackOutline } from "react-icons/io5";
export default function LeaveRemoveMessage({
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
  return (
    <div className="my-2 flex-col w-full text-center flex justify-center items-center p-2 rounded bg-gray-800 ">
      <Time message={message} isCurrentUserMessage={isCurrentUserMessage} />
      <h1 className="text-sm text-center flex gap-1 font-medium text-gray-400 ">
        <IoReturnUpBackOutline  />
        {message.content}
      </h1>
    </div>
  );
}
