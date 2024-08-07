import Image from "next/image";
import React from "react";
import { Tuser } from "@/store/types";
import {  useMessageState } from "@/context/MessageContext";
import { useAccessChatMutation } from "../../../mutations/Chatmutations";

const UserCard: React.FC<{ user: Tuser | any }> = ({ user }) => {
  const { user: currentUser } = useMessageState();
  const mutaion = useAccessChatMutation("closeOnlineUsersSheet");
  
  const handleClick = () => {
    mutaion.mutateAsync(user?._id as any);
  };

  return (
    <div
      onClick={currentUser?._id !== user?._id ? handleClick : undefined}
      className={`p-3 rounded-md   bg-gray-100 hover:bg-gray-200 dark:bg-gray-800  dark:hover:bg-gray-900 duration-300 ${
        currentUser?._id === user?._id ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="relative flex flex-col  p-[2px] h-8 w-8 md:h-10 md:w-10  rounded-full">
          <Image
            height={35}
            width={35}
            className="rounded-full object-fill h-full w-full"
            alt={user?.name}
            src={user?.image}
            loading="lazy"
          />

          <span
            className={`animate-pulse absolute bottom-0 right-1 rounded-full  p-[4px] bg-green-500
                  }`}
          ></span>
        </div>
        <div className="flex flex-col text-left gap-1">
          <h3 className="text-sm md:text-lg font-bold">{user?.name}</h3>
          <span className="text-xs md:text-sm">{user?.email}</span>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
