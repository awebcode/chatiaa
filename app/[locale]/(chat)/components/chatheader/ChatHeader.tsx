"use client";
import Image from "next/image";
import React, { useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { MdCall, MdVideoCall } from "react-icons/md";
import dynamic from "next/dynamic";
import { useRouter } from "@/navigation";
import moment from "moment";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { CLEAR_MESSAGES, SET_SELECTED_CHAT } from "@/context/reducers/actions";
import { useTypingStore } from "@/store/useTyping";
import { useSocketContext } from "@/context/SocketContextProvider";
import { Button } from "@/components/ui/button";
import { handleSendCall } from "@/config/handleSendCall";
import LoaderComponent from "@/components/Loader";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Cookie from "js-cookie";
import { RevalidatePath } from "@/apisActions/serverActions";
import { filterDuplicateTempMessageIds } from "../logics/logics";
// import { useQueryClient } from "@tanstack/react-query";
const RightUserDrawer = dynamic(() => import("./userSheet/RightUserDrawer"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});
const RightGroupDrawer = dynamic(() => import("./groupSheet/RightGroupDrawer"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});

const ChatHeader = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocketContext();
  const router = useRouter();
  const { selectedChat, user: currentUser } = useMessageState();
  const dispatch = useMessageDispatch();
  const { typingUsers } = useTypingStore();
  const isUserOnline = selectedChat?.isOnline as boolean;
  const searchParams = useSearchParams();
  const clearselectedChat = async () => {
    // window.history.pushState(null, "", "/chat");
     filterDuplicateTempMessageIds([], true, (ids) => ids.clear());
    Cookie.remove("selectedChat");
    router.replace("?isEmpty=true");
    // queryClient.invalidateQueries({ queryKey: ["chats"] });
    queryClient.invalidateQueries({ queryKey: ["messages"] });
    dispatch({ type: SET_SELECTED_CHAT, payload: null });
    dispatch({ type: CLEAR_MESSAGES });
    localStorage.removeItem("selectedChat");
    // RevalidatePath("/chat")
    // router.refresh();
    // router.push("/chat");
  };
  //  const roomId = searchParams.get("chatId");
  //  const isEmpty = searchParams.get("isEmpty");
  // useEffect(() => {
  //   const localStorageChat = localStorage.getItem("selectedChat");
  //   if (!selectedChat || !localStorageChat||!roomId||isEmpty) return router.replace("/chat");
  // }, [selectedChat, router,roomId,isEmpty]);
  //  if (!selectedChat) return router.replace("/chat");
  // if (!selectedChat) return <LoaderComponent text="Redirecting..."/>
  return (
    <div className="p-[6px]  bg-gray-200  dark:bg-gray-800  flexBetween rounded z-50 transition-all duration-300">
      <div className="flex items-center justify-center gap-1">
        <span
          className=" cursor-pointer  md:p-[6px]  rounded-full"
          onClick={() => {
            clearselectedChat();
          }}
        >
          <FaArrowLeft className="h-3 md:h-4 w-3 md:w-4 text-emerald-500" />
        </span>
        {selectedChat && (
          <>
            <div
              onClick={() => {
                document
                  .getElementById(
                    `right${selectedChat.isGroupChat ? "Group" : "User"}Sheet`
                  )
                  ?.click();
              }}
              className="relative cursor-pointer  p-[2px] h-7 w-7 md:h-8 md:w-8 ring-1 md:ring-1 ring-violet-500 rounded-full"
            >
              <Image
                height={30}
                width={30}
                className="rounded-full object-fill h-full w-full"
                alt={
                  selectedChat.isGroupChat
                    ? selectedChat?.chatName
                    : (selectedChat?.userInfo?.name as any)
                }
                src={
                  selectedChat.isGroupChat
                    ? selectedChat?.groupInfo?.image?.url
                    : selectedChat?.userInfo?.image
                }
                loading="lazy"
              />

              <span
                className={` absolute bottom-0 -right-1 rounded-full ring-1 ring-gray-900 p-1 md:p-[5px] ${
                  selectedChat?.isOnline ? "animate-pulse bg-green-500" : "bg-rose-500"
                }`}
              ></span>
            </div>
            <div className="ml-2 flex flex-col dark:text-gray-200">
              <h3 className="text-xs md:text-sm font-bold ">
                {selectedChat.isGroupChat
                  ? selectedChat?.chatName
                  : selectedChat.userInfo.name}
              </h3>
              {typingUsers.some(
                (typeuser) =>
                  typeuser.chatId === selectedChat?.chatId &&
                  typeuser.userInfo._id !== currentUser?._id
              ) ? (
                <>
                  {
                    // Filter typing users for the current chat
                    typingUsers
                      .filter((typeuser) => typeuser.chatId === selectedChat?.chatId)
                      .map((typeuser, index, array) => (
                        <React.Fragment key={index}>
                          {index === 0 ? (
                            <span className="text-[10px] animate-pulse">
                              {/* Show the name of the first typing user */}

                              {/* If there are more than one typing users, show the count */}
                              {array.length > 1 ? (
                                <span>{`${typeuser.userInfo?.name} and ${
                                  array.length - 1
                                } more are typing...`}</span>
                              ) : (
                                // If there's only one typing user, show "is typing..."
                                <span>Typing...</span>
                              )}
                            </span>
                          ) : null}
                        </React.Fragment>
                      ))
                  }
                </>
              ) : (
                <span className="text-[10px]">
                  {selectedChat?.isGroupChat ? (
                    selectedChat?.isOnline ? (
                      <span className="text-green-500">Online</span>
                    ) : (
                      <span className="text-rose-500">Members are offline</span>
                    )
                  ) : selectedChat?.isOnline ? (
                    <span className="text-green-500">Online</span>
                  ) : !selectedChat?.isOnline ? (
                    <span className="text-[9px]">
                      <span className="mr-1">Active</span>
                      {selectedChat?.userInfo?.lastActive
                        ? moment(selectedChat?.userInfo?.lastActive).fromNow()
                        : moment(selectedChat?.userInfo?.createdAt).fromNow()}
                    </span>
                  ) : (
                    <span className="text-rose-500">Offline</span>
                  )}
                </span>
              )}
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        {selectedChat && selectedChat.onCallMembers > 0 ? (
          <Button
            size={"lg"}
            className="bg-green-500 hover:bg-green-600 text-gray-800"
            onClick={() => router.push(`/call/${selectedChat?.chatId}`)}
          >
            Join call
          </Button>
        ) : (
          <span className="cursor-pointer flex gap-2">
            <MdCall
              onClick={() => {
                handleSendCall("audio", currentUser, selectedChat, socket, dispatch);
              }}
              className="h-4 w-4 md:h-5 md:w-5 text-emerald-500  cursor-pointer"
            />
            <MdVideoCall
              onClick={() => {
                handleSendCall("video", currentUser, selectedChat, socket, dispatch);
              }}
              className="h-4 w-4 md:h-5 md:w-5 text-emerald-500  cursor-pointer"
            />
          </span>
        )}

        {/* check is group chat or not */}
        {!selectedChat?.isGroupChat ? (
          <RightUserDrawer isUserOnline={isUserOnline} />
        ) : (
          <RightGroupDrawer isUserOnline={isUserOnline} />
        )}
      </div>
      {/* <div>...</div> */}
    </div>
  );
};
export default ChatHeader;
