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
const RightUserDrawer = dynamic(() => import("./userSheet/RightUserDrawer"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});
const RightGroupDrawer = dynamic(() => import("./groupSheet/RightGroupDrawer"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});

const ChatHeader = () => {
  const { socket } = useSocketContext();
  const router = useRouter();
  const { selectedChat, user: currentUser } = useMessageState();
  const dispatch = useMessageDispatch();
  const { typingUsers } = useTypingStore();
  const isUserOnline = selectedChat?.isOnline as boolean;

  const clearselectedChat = async () => {
    // window.history.pushState(null, "", "/chat");
    router.push("/chat");

    dispatch({ type: SET_SELECTED_CHAT, payload: null });
    dispatch({ type: CLEAR_MESSAGES });
    localStorage.removeItem("selectedChat");
  };
  // useEffect(() => {
  //   if (!selectedChat) return  window.history.pushState(null, "", "/chat");
  // }, [selectedChat, router, dispatch]);
  //  if (!selectedChat) return router.replace("/chat");
  return (
    <div className="p-4 bg-gray-200  dark:bg-gray-800  flexBetween rounded z-50 transition-all duration-300">
      <div className="flex items-center gap-2">
        <span
          className=" cursor-pointer  md:p-[6px]  rounded-full"
          onClick={() => {
            clearselectedChat();
          }}
        >
          <FaArrowLeft className="h-3 md:h-4 w-3 md:w-4" />
        </span>
        {selectedChat && (
          <>
            <div className="relative  p-[2px] h-8 w-8 md:h-10 md:w-10 ring-1 md:ring-2 ring-violet-500 rounded-full">
              <Image
                height={35}
                width={35}
                className="rounded-full object-fill h-full w-full"
                alt={
                  selectedChat.isGroupChat
                    ? selectedChat?.chatName
                    : (selectedChat?.userInfo?.name as any)
                }
                src={
                  selectedChat.isGroupChat
                    ? selectedChat?.groupInfo?.image?.url
                    : (selectedChat?.userInfo?.image as any)
                }
                loading="lazy"
              />

              <span
                className={` absolute bottom-0 -right-1 rounded-full ring-1 ring-gray-900 p-[6px] ${
                  selectedChat?.isOnline ? "animate-pulse bg-green-500" : "bg-rose-500"
                }`}
              ></span>
            </div>
            <div className="ml-1">
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
                              {typeuser.userInfo?.name}
                              {/* If there are more than one typing users, show the count */}
                              {array.length > 1 ? (
                                <span>{` and ${
                                  array.length - 1
                                } more are typing...`}</span>
                              ) : (
                                // If there's only one typing user, show "is typing..."
                                <span> is typing...</span>
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
                      <span className="text-rose-500">Friends are offline</span>
                    )
                  ) : selectedChat?.isOnline ? (
                    <span className="text-green-500">Online</span>
                  ) : (!selectedChat?.isOnline && selectedChat?.userInfo?.lastActive) ||
                    selectedChat?.userInfo?.createdAt ? (
                    <span className="text-[9px]">
                      <span className="mr-1">Active</span>
                      {moment(
                        (selectedChat?.userInfo?.lastActive as any) ||
                          selectedChat?.userInfo?.createdAt
                      ).fromNow()}
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
              className="h-4 w-4 md:h-6 md:w-6  cursor-pointer"
            />
            <MdVideoCall
              onClick={() => {
                handleSendCall("video", currentUser, selectedChat, socket, dispatch);
              }}
              className="h-4 w-4 md:h-6 md:w-6  cursor-pointer"
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
