"use client";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import Image from "next/image";
import React, {  useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { useClickAway } from "@uidotdev/usehooks";
import { MdCall, MdVideoCall } from "react-icons/md";
import dynamic from "next/dynamic";
import { useRouter } from "@/navigation";
import moment from "moment";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { CLEAR_MESSAGES, SET_MESSAGES, SET_SELECTED_CHAT } from "@/context/reducers/actions";
const RightUserDrawer = dynamic(() => import("./RightUserDrawer"));
const RightGroupDrawer = dynamic(() => import("./RightGroupDrawer"));

const ChatHeader = () => {
  const router = useRouter();
    const { selectedChat } = useMessageState();
    const dispatch = useMessageDispatch();
  const { onlineUsers } = useOnlineUsersStore();
  const [open, setOpen] = useState(false);
  const [openVideoCall, setOpenVideoCall] = useState(false);
  const isUserOnline = onlineUsers.some((u: any) => u.id === selectedChat?.userInfo?._id);
  const userModalRef: any = useClickAway((e) => {
    setOpen(false);
  });

  const videoCallModalRef: any = useClickAway(() => {
    setOpenVideoCall(false);
  });

    const clearselectedChat = () => {
      dispatch({ type: SET_SELECTED_CHAT, payload: null })
      dispatch({ type: CLEAR_MESSAGES });
    }
  return (
    <div className="p-4 bg-gray-200  dark:bg-gray-800  flexBetween rounded z-50">
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
            <div className="relative  p-[2px] h-8 w-8 md:h-10 md:w-10 ring md:ring-2 ring-violet-500 rounded-full">
            
                <Image
                  height={35}
                  width={35}
                  className="rounded-full object-fill h-full w-full"
                  alt={selectedChat?.userInfo?.name as any}
                  src={selectedChat?.userInfo.image as any}
                  loading="lazy"
                />
              

              <span
                className={`absolute bottom-0 -right-1 rounded-full  p-[6px] ${
                  isUserOnline ? "bg-green-500" : "bg-rose-500"
                }`}
              ></span>
            </div>
            <div className="ml-1">
              <h3 className="text-xs md:text-sm font-bold ">
                {selectedChat.userInfo.name}
              </h3>
              <span className="text-[10px] ">
                {isUserOnline ? (
                  <span className="text-green-500">Online</span>
                ) : (!isUserOnline &&
                    !selectedChat.isGroupChat &&
                    selectedChat?.userInfo?.lastActive) ||
                  selectedChat?.userInfo?.createdAt ? (
                  <span className="text-[9px]">
                    <span className="mr-1">active</span>
                    {moment(
                      (selectedChat?.userInfo?.lastActive as any) ||
                        selectedChat?.userInfo?.createdAt
                    ).fromNow()}
                  </span>
                ) : (
                  <span className="text-rose-500">Offline</span>
                )}
              </span>
            </div>
          </>
        )}
      </div>
      {selectedChat && (
        <div className="flex items-center gap-4">
          <span ref={videoCallModalRef} className="cursor-pointer flex gap-2">
            <MdCall
              onClick={() => setOpenVideoCall((prev) => !prev)}
              className="h-4 w-4 md:h-6 md:w-6  cursor-pointer"
            />
            <MdVideoCall
              onClick={() => setOpenVideoCall((prev) => !prev)}
              className="h-4 w-4 md:h-6 md:w-6  cursor-pointer"
            />
            {/* <VideoCallModal
              openVideoCall={openVideoCall}
              setOpenVideoCall={setOpenVideoCall}
              isUserOnline={isUserOnline}
            /> */}
          </span>
          {/* check is group chat or not */}
          {!selectedChat?.isGroupChat ? <RightUserDrawer /> : <RightGroupDrawer />}
        </div>
      )}
      {/* <div>...</div> */}
    </div>
  );
};
export default ChatHeader;
