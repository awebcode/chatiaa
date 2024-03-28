import { IMessage } from "@/context/reducers/interfaces";
import Image from "next/image";
import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/navigation";
const TooltipWrapper = ({ message }: { message: IMessage }) => {
  const senderImage = message.sender?.image;
  const Router = useRouter();
  return (
    <div>
      {senderImage && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Image
                src={senderImage}
                alt="Sender Image"
                height={40}
                width={40}
                loading="lazy"
                className="absolute cursor-pointer top-2 right-2 w-6 h-6 rounded-full border-2 border-white"
              />
            </TooltipTrigger>
            <TooltipContent className=" dark:bg-gray-300 rounded-xl flex flex-col gap-1">
              <Button
                size={"lg"}
                onClick={() => Router.push(`/user/profile/${message.sender?._id}`)}
                className="w-full  bg-blue-600 cursor-pointer"
                variant={"ghost"}
              >
                View Profile
              </Button>
              <h1 className="text-lg font-bold">{message.sender?.name}</h1>
              <h3 className="text-sm font-medium">{message.sender?.email}</h3>
              <p className="text-xs font-normal">
                Joined:{moment(message.sender?.createdAt).format("lll")}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default TooltipWrapper;
