import { IMessage } from "@/context/reducers/interfaces";
import React from "react";
import Time from "./Time";
import { IoReturnUpBackOutline } from "react-icons/io5";
export default function NotifyMessage({
  message,
  isCurrentUserMessage,
}: {
  message: IMessage;
  isCurrentUserMessage: boolean;
}) {
  return (
    <div className="   text-center flex flex-col justify-center items-center  rounded  ">
      <Time message={message} isCurrentUserMessage={isCurrentUserMessage} />
      <h1 className="text-sm text-center flex gap-1 font-medium text-gray-400 ">
        <IoReturnUpBackOutline  />
        {message.content}
      </h1>
    </div>
  );
}
