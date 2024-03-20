import { useSocketContext } from "@/context/SocketContextProvider";
import { accessChats } from "@/functions/chatActions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React from "react";
import { getSenderFull } from "../logics/logics";
import moment from "moment";
import { Tuser } from "@/store/types";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { SET_SELECTED_CHAT } from "@/context/reducers/actions";

const UserCard: React.FC<{ user: Tuser }> = ({ user }) => {
  const dispatch = useMessageDispatch();
  const { socket } = useSocketContext();
  const { user: currentUser } = useMessageState();
  const queryclient = useQueryClient();
  const mutaion = useMutation({
    mutationFn: (data) => accessChats(data),
    onSuccess: (chat) => {
      const isFriend = getSenderFull(currentUser, chat.users);
      const chatData = {
        chatId: chat?._id,
        latestMessage: chat?.latestMessage,
        chatCreatedAt: chat?.createdAt,

        groupChatName: chat?.chatName,
        isGroupChat: chat?.isGroupChat,
        groupAdmin: chat?.groupAdmin,
        // status: chat?.chatStatus?.status,
        // chatUpdatedBy: chat?.chatStatus?.updatedBy,
        chatStatus: chat?.chatStatus,
        users: chat.isGroupChat ? chat.users : null,
        userInfo: {
          name: !chat?.isGroupChat ? isFriend?.name : chat.chatName,
          email: !chat?.isGroupChat ? isFriend?.email : "",
          _id: !chat?.isGroupChat ? isFriend?._id : chat?._id,
          image: !chat.isGroupChat ? isFriend?.image : "/vercel.svg",
          lastActive: !chat.isGroupChat
            ? getSenderFull(currentUser, chat.isGroupChat.users)?.lastActive
            : "",
          createdAt: !chat.isGroupChat ? isFriend?.createdAt : "",
        } as any,
      };
      // setSelectedChat(chatData as any);
      dispatch({ type: SET_SELECTED_CHAT, payload: chatData });

      socket.emit("chatCreatedNotify", { to: user?._id });

      queryclient.invalidateQueries({ queryKey: ["users"] });
      document.getElementById("closeSheetDialog")?.click();
      // setIsOpen(false);
    },
  });

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
          {user.image?.includes("accessoriesType") ? (
            <img
              height={35}
              width={35}
              src={user?.image || "/logo.svg"}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <Image
              height={35}
              width={35}
              className=" h-full w-full object-cover rounded-full"
              alt={user.name}
              src={user.image}
            />
          )}
        </div>
        <div className="flex flex-col gap-1">
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
