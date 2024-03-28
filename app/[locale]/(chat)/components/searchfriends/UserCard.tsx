import { useSocketContext } from "@/context/SocketContextProvider";
import { accessChats } from "@/functions/chatActions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React from "react";
import { getSenderFull } from "../logics/logics";
import moment from "moment";
import { Tuser } from "@/store/types";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { SET_CHATS, SET_SELECTED_CHAT } from "@/context/reducers/actions";

const UserCard: React.FC<{ user: Tuser }> = ({ user }) => {
  const dispatch = useMessageDispatch();
  const { socket } = useSocketContext();
  const { user: currentUser } = useMessageState();
  const queryclient = useQueryClient();
  const mutaion = useMutation({
    mutationFn: (data) => accessChats(data),
    onSuccess: (chat) => {
      const isFriend = getSenderFull(currentUser, chat.chatData?.users);
      const chatData = {
        chatId: chat?.chatData?._id,
        latestMessage: chat?.chatData?.latestMessage,
        chatCreatedAt: chat?.chatData?.createdAt,

        groupChatName: chat?.chatData?.chatName,
        isGroupChat: chat?.chatData?.isGroupChat,
        groupAdmin: chat?.chatData?.groupAdmin,
        // status: chat?.chatData?.chatStatus?.status,
        // chatUpdatedBy: chat?.chatData?.chatStatus?.updatedBy,
        chatStatus: chat?.chatData?.chatStatus,
        users: chat?.chatData?.isGroupChat ? chat?.chatData?.users : null,
        userInfo: {
          name: !chat?.chatData?.isGroupChat ? isFriend?.name : chat?.chatData?.chatName,
          email: !chat?.chatData?.isGroupChat ? isFriend?.email : "",
          _id: !chat?.chatData?.isGroupChat ? isFriend?._id : chat?.chatData?._id,
          image: !chat?.chatData?.isGroupChat ? isFriend?.image : "/vercel.svg",
          lastActive: !chat?.chatData?.isGroupChat
            ? getSenderFull(currentUser, chat?.chatData?.isGroupChat.users)?.lastActive
            : "",
          createdAt: !chat?.chatData?.isGroupChat
            ? isFriend?.createdAt
            : chat?.chatData?.createdAt,
        } as any,
        groupInfo: {
          description: (chat as any)?.description,
          image: { url: (chat as any)?.image?.url },
        },
      };
      // setSelectedChat(chatData as any);
      dispatch({ type: SET_SELECTED_CHAT, payload: chatData });
      if (chat?.isNewChat) {
        dispatch({ type: SET_CHATS, payload: chat.chatData });

        socket.emit("chatCreatedNotify", {
          to: user?._id,
          chat: chat.chatData,
          chatId: chat.chatData?._id,
        });
      }

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
