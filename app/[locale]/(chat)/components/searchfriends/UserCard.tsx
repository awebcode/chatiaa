import Image from "next/image";
import React from "react";
import moment from "moment";
import { Tuser } from "@/store/types";
import { useAccessChatMutation } from "../mutations/Chatmutations";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/navigation";
import { BsThreeDots } from "react-icons/bs";
import { Button } from "@/components/ui/button";
const UserCard: React.FC<{ user: Tuser }> = ({ user }) => {
  const mutaion = useAccessChatMutation("closeSearchUsersSheet");

  const handleClick = () => {
    mutaion.mutateAsync(user._id as any);
  };

  return (
    <div className="flex items-center justify-between bg-gray-100 hover:bg-gray-200 dark:bg-gray-800  dark:hover:bg-neutral-800 duration-300 rounded-md">
      <div
        onClick={handleClick}
        className="p-2 rounded-md basis-[90%] w-full  cursor-pointer "
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 relative rounded-full  ">
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
            <h3 className="text-sm md:text-lg font-bold">{user.name}</h3>
            <span className="text-xs ">{user.email}</span>
            <span className="text-[10px] ">
              <span className="mr-1"> Joined</span>
              {moment((user as any).createdAt).fromNow()}
            </span>
          </div>
        </div>
      </div>
      {/* Dropdown here */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={"icon"} className="bg-transparent">
            <BsThreeDots className="text-sm " />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Menus</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <Link href={`/user/profile/${user?._id}`}>View profile</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserCard;
