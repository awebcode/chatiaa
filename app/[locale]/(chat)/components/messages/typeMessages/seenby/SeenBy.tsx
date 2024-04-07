import { IMessage } from "@/context/reducers/interfaces";
import { Tuser } from "@/store/types";
import Image from "next/image";
import React from "react";
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import dynamic from "next/dynamic";
import { useMessageState } from "@/context/MessageContext";
import SeenByDialog from "./SeenByDialog";
const TooltipContentComponent = dynamic(() => import("../TooltipWrapper"));
const SeenBy = ({ message, currentUser }: { message: IMessage; currentUser: Tuser }) => {
  const { selectedChat } = useMessageState();

  return (
    <div className="absolute -bottom-14">
      <div className="flex m-1 gap-1">
        {message?.seenBy?.map((user: any) => {
          return (
            <TooltipProvider key={user?.userId?._id}>
              <Tooltip>
                <TooltipTrigger>
                  <div className="h-4 w-4 rounded-full cursor-pointer ">
                    <Image
                      src={user?.userId?.image || user.userId?.image}
                      height={20}
                      width={20}
                      alt="image"
                      className="h-full w-full object-cover rounded"
                      loading="lazy"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContentComponent
                  chat={selectedChat as any}
                  user={user?.userId || user}
                />
              </Tooltip>
            </TooltipProvider>
          );
        })}
        {message?.totalseenBy > 10 ? (
          <span className="text-xs">
            +{message?.totalseenBy - message?.seenBy.length}{" "}
            <SeenByDialog message={message}  />
          </span>
        ) : message?.totalseenBy > 0 ? ( //null
          <>
            <SeenByDialog message={message}  />
          </>
        ) : null}
      </div>
    </div>
  );
};

export default SeenBy;
