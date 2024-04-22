import { IChat, IMessage } from "@/context/reducers/interfaces";
import { Tuser } from "@/store/types";
import Image from "next/image";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IoIosCheckmarkCircle, IoIosCheckmarkCircleOutline } from "react-icons/io";
import dynamic from "next/dynamic";
const TooltipContentComponent = dynamic(
  () => import("../../messages/typeMessages/TooltipWrapper")
);
const SeenByGroup = ({ chat, currentUser }: { chat: IChat; currentUser: Tuser }) => {
  return (
    <div className="">
      <div className="flex  gap-1">
        {/* unseen */}
        {chat?.latestMessage?.status === "unseen" && (
          <div className="h-4 w-4 relative m-1">
            <IoIosCheckmarkCircleOutline className="h-4 w-4 text-gray-400  rounded-full relative" />
          </div>
        )}
        {/* Delivered */}
        {chat?.latestMessage?.status === "delivered" &&
        chat?.latestMessage?.sender?._id === currentUser?._id ? (
          <div className="h-4 w-4 relative m-1">
            <IoIosCheckmarkCircle className="h-4 w-4 relative text-gray-400" />
          </div>
        ) : (
          (chat?.latestMessage?.status === "delivered" || !chat?.latestMessage?.isSeen) &&
          chat?.latestMessage?.sender?._id !== currentUser?._id && (
            <>
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>{" "}
              {/* {!chat?.latestMessage?.isSeen && (
                <span className="text-[10px] ">
                  {chat?.unseenCount > 0
                    ? chat?.unseenCount > 99
                      ? "99+"
                      : chat?.unseenCount
                    : ""}
                </span>
              )}{" "} */}
            </>
          )
        )}
        {/* seen */}
        {chat?.latestMessage?.status === "seen" &&
          chat?.latestMessage?.seenBy?.slice(0, 5)?.map((user: any) => {
            return (
              <TooltipProvider key={user?.userId?._id}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="h-4 w-4 rounded-full cursor-pointer ">
                      <Image
                        src={user?.userId?.image || user?.image}
                        height={20}
                        width={20}
                        alt="image"
                        className="h-full w-full object-cover rounded"
                        loading="lazy"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContentComponent
                    user={(user?.userId as any) || (user as any)}
                    chat={chat}
                  />
                </Tooltip>
              </TooltipProvider>
            );
          })}
        {chat?.latestMessage && chat?.latestMessage?.totalseenBy > 3 ? (
          <span className="text-xs">+{chat?.latestMessage?.totalseenBy - 3}</span>
        ) : null}
      </div>
    </div>
  );
};

export default SeenByGroup;
