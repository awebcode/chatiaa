"use client"
import dynamic from "next/dynamic";
import React, { ReactNode, memo, useEffect } from "react";
 const ChatHeader = dynamic(() => import("./chatheader/ChatHeader"), { ssr: false });
// const Input = dynamic(() => import("./Input/Input"),{ssr:false});
import { useSocketContext } from "@/context/SocketContextProvider";
import { useMessageState } from "@/context/MessageContext";
// import ChatHeader from "./chatheader/ChatHeader";
import Input from "./Input/Input";
const MainClientWrapper = ({ children }: { children: ReactNode }) => {
  const { selectedChat } = useMessageState();

  const { socket } = useSocketContext();
  useEffect(() => {
    socket.emit("join", { chatId: selectedChat?.chatId });
  }, [selectedChat?.chatId, socket]); //selectedChat

  return (
    <div className="relative top-0 w-full h-full ">
      {/* chat header */}
      <div className="z-50  overflow-hidden"> <ChatHeader /></div>
      {/* Message */}
      <div className="absolute py-4 bottom-10 w-full z-10">
       {children}
      </div>
      {/* Inpute */}
      <div className="w-full absolute bottom-0 z-20">  <Input /></div>
    </div>
  );
};

export default MainClientWrapper;
