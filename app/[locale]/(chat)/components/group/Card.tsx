import { Tuser } from "@/store/types";
import useGroupStore from "@/store/useGroupStore";
import Image from "next/image";
import React from "react";

const GroupCard: React.FC<{ user: Tuser }> = ({ user }) => {
  const selectedAddGroupUsers = useGroupStore((s) => s.selectedAddGroupUsers);
  const addAddGroupSelectUser = useGroupStore((s) => s.addAddGroupSelectUser);
  const handleClick = () => {
    addAddGroupSelectUser(user);
  };
  return (
    <div
      onClick={handleClick}
      className={`p-2 rounded-md  dark:text-white cursor-pointer    duration-500 ${
        selectedAddGroupUsers.some((u) => u._id === user._id)
          ? "bg-emerald-500"
          : "dark:bg-gray-800 dark:hover:bg-gray-700 bg-gray-200 hover:bg-gray-300"
      }`}
    >
      <div className="flex items-center gap-3">
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
            className={`absolute bottom-0 right-0 rounded-full ring-1 ring-gray-900 p-1 md:p-[5px] ${
              user?.onlineStatus === "online"
                ? "animate-pulse bg-green-500"
                : "bg-rose-500"
            }`}
          ></span>
        </div>
        <div>
          <h3 className="text-xs md:text-sm font-bold">{user.name}</h3>
          <span className="text-[10px]">{user.email}</span>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
