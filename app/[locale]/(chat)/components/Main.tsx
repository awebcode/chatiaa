"use client";
import dynamic from "next/dynamic";
import React, { ReactNode, memo, useEffect } from "react";
const ChatHeader = dynamic(() => import("./chatheader/ChatHeader") as any, {
  ssr: false,
  // loading: () => <LoaderComponent
  // text="Fetching..."/>,
});
// const Input = dynamic(() => import("./Input/Input"),{ssr:false});
import { useSocketContext } from "@/context/SocketContextProvider";
import { useMessageState } from "@/context/MessageContext";
// import ChatHeader from "./chatheader/ChatHeader";
// import Input from "./Input/Input";
const Input = dynamic(() => import("./Input/Input"), {
  // loading: () => <LoaderComponent
  // text="Fetching..."/>,
});
import LoaderComponent from "@/components/Loader";
const MainClientWrapper = ({ children }: { children: ReactNode }) => {
  const { selectedChat } = useMessageState();

  const { socket } = useSocketContext();
  useEffect(() => {
    socket.emit("join", { chatId: selectedChat?.chatId });
  }, [selectedChat?.chatId, socket]); //selectedChat

  return (
    <div className="relative border-l border-l-gray-200 dark:border-l-gray-700 top-0 w-full h-screen ">
      {/* chat header */}
      <div className="absolute top-0 h-auto w-full z-20  !overflow-hidden p-2">
        {" "}
        <ChatHeader />
      </div>
      {/* Message */}
      <div className="w-full   fixed  md:absolute  py-2  top-24 md:top-28   z-20">
        {children}
      </div>
      {/* Inpute */}
      <div className="w-full fixed h-auto md:absolute bottom-0 z-10">
        {" "}
        <Input />
      </div>
    </div>
  );
};

export default MainClientWrapper;
