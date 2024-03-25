import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMessageState } from "@/context/MessageContext";
import { Tuser } from "@/store/types";
import Image from "next/image";
import React from "react";
import { BsBoxArrowLeft, BsThreeDots } from "react-icons/bs";
import {
  useDeleteSingleChatMutation,
  useLeaveChatMutation,
} from "../../mutations/Chatmutations";
import { RiProfileLine } from "react-icons/ri";
import { MdCall, MdDelete, MdVideoCall } from "react-icons/md";
import { PopoverArrow } from "@radix-ui/react-popover";
import { useTheme } from "next-themes";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { useRouter } from "@/navigation";

const Card = ({ user }: { user: Tuser }) => {
  const router=useRouter()
  const { onlineUsers } = useOnlineUsersStore();
  const { selectedChat, user: currentUser } = useMessageState();
  const { theme } = useTheme();
  //check if user online or not
  const isUserOnline = onlineUsers.some((u: any) =>
    selectedChat?.isGroupChat
      ? selectedChat?.users.some(
          (user: any) => user._id === u.id && user?._id !== currentUser?._id
        )
      : selectedChat?.userInfo?._id === u.id
  );
  const leaveMutation = useLeaveChatMutation(
    selectedChat?.chatId as any,
    currentUser?._id as any
  );
  const items = [
    {
      name: "View profile",
      icon: <RiProfileLine />,
      action: () => router.push(user?._id===currentUser?._id?"/profile":`/user/profile/${user?._id}`),
    },
    {
      name: "Audio call",
      icon: <MdCall />,
      action: () => console.log("Audio call clicked"),
      isHidden: false,
    },
    {
      name: "Video call",
      icon: <MdVideoCall />,
      action: () => console.log("Video call clicked"),
      isHidden: false,
    },

    {
      name: <span className="text-rose-500">Remove</span>,
      icon: <MdDelete className="text-rose-500" />,
      action: () => {
        if (confirm("Are you sure?")) {
          //  deleteSignleChatMutation.mutateAsync();
        }
      },
      isHidden: selectedChat?.groupAdmin
        ? selectedChat?.groupAdmin.some((admin: any) => admin?._id === currentUser?._id)
        : false,
    },
    {
      name: <span className="text-rose-500">Leave</span>,
      icon: <BsBoxArrowLeft className="text-rose-500" />,
      action: () => {
        if (confirm("Are you sure?")) {
          leaveMutation.mutateAsync();
        }
      },
      isHidden: currentUser?._id === user?._id ? false : true,
    },
  ];

  return (
    <div className="flex items-center justify-between p-2">
      <div className="flex items-center justify-start gap-2">
        <div className="relative  p-[2px] h-6 w-6 md:h-8 md:w-8 border md:border-2 border-violet-500 rounded-full">
          <Image
            height={35}
            width={35}
            className="rounded-full object-fill h-full w-full"
            alt={user?.name as any}
            src={user?.image as any}
            loading="lazy"
          />

          <span
            className={`absolute bottom-0 -right-1 rounded-full  p-[4px] ${
              isUserOnline ? "bg-green-500" : "bg-rose-500"
            }`}
          ></span>
        </div>
        <div>
          <h2 className="text-gray-200 fon-medium text-xs">{user?.name}</h2>
          <p className=" text-gray-400 text-[10px]">{user?.email}</p>
        </div>
      </div>

      {/* Right side  */}
      <Popover>
        <PopoverTrigger>
          <BsThreeDots />
        </PopoverTrigger>
        <PopoverContent className=" max-w-36 md:max-w-48 bg-gray-200 dark:bg-gray-900">
          <PopoverArrow
            fill={theme === "dark" ? "#1f2937" : "#e4e4e7"}
            height={12}
            width={12}
          />
          {items.map((item, index) => (
            <ul
              key={index}
              className={`flex items-center py-2 px-2 cursor-pointer     hover:bg-gray-600 rounded duration-300 ${
                item.isHidden && "hidden"
              }`}
              onClick={item.action}
            >
              <span className="mr-2 text-xs md:text-sm">{item.icon}</span>
              <span className="text-xs md:text-sm">{item.name}</span>
            </ul>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Card;
