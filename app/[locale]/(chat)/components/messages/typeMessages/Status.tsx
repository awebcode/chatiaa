import { useMessageState } from "@/context/MessageContext";
import { IMessage } from "@/context/reducers/interfaces";
import React from "react";
import { RenderStatus } from "../../logics/RenderStatusComponent";
import Image from "next/image";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import dynamic from "next/dynamic";
const TooltipContentComponent=dynamic(()=>import("./TooltipWrapper"))
const Status = ({
  message,
  isCurrentUserMessage,
}: {
  message: IMessage;
  isCurrentUserMessage: boolean;
}) => {
  const { selectedChat, user: currentUser } = useMessageState();
  return (
    <div
      className={`absolute bottom-1 ${
        isCurrentUserMessage ? "-right-8" : "bottom-0 -left-8"
      } flex items-end md:gap-1`}
    >
      {message?.sender?._id === currentUser?._id ? (
        // Assuming RenderStatus is a function
        RenderStatus(selectedChat as any, message, "onMessage", 0, false)
      ) : (
        <div className="h-4 w-4 md:h-5 md:w-5 relative cursor-pointer">
          {/* Assuming Image is a component */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  height={35}
                  width={35}
                  className="rounded-full h-full w-full object-cover"
                  alt={message?.sender?.name}
                  src={message?.sender?.image}
                />
              </TooltipTrigger>
              <TooltipContentComponent user={message?.sender} />
            </Tooltip>
          </TooltipProvider>
          <span
            className={`absolute bottom-0 right-0 rounded-full p-[3px] ${
              selectedChat?.isOnline ? "animate-pulse bg-green-500" : "bg-rose-500"
            }`}
          ></span>
        </div>
      )}
    </div>
  );
};

export default Status;
