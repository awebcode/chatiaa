import React from "react";
import { BsArchive, BsBoxArrowLeft, BsCheck, BsLock, BsMicMute } from "react-icons/bs";
import { MdCall, MdDelete, MdVideoCall } from "react-icons/md";
import { RiProfileLine } from "react-icons/ri";
import {
  useBlockMutation,
  useDeleteSingleChatMutation,
  useLeaveChatMutation,
  useRemoveFromGroup,
} from "../mutations/Chatmutations";
import { useMessageState } from "@/context/MessageContext";
import { Tuser } from "@/store/types";
import { IChat } from "@/context/reducers/interfaces";
import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { PopoverContent } from "@/components/ui/popover";
import { PopoverArrow } from "@radix-ui/react-popover";
import { useTheme } from "next-themes";

const Modal = ({
  chatBlockedBy,
  chat,
}: {
  chatBlockedBy: Tuser[];
  chat: IChat;
}) => {
  const {theme}=useTheme()
  const blockMutation = useBlockMutation();
  const { user: currentUser } = useMessageState();
  const leaveMutation = useLeaveChatMutation(chat._id as any, currentUser?._id as any);
  const deleteSignleChatMutation = useDeleteSingleChatMutation(chat._id as any, false);
  const blockData = {
    chatId: chat._id,
    status: chatBlockedBy?.some((user) => user?._id === currentUser?._id)
      ? "unblock"
      : "block",
  };
  const items = [
    {
      name: "Mark as read",
      icon: <BsCheck />,
      action: () => console.log("Mark as read clicked"),
      isHidden: false,
    },
    {
      name: "Mute notifications",
      icon: <BsMicMute />,
      action: () => console.log("Mute notifications clicked"),
      isHidden: false,
    },
    {
      name: "View profile",
      icon: <RiProfileLine />,
      action: () => console.log("View profile clicked"),
      isHidden: chat?.isGroupChat,
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
      name: "Archive",
      icon: <BsArchive />,
      action: () => console.log("Archive clicked"),
      isHidden: false,
    },

    {
      name: chatBlockedBy?.some((user) => user?._id === currentUser?._id) ? (
        <span className="text-blue-500">Unblock</span>
      ) : chatBlockedBy.length > 0 &&
        chatBlockedBy?.some((user) => user?._id !== currentUser?._id) ? (
        <span className="text-rose-600">{chatBlockedBy[0].name} Blocked you</span>
      ) : (
        <span className="text-rose-500">Block</span>
      ),
      icon: <BsLock />,
      action: () => {
        if (confirm("Are you sure?")) {
          blockMutation.mutateAsync(blockData);
        }
      },
      isHidden: chat?.isGroupChat ? true : false,
    },
    {
      name: <span className="text-rose-500">Delete</span>,
      icon: <MdDelete className="text-rose-500" />,
      action: () => {
        if (confirm("Are you sure?")) {
          deleteSignleChatMutation.mutateAsync();
        }
      },
      isHidden: chat?.isGroupChat
        ? (chat?.groupAdmin || []).some((admin: any) => admin._id !== currentUser?._id)
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
      isHidden: !chat?.isGroupChat,
    },
  ];

  return (
    <PopoverContent className=" max-w-52 md:max-w-60 bg-gray-200 dark:bg-gray-900">
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
  );
};

export default Modal;
