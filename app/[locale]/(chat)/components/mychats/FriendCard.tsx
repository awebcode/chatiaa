import { accessChats } from "@/functions/chatActions";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React, { useState } from "react";
import moment from "moment";
import { useTypingStore } from "@/store/useTyping";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { useSocketContext } from "@/context/SocketContextProvider";
import { updateAllMessageStatusAsSeen } from "@/functions/messageActions";
import { getSender, getSenderFull } from "../logics/logics";
import { BsThreeDots } from "react-icons/bs";
import { useClickAway } from "@uidotdev/usehooks";
import dynamic from "next/dynamic";
import { Link, useRouter } from "@/navigation";
import { RenderStatus } from "../logics/RenderStatusComponent";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { CLEAR_MESSAGES, SET_SELECTED_CHAT } from "@/context/reducers/actions";
import { MessagePreview } from "./PreviewMessage";
const Modal = dynamic(() => import("./Modal"));
const TypingIndicator = dynamic(() => import("../TypingIndicator"));

type TChat = {
  _id?: string;
  latestMessage: { content: string; createdAt: string | any; status: string };
  createdAt: Date | any;
};

const FriendsCard: React.FC<{
  chat: TChat | any;
  unseenArray: any;
}> = ({ chat, unseenArray }) => {
  const dispatch = useMessageDispatch();
  const { socket } = useSocketContext();
  const { user: currentUser, selectedChat } = useMessageState();
  const queryclient = useQueryClient();
  const { onlineUsers } = useOnlineUsersStore();
  const { isTyping, content: typingContent, chatId: typingChatId } = useTypingStore();
  const updateStatusMutation = useMutation({
    mutationKey: ["messages"],
    mutationFn: (chatId: string) => updateAllMessageStatusAsSeen(chatId),
    onSuccess: (data) => {
      const deliverData = {
        senderId: currentUser?._id,
        receiverId: !chat.isGroupChat
          ? getSenderFull(currentUser, chat.users)?._id
          : chat._id,

        image: !chat.isGroupChat ? currentUser?.image : "/vercel.svg",
      };
      socket.emit("deliveredMessage", deliverData);
      queryclient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
  const mutaion = useMutation({
    mutationKey: ["messages", chat?._id],
    mutationFn: (data) => accessChats(data),
    onSuccess: (data) => {
      queryclient.invalidateQueries({ queryKey: ["messages", chat?._id] });

      // console.log({onsuccess:data})
    },
  });

  const handleClick = (chatId: string) => {
    // dispatch({ type: SET_SELECTED_CHAT, payload: null });
    dispatch({ type: CLEAR_MESSAGES });
    //select chat
    const isFriend = getSenderFull(currentUser, chat.users);
    const chatData = {
      chatId: chat?._id,
      lastMessage: chat?.latestMessage?.content,
      createdAt: chat?.latestMessage?.createdAt,
      chatCreatedAt: chat?.createdAt,

      groupChatName: chat?.chatName,
      isGroupChat: chat?.isGroupChat,
      groupAdmin: chat?.groupAdmin,
      status: chat?.chatStatus?.status,
      chatUpdatedBy: chat?.chatStatus?.updatedBy,
      users: chat.isGroupChat ? chat.users : null,
      userInfo: {
        name: !chat?.isGroupChat ? isFriend?.name : chat.chatName,
        email: !chat?.isGroupChat ? isFriend?.email : "",
        _id: !chat?.isGroupChat ? isFriend?._id : chat?._id,
        image: !chat.isGroupChat ? isFriend?.image : "/vercel.svg",
        lastActive: !chat.isGroupChat ? isFriend?.lastActive : "",
        createdAt: !chat.isGroupChat ? isFriend?.createdAt : "",
      } as any,
    };

    dispatch({ type: SET_SELECTED_CHAT, payload: chatData });

    if (chat.isGroupChat) {
      socket.emit("setup", { id: chat?._id } as any);
    }
    socket.emit("join", {
      chatId: chat?._id,
    });
    //accessChat
    mutaion.mutateAsync(getSenderFull(currentUser, chat.users)?._id as any);
    if (
      chat?.latestMessage?.status === "unseen" ||
      chat?.latestMessage?.status === "delivered"
    ) {
      updateStatusMutation.mutateAsync(chatId);
    }
    // queryclient.invalidateQueries({ queryKey: ["messages", chatId] });
  };
  const isUserOnline = onlineUsers.some((u: any) =>
    chat.isGroupChat
      ? chat.users.some((user: any) => user._id === u.id)
      : getSenderFull(currentUser, chat.users)?._id === u.id
  );

  const [open, setOpen] = useState(false);
  const userModalRef: any = useClickAway(() => {
    setOpen(false);
  });
  // console.log({chat:getSenderFull(currentUser, chat.users)})
  return (
    <div className="p-3 rounded-md  dark:bg-gray-800  bg-gray-200 text-black hover:bg-gray-300 dark:text-white  cursor-pointer   dark:hover:bg-gray-700 duration-300">
      <div className="flex items-center gap-2 justify-between">
        <div
          className="flex items-center gap-2 basis-[80%]"
          onClick={() => handleClick(chat._id as string)}
        >
          <div className="relative p-[2px] h-10 w-10 ring-2 ring-violet-600 rounded-full">
            {!chat.isGroupChat &&
            getSenderFull(currentUser, chat.users).image?.includes("accessoriesType") ? (
              <img
                height={35}
                width={35}
                className="rounded-full  h-full w-full"
                alt={
                  !chat.isGroupChat
                    ? getSenderFull(currentUser, chat.users).image
                    : chat.chatName
                }
                src={
                  !chat.isGroupChat
                    ? getSenderFull(currentUser, chat.users)?.image
                    : "/vercel.svg"
                }
              />
            ) : (
              <Image
                height={35}
                width={35}
                className="rounded-full  h-full w-full"
                alt={
                  !chat.isGroupChat
                    ? getSenderFull(currentUser, chat.users).image
                    : chat.chatName
                }
                src={
                  !chat.isGroupChat
                    ? getSenderFull(currentUser, chat.users)?.image
                    : "/vercel.svg"
                }
              />
            )}
            <span
              className={`absolute bottom-0 right-0 rounded-full p-[6px] ${
                isUserOnline ? "bg-green-500" : "bg-rose-500"
              }`}
            ></span>
          </div>

          <div>
            <h3 className="text-xs md:text-sm font-bold">
              {!chat.isGroupChat ? getSender(currentUser, chat.users) : chat.chatName}
            </h3>
            <span
              className={`text-xs md:text-xs ${
                chat?.latestMessage?.status === "delivered" &&
                chat?.latestMessage?.sender?._id !== currentUser?._id
                  ? "font-bold"
                  : ""
              }`}
            >
              {isTyping && typingContent && typingChatId === chat?._id ? (
                <TypingIndicator />
              ) : (
                <MessagePreview chat={chat} currentUser={currentUser} />
              )}
            </span>
            <span className="text-[10px] font-bold inline mx-2">
              {chat?.latestMessage?.content
                ? moment(chat?.latestMessage?.createdAt).format("LT")
                : moment(chat?.createdAt).format("LT")}
            </span>
            {/* {!isUserOnline && !chat.isGroupChat ? (
              <span className="text-[9px]">
                LastActive:{" "}
                {moment(getSenderFull(currentUser, chat.users)?.lastActive).format("lll")}
              </span>
            ) : (
              ""
            )} */}
          </div>
        </div>
        <div className="flex gap-5 items-center ">
          {RenderStatus(
            chat?.latestMessage,
            "onFriendListCard",
            unseenArray,
            currentUser,
            false
          )}
          <div ref={userModalRef} className="relative">
            <BsThreeDots onClick={() => setOpen((prev) => !prev)} className="h-6 w-6 " />
            <Modal
              open={open}
              setOpen={setOpen}
              chatId={chat?._id}
              status={chat?.chatStatus?.status}
              updatedBy={chat?.chatStatus?.updatedBy}
              currentUser={currentUser}
              chat={chat}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsCard;
