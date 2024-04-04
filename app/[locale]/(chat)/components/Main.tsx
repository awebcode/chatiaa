import dynamic from "next/dynamic";
import React, { memo, useEffect } from "react";
const ChatHeader = dynamic(() => import("./chatheader/ChatHeader"));
const Input = dynamic(() => import("./Input/Input"));
const Messages = dynamic(() => import("./messages/Messages"));
import { useSocketContext } from "@/context/SocketContextProvider";
import {  useMessageState } from "@/context/MessageContext";
const Main = () => {
  const { user: currentUser, messages, selectedChat } = useMessageState();
 
 
  const { socket } = useSocketContext();
  useEffect(() => {
    socket.emit("join", { chatId: selectedChat?.chatId });
  }, [selectedChat?.chatId, socket]); //selectedChat

  return (
    <div className="relative top-0 w-full h-full ">
      {/* chat header */}
      <div className="z-50  overflow-hidden">
        {" "}
        {selectedChat&&<ChatHeader />} 
      </div>
      {/* Message */}
      <div className="absolute py-4 bottom-10 w-full z-10">
        {selectedChat && <Messages />}
      </div>
      {/* Inpute */}
      <div className="w-full absolute bottom-0 z-20">
        {" "}
        {selectedChat && <Input />}
      </div>
    </div>
  );
};

export default memo(Main);
