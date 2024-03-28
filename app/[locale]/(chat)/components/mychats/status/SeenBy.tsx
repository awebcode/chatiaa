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
const SeenBy = ({ chat, currentUser }: { chat: IChat; currentUser: Tuser }) => {
  return (
    <div className="">
      <div className="flex  gap-1">
        {/* unseen */}
        {chat?.latestMessage?.status === "unseen" && (
          <div className="h-5 w-5 relative m-1">
            <IoIosCheckmarkCircleOutline className="h-5 w-5 text-gray-400 rounded-full relative" />
          </div>
        )}
        {/* Delivered */}
        {chat?.latestMessage?.status === "delivered" &&
        chat?.latestMessage?.sender?._id === currentUser?._id ? (
          <div className="h-5 w-5 relative m-1">
            <IoIosCheckmarkCircle className="h-5 w-5 relative text-gray-400" />
          </div>
        ) : (
          chat?.latestMessage?.status === "delivered" &&
          chat?.latestMessage?.sender?._id !== currentUser?._id && (
            <div className="h-5 w-5 bg-blue-500 rounded-full"></div>
          )
        )}
        {/* seen */}
        {chat?.latestMessage?.status === "seen" &&
          chat?.latestMessage?.seenBy?.slice(0, 5)?.map((user: any) => {
            return (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="h-4 w-4 rounded-full cursor-pointer " key={user?._id}>
                      <Image
                        src={user?.userId?.image || user?.image}
                        height={1000}
                        width={1000}
                        alt="image"
                        className="h-full w-full object-cover rounded"
                        loading="lazy"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user?.userId?.name || user?.name}</p>
                  </TooltipContent>
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

export default SeenBy;
