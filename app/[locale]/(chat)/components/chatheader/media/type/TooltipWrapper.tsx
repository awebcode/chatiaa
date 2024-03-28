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
import { FaComments, FaMicrophone, FaVideo } from "react-icons/fa";
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
            <TooltipContent className=" dark:bg-gray-100  p-4 flex  gap-2 rounded-3xl">
              <div className="mt-2 h-16 w-16 md:h-20 md:w-20 flex p-2 flex-col justify-center items-center">
                {" "}
                <Image
                  height={35}
                  width={35}
                  className="rounded-full h-full w-full object-cover"
                  alt={message.sender?.name}
                  src={message.sender?.image}
                />
                <div className="flex items-center justify-center mt-4 gap-1">
                  {/* Video Icon */}
                  <div className="rounded-full bg-white dark:bg-gray-700 hover:bg-opacity-80 shadow p-2 text-xl">
                    <FaVideo className=" text-[12px] text-blue-500 cursor-pointer hover:text-blue-700" />
                  </div>

                  {/* Audio Icon */}
                  <div className="rounded-full bg-white dark:bg-gray-700 hover:bg-opacity-80 shadow p-2 text-xl">
                    <FaMicrophone className="text-[12px] text-green-500 cursor-pointer hover:text-green-700" />
                  </div>
                  {/* Chat Icon */}
                  <div className="rounded-full bg-white dark:bg-gray-700 hover:bg-opacity-80 shadow p-2 text-xl">
                    <FaComments className="text-[12px] text-purple-500 cursor-pointer hover:text-purple-700" />
                  </div>
                </div>
              </div>
              <div>
                <Button
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
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default TooltipWrapper;
