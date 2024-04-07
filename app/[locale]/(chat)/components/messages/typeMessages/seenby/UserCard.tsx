import { useRouter } from "@/navigation";
import { Tuser } from "@/store/types";
import Image from "next/image";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BsThreeDotsVertical } from "react-icons/bs";
import { AiOutlineUser, AiOutlineMessage, AiOutlinePhone } from "react-icons/ai"; // Importing required React icons
import { Button } from "@/components/ui/button";
import { handleSendCall } from "@/config/handleSendCall";
import { useSocketContext } from "@/context/SocketContextProvider";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { useAccessChatMutation } from "../../../mutations/Chatmutations";

const UserCard: React.FC<{ user: Tuser }> = ({ user }) => {
  const { socket } = useSocketContext();
  const router = useRouter();
  const { selectedChat, user: currentUser } = useMessageState();
  const dispatch = useMessageDispatch();
  const handleClick = () => {
    router.push(`/user/profile/${user?._id}`);
  };
  //chat
  const mutaion = useAccessChatMutation("closeSeenByDialog");

  const handleChat = () => {
    mutaion.mutateAsync(user._id as any);
  };

  return (
    <div
      className={`flex justify-between items-center p-2 rounded-md  dark:text-white cursor-pointer  dark:bg-gray-800 dark:hover:bg-gray-700 bg-gray-200 hover:bg-gray-300  duration-500 `}
    >
      <div className="flex items-center gap-3 basis-[90%]">
        <div className="h-8 w-8 relative ring-2 ring-violet-700 rounded-full">
          <Image
            height={32}
            width={32}
            className="rounded-full h-full w-full object-cover"
            alt={user.name}
            src={user.image}
            loading="lazy"
          />

          <span
            className={` absolute bottom-0 -right-1 rounded-full ring-1 ring-gray-900 p-[5px] ${
              user?.isOnline ? "animate-pulse bg-green-500" : "bg-rose-500"
            }`}
          ></span>
        </div>
        <div>
          <h3 className="text-xs md:text-sm font-bold">{user.name}</h3>
          <span className="text-[10px]">{user.email}</span>
        </div>
      </div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <BsThreeDotsVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Menus</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleClick}>
              <AiOutlineUser className="inline-block mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={handleChat}>
              <AiOutlineMessage className="inline-block mr-2" /> Chat
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                handleSendCall("audio", currentUser, selectedChat, socket, dispatch);
              }}
            >
              <AiOutlinePhone className="inline-block mr-2" /> Call
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default UserCard;
