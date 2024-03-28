import { accessChats } from "@/functions/chatActions";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React, { useState } from "react";
import moment from "moment";
import { useTypingStore } from "@/store/useTyping";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { useSocketContext } from "@/context/SocketContextProvider";
import {
  pushgroupSeenBy,
  updateAllMessageStatusAsDelivered,
  updateAllMessageStatusAsSeen,
  updateMessageStatus,
} from "@/functions/messageActions";
import { getSender, getSenderFull } from "../logics/logics";
import { BsThreeDots } from "react-icons/bs";
import { useClickAway } from "@uidotdev/usehooks";
import dynamic from "next/dynamic";
import { Link, useRouter } from "@/navigation";
import { RenderStatus } from "../logics/RenderStatusComponent";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import {
  CLEAR_MESSAGES,
  SEEN_PUSH_USER_GROUP_MESSAGE,
  SET_SELECTED_CHAT,
  UPDATE_CHAT_STATUS,
} from "@/context/reducers/actions";
import { MessagePreview } from "./PreviewMessage";
import { IChat } from "@/context/reducers/interfaces";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import SeenBy from "./status/SeenBy";
const Modal = dynamic(() => import("./Modal"));
const TypingIndicator = dynamic(() => import("../TypingIndicator"));

const FriendsCard: React.FC<{
  chat: IChat;
}> = ({ chat }) => {
  const dispatch = useMessageDispatch();
  const { socket } = useSocketContext();
  const { user: currentUser, selectedChat } = useMessageState();
  const { onlineUsers } = useOnlineUsersStore();
  const { typingUsers } = useTypingStore();
  //pushSeenByMutation
  const pushSeenByMutation = useMutation({
    mutationKey: ["group"],
    mutationFn: (body: { chatId: string; messageId: string }) => pushgroupSeenBy(body),
  });

  const updateStatusMutation = useMutation({
    mutationKey: ["messages"],
    mutationFn: (chatId: string) => updateAllMessageStatusAsSeen(chatId),
    onSuccess: (data) => {
      const seenData = {
        senderId: currentUser?._id,
        receiverId: !chat.isGroupChat
          ? getSenderFull(currentUser, chat.users)?._id
          : chat._id,

        image: !chat.isGroupChat ? currentUser?.image : "/vercel.svg",
        chatId: chat._id,
        messageId: chat.latestMessage?._id,
        status: "seen",
        type: "seenAll",
      };
      socket.emit("seenMessage", seenData);
    },
  });

  const handleClick = (chatId: string) => {
    // dispatch({ type: SET_SELECTED_CHAT, payload: null });
    dispatch({ type: CLEAR_MESSAGES });

    //select chat
    const isFriend = getSenderFull(currentUser, chat.users);
    const chatData = {
      chatId: chat?._id,
      chatName: chat?.chatName,
      latestMessage: chat?.latestMessage,
      createdAt: chat?.latestMessage?.createdAt,
      chatCreatedAt: chat?.createdAt,

      groupChatName: chat?.chatName,
      isGroupChat: chat?.isGroupChat,
      groupAdmin: chat?.groupAdmin,
      chatBlockedBy: chat?.chatBlockedBy,
      users: chat.isGroupChat ? chat.users : null,
      userInfo: {
        name: !chat?.isGroupChat ? isFriend?.name : chat.chatName,
        email: !chat?.isGroupChat ? isFriend?.email : "",
        _id: !chat?.isGroupChat ? isFriend?._id : chat?._id,
        image: !chat.isGroupChat ? isFriend?.image : "/vercel.svg",
        lastActive: !chat.isGroupChat ? isFriend?.lastActive : "",
        createdAt: !chat.isGroupChat ? isFriend?.createdAt : chat?.createdAt,
      } as any,
      groupInfo: {
        description: (chat as any)?.description,
        image: { url: (chat as any)?.image?.url },
      },
    };

    dispatch({ type: SET_SELECTED_CHAT, payload: chatData });

    // if (chat.isGroupChat) {
    //   socket.emit("setup", { id: chat?._id } as any);
    // }
    socket.emit("join", {
      chatId: chat?._id,
    });

    //push group message seen by in message or latest message
    if (
      chat?.isGroupChat &&
      (!chat?.latestMessage?.isSeen || chat?.latestMessage?.status !== "seen") &&
      chat?.latestMessage?.sender?._id !== currentUser?._id
    ) {
      //&& !chat?.latestMessage?.isSeen
      const pushData = {
        chatId: chat?._id,
        messageId: chat?.latestMessage?._id,
        user: currentUser,
        status: "seen",
      };

      //emit event to server
      socket.emit("seenPushGroupMessage", pushData);
      //update sender side
      dispatch({ type: SEEN_PUSH_USER_GROUP_MESSAGE, payload: pushData });
      //send to db
      pushSeenByMutation.mutate({
        chatId: chat?._id,
        messageId: chat?.latestMessage?._id as any,
      });

      //update message status as seen
      if (chat?.latestMessage?.status !== "seen") {
        updateMessageStatus({ chatId: chat?._id, status: "seen" }).catch(console.error);
      }
      dispatch({ type: UPDATE_CHAT_STATUS, payload: { chatId, status: "seen" } });
      // updateStatusMutation.mutate(chatId);
      updateAllMessageStatusAsSeen(chatId).catch(console.error);
      // Proceed with other code

      //emit seenby socket here
    } else if (
      !chat?.isGroupChat &&
      (chat?.latestMessage?.status === "unseen" ||
        chat?.latestMessage?.status === "delivered") &&
      chat?.latestMessage?.sender?._id !== currentUser?._id
    ) {
      dispatch({ type: UPDATE_CHAT_STATUS, payload: { chatId, status: "seen" } });
      updateStatusMutation.mutate(chatId);
    }
    // queryclient.invalidateQueries({ queryKey: ["messages", chatId] });
  };

  const isUserOnline = onlineUsers.some((u: any) =>
    chat.isGroupChat
      ? chat.users.some((user: any) => user._id === u.id && user._id !== currentUser?._id)
      : getSenderFull(currentUser, chat.users)?._id === u.id
  );

  return (
    <div className="p-3 rounded-md  dark:bg-gray-800  bg-gray-200 text-black hover:bg-gray-300 dark:text-white  cursor-pointer   dark:hover:bg-gray-700 duration-300">
      <div className="flex items-center gap-2 justify-between">
        <div
          className="flex items-center gap-2 basis-[80%]"
          onClick={() => handleClick(chat._id as string)}
        >
          <div className="relative p-[2px] h-10 w-10 ring-2 ring-violet-600 rounded-full">
            <Image
              height={35}
              width={35}
              className="rounded-full  h-full w-full"
              alt={
                !chat.isGroupChat
                  ? getSenderFull(currentUser, chat.users)?.image
                  : chat.chatName
              }
              src={
                !chat.isGroupChat
                  ? getSenderFull(currentUser, chat.users)?.image
                  : (chat as any)?.image?.url || "/vercel.svg"
              }
              loading="lazy"
            />

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
              {typingUsers.some(
                (typeuser) =>
                  typeuser.chatId === chat?._id &&
                  typeuser.userInfo._id !== currentUser?._id
              ) ? (
                <>
                  {
                    // Filter typing users for the current chat
                    typingUsers
                      .filter((typeuser) => typeuser.chatId === chat?._id)
                      .map((typeuser, index, array) => (
                        <React.Fragment key={index}>
                          {index === 0 ? (
                            <>
                              {/* Show the name of the first typing user */}
                              {typeuser.userInfo.name}
                              {/* If there are more than one typing users, show the count */}
                              {array.length > 1 ? (
                                <span>{` and ${
                                  array.length - 1
                                } more are typing...`}</span>
                              ) : (
                                // If there's only one typing user, show "is typing..."
                                <span> is typing...</span>
                              )}
                            </>
                          ) : null}
                        </React.Fragment>
                      ))
                  }
                </>
              ) : (
                <MessagePreview chat={chat} currentUser={currentUser as any} />
              )}
            </span>
            <span className="text-[10px] font-bold inline mx-2">
              {chat?.latestMessage?.content
                ? moment(chat?.latestMessage?.createdAt).format("LT")
                : moment(chat?.createdAt).format("LT")}
            </span>
          </div>
        </div>
        <div className="flex gap-5 items-center ">
          {/* Chat status */}
          {chat?.isGroupChat ? (
            <SeenBy chat={chat as any} currentUser={currentUser as any} />
          ) : (
            RenderStatus(
              chat,
              chat?.latestMessage as any,
              "onFriendListCard",
              chat?.unseenCount,
              false
            )
          )}
          {}
          {/* Right chat dropdown */}
          <Popover>
            <div className="relative">
              <PopoverTrigger className="border-none outline-none">
                <BsThreeDots className="h-6 w-6 " />
              </PopoverTrigger>
              <Modal chatBlockedBy={chat.chatBlockedBy} chat={chat} />
            </div>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default FriendsCard;
