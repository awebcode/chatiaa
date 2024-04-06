import Image from "next/image";
import React from "react";
import moment from "moment";
import { Tuser } from "@/store/types";
import { useAccessChatMutation } from "../mutations/Chatmutations";

const UserCard: React.FC<{ user: Tuser }> = ({ user }) => {
  const mutaion = useAccessChatMutation("closeSearchUsersSheet");

  const handleClick = () => {
    mutaion.mutateAsync(user._id as any);
  };

  return (
    <div
      onClick={handleClick}
      className="p-3 rounded-md  cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800  dark:hover:bg-gray-900 duration-300"
    >
      <div className="flex items-center gap-2">
        <div className="h-8 md:h-8 w-8 md:w-8 relative rounded-full  ">
         
            <Image
              height={35}
              width={35}
              className=" h-full w-full object-cover rounded-full"
              alt={user.name}
            src={user.image}
            loading="lazy"
            />
        </div>
        <div className="flex flex-col text-left gap-1">
          <h3 className="text-xs md:text-sm font-bold">{user.name}</h3>
          <span className="text-[8px]">{user.email.slice(0, 30)}</span>
          <span className="text-[8px]">
            <span className="mr-1"> Joined</span>
            {moment((user as any).createdAt).fromNow()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
