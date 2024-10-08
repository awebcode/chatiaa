import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { useTypingStore } from "@/store/useTyping";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { useSocketContext } from "@/context/SocketContextProvider";
import {
  pushgroupSeenBy,
  updateAllMessageStatusAsSeen,
  updateMessageStatus,
} from "@/apisActions/messageActions";
import {
  filterDuplicateTempMessageIds,
  getSender,
  getSenderFull,
} from "../logics/logics";
import { BsThreeDots } from "react-icons/bs";
import dynamic from "next/dynamic";
import { Link, useRouter } from "@/navigation";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import {
  CLEAR_MESSAGES,
  SEEN_PUSH_USER_GROUP_MESSAGE_MY_SIDE,
  SET_SELECTED_CHAT,
  UPDATE_CHAT_STATUS,
} from "@/context/reducers/actions";
import { MessagePreview } from "./PreviewMessage";
import { IChat } from "@/context/reducers/interfaces";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Tuser } from "@/store/types";
import { BiLoaderCircle } from "react-icons/bi";

// Dynamically import SeenBy component
const SeenBy = dynamic(() => import("./status/SeenBy"));

// Dynamically import SeenByGroup component
const SeenByGroup = dynamic(() => import("./status/SeeByGroup"));

const Modal = dynamic(() => import("./Modal"));
import Cookie from "js-cookie";
import { decryptData, encryptAndStoreData, getDecryptedChats } from "@/config/EncDecrypt";
const FriendsCard: React.FC<{
  chat: IChat;
}> = ({ chat }) => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useMessageDispatch();
  const { socket } = useSocketContext();
  const { user: currentUser, selectedChat, messages } = useMessageState();
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
  const isFriend: Tuser = getSenderFull(currentUser, chat.users);

  const handleClick = async (chatId: string) => {
    // queryClient.invalidateQueries({ queryKey: ["chats"] });
    queryClient.invalidateQueries({ queryKey: ["messages"] });
    // filterDuplicateTempMessageIds([], true, (ids) => ids.clear()); //clear message ids in set
    if (selectedChat?.chatId === chatId) return;
    const selectedPrevChatId = decryptData(
      process.env.NEXT_PUBLIC_CRYPTO_DATA_SECRET!,
      "selectedChatId"
    );
    if (selectedPrevChatId && selectedPrevChatId !== chatId) {
      dispatch({ type: CLEAR_MESSAGES });
    }
    // dispatch({ type: SET_SELECTED_CHAT, payload: null });
    //  dispatch({ type: CLEAR_MESSAGES });
    const storedChats = getDecryptedChats(process.env.NEXT_PUBLIC_CRYPTO_DATA_SECRET!);

    const isExistChatIndex = storedChats.findIndex((c: IChat) => c?._id === chat?._id);
    //select chat
    const chatData = {
      _id: chat?._id,
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
      isOnline: chat?.isOnline,
      onCallMembers: chat?.onCallMembers,
      messages:
        isExistChatIndex !== -1
          ? storedChats[isExistChatIndex].messages
          : {
              ...chat?.messages,
            },
    };

    // router.replace
    // console.log({chatData})
    // router.push(`/chat?chatId=${chat?._id}`);
    dispatch({ type: SET_SELECTED_CHAT, payload: chatData });
    //store encrypted selectedchat on localstorage
    encryptAndStoreData(
      chatData,
      process.env.NEXT_PUBLIC_CRYPTO_DATA_SECRET!,
      "selectedChat"
    );
    //stored chatId
    encryptAndStoreData(
      chatId,
      process.env.NEXT_PUBLIC_CRYPTO_DATA_SECRET!,
      "selectedChatId"
    );

    // router.replace(`?chatId=${chat?._id}`);
    //  setRedirectLoading({chatId:""})
    // router.replace(`/chat?chatId=${chat?._id}`);
    // router.push(`/chat/${chat?._id}`);
    // router.replace(`/chat?chatId=${chat?._id}`);
    // if (chat.isGroupChat) {
    //   socket.emit("setup", { id: chat?._id } as any);
    // }
    socket.emit("join", {
      chatId: chat?._id,
    });

    //push group message seen by in message or latest message
    if (
      chat?.latestMessage &&
      (chat?.latestMessage?.content || chat?.latestMessage?.file) &&
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
      dispatch({ type: SEEN_PUSH_USER_GROUP_MESSAGE_MY_SIDE, payload: pushData });

      //send to db
      pushSeenByMutation.mutateAsync({
        chatId: chat?._id,
        messageId: chat?.latestMessage?._id as any,
      });

      //update message status as seen
      if (chat?.latestMessage?.status !== "seen") {
        await updateMessageStatus({ chatId: chat?._id, status: "seen" });
      }
      dispatch({ type: UPDATE_CHAT_STATUS, payload: { chatId, status: "seen" } });
      // updateStatusMutation.mutate(chatId);
      await updateAllMessageStatusAsSeen(chatId);
      // Proceed with other code

      //emit seenby socket here
    } else if (
      //////
      chat?.latestMessage &&
      (chat?.latestMessage?.content || chat?.latestMessage?.file) &&
      chat?.latestMessage?.status !== "seen" &&
      chat?.latestMessage?.sender?._id !== currentUser?._id
    ) {
      dispatch({ type: UPDATE_CHAT_STATUS, payload: { chatId, status: "seen" } });
      updateStatusMutation.mutateAsync(chatId);
    }
  };
  // console.log({chat})
  // console.log({chat,isFriend})
  if (!chat) return;
  return (
    <div className="p-3 rounded-md  dark:bg-gray-800 hover:dark:bg-gray-700 bg-gray-200 text-black hover:bg-gray-300 dark:text-gray-200  cursor-pointer   dark:hover:bg-gray-700 duration-300">
      <div className="flex items-center gap-2 justify-between">
        <div
          // href={`/chat/${chat?._id}`}
          // prefetch
          // shallow
          className="flex items-center gap-2 basis-[90%] cursor-pointer"
          onClick={() => handleClick(chat._id as string)}
        >
          <div className="relative p-[2px] h-8 w-8 md:h-10 md:w-10 ring-1 md:ring-2 ring-violet-600 rounded-full">
            <Image
              height={35}
              width={35}
              className="rounded-full  h-full w-full"
              alt={!chat.isGroupChat ? "image" : chat.chatName}
              src={
                !chat.isGroupChat
                  ? isFriend?.image || "/vercel.svg"
                  : (chat as any)?.image?.url
              }
              // loading="lazy"
            />

            <span
              className={` absolute bottom-0 right-0 rounded-full p-1 ring-1 ring-gray-900 md:p-[6px] ${
                chat?.isOnline ? "animate-pulse bg-green-500" : "bg-rose-500"
              }`}
            ></span>
          </div>

          <div className="flex flex-col justify-center items-start">
            <h3 className="text-xs md:text-sm font-bold">
              {!chat.isGroupChat && chat.users ? isFriend?.name : chat.chatName}
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
                        <span
                          className="text-[10px] md:text-xs text-blue-600"
                          key={index}
                        >
                          {index === 0 ? (
                            <>
                              {/* Show the name of the first typing user */}

                              {/* If there are more than one typing users, show the count */}
                              {array.length > 1 ? (
                                <span>{`${typeuser.userInfo.name} and ${
                                  array.length - 1
                                } more are typing...`}</span>
                              ) : (
                                // If there's only one typing user, show "is typing..."
                                <span> Typing...</span>
                              )}
                            </>
                          ) : null}
                        </span>
                      ))
                  }
                </>
              ) : (
                <MessagePreview chat={chat} currentUser={currentUser as any} />
              )}
            </span>
            <span className="text-[11px] font-medium  inline mr-2">
              {chat?.latestMessage?.content
                ? moment(chat?.latestMessage?.createdAt).format("LT")
                : moment(chat?.createdAt).format("LT")}
              {!chat?.isOnline && !chat?.isGroupChat && (
                <span className="   mx-1 md:inline ">
                  <span className="mr-1">active</span>
                  {moment(
                    isFriend?.lastActive ? isFriend?.lastActive : isFriend?.createdAt
                  ).fromNow()}
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="flex gap-5 items-center ">
          {/* Chat status */}
          {chat?.onCallMembers > 0 ? (
            <Button
              size={"lg"}
              className="bg-green-500 hover:bg-green-600 text-gray-800"
              onClick={() => router.push(`/call/${chat?.chatId}`)}
            >
              Join call
            </Button>
          ) : // ) : ///use this section when prefetch chats and messages or ssr fetch message
          //   selectedChat?.chatId === chat?._id &&
          //   searchParams.get("chatId") !== chat?._id &&
          //   (!searchParams.get("chatId") ||
          //     searchParams.get("chatId") !== selectedChat?._id) ? (
          //   <>
          //     <BiLoaderCircle
          //       className={`animate-spin h-3 w-3 md:h-4

          //        md:w-4 text-blue-600 rounded-full`}
          //     />
          //   </>
          chat?.isGroupChat ? (
            <SeenByGroup chat={chat as any} currentUser={currentUser as any} />
          ) : (
            <SeenBy chat={chat as any} currentUser={currentUser as any} />
          )}

          {}
          {/* Right chat dropdown */}
          <Popover>
            <div className="relative">
              <PopoverTrigger className="border-none outline-none">
                <BsThreeDots className="h-4 w-4 md:h-5 md:w-5 text-emerald-500 " />
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
