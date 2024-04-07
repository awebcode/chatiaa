import React from "react";

import { TooltipContent } from "@/components/ui/tooltip";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/navigation";
import { Tuser } from "@/store/types";
import Image from "next/image";
import { FaComments, FaMicrophone, FaVideo } from "react-icons/fa";
import { useAccessChatMutation } from "../../mutations/Chatmutations";
import { CLEAR_MESSAGES } from "@/context/reducers/actions";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { handleSendCall } from "@/config/handleSendCall";
import { useSocketContext } from "@/context/SocketContextProvider";
import { IChat } from "@/context/reducers/interfaces";
const TooltipContentComponent = ({ user,chat }: { user: Tuser,chat?:IChat }) => {
  const {user:currentUser}=useMessageState();
  const {socket}=useSocketContext()
  const dispatch=useMessageDispatch()
  const Router = useRouter();
  const mutaion = useAccessChatMutation("");
  
  const handleAccessChat = (userId: string) => {
    dispatch({ type: CLEAR_MESSAGES });
    mutaion.mutateAsync(userId as any);
  };
  return (
    <div>
      {user && (
        <TooltipContent className=" dark:bg-gray-100  p-4 flex  gap-2 rounded-3xl">
          <div className="mt-2 h-16 w-16 md:h-20 md:w-20 flex p-2 flex-col justify-center items-center">
            {" "}
            <div className="relative  p-[2px] h-16 w-16 ring md:ring-2 ring-violet-500 rounded-full">
              {" "}
              <Image
                height={35}
                width={35}
                className="rounded-full h-full w-full object-cover"
                alt={user?.name}
                src={user?.image}
              />
              <span
                className={` absolute bottom-1 -right-0 rounded-full ring-1 ring-gray-900 p-[6px] ${
                  user?.isOnline ? "animate-pulse bg-green-500" : "bg-rose-500"
                }`}
              ></span>
            </div>
            <div className="flex items-center justify-center mt-4 gap-1">
              {/* Video Icon */}
              <div className="rounded-full bg-white dark:bg-gray-700 hover:bg-opacity-80 shadow p-2 text-xl">
                <FaVideo
                  onClick={() =>
                    handleSendCall("video", currentUser, chat as any, socket, dispatch)
                  }
                  className=" text-[10px] text-blue-500 cursor-pointer hover:text-blue-700"
                />
              </div>

              {/* Audio Icon */}
              <div className="rounded-full bg-white dark:bg-gray-700 hover:bg-opacity-80 shadow p-2 text-xl">
                <FaMicrophone
                  onClick={() =>
                    handleSendCall("audio", currentUser, chat as any, socket, dispatch)
                  }
                  className="text-[10px] text-green-500 cursor-pointer hover:text-green-700"
                />
              </div>
              {/* Chat Icon */}
              <div className="rounded-full bg-white dark:bg-gray-700 hover:bg-opacity-80 shadow p-2 text-xl">
                <FaComments
                  onClick={() => handleAccessChat(user._id)}
                  className="text-[10px] text-purple-500 cursor-pointer hover:text-purple-700"
                />
              </div>
            </div>
          </div>
          <div>
            <Button
              onClick={() => Router.push(`/user/profile/${user?._id}`)}
              className="w-full text-sm bg-blue-600 cursor-pointer"
              variant={"ghost"}
            >
              View Profile
            </Button>
            <h1 className="text-sm md:text-lg font-bold">{user?.name}</h1>
            <h3 className="text-xs md:text-sm font-medium">{user?.email}</h3>
            <p className="text-[10px] md:text-xs font-normal">
              Joined:{moment(user?.createdAt).format("lll")}
            </p>
          </div>
        </TooltipContent>
      )}
    </div>
  );
};

export default TooltipContentComponent;
