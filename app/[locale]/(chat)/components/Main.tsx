"use client";
import dynamic from "next/dynamic";
import React, { ReactNode, memo, useEffect, useLayoutEffect } from "react";
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
import { useRouter } from "@/navigation";
import { useSearchParams } from "next/navigation";
import Cookie from "js-cookie";
import { useQueryClient } from "@tanstack/react-query";
const MainClientWrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  //  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  const { selectedChat } = useMessageState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socket } = useSocketContext();
  useEffect(() => {
    socket.emit("join", { chatId: selectedChat?.chatId });
    // document.addEventListener("contextmenu", function (e) {
    //   e.preventDefault();
    // });

    // Add more conditions as needed for other key combinations
  }, [selectedChat?.chatId, socket]); //selectedChat

  const roomId = searchParams.get("chatId");
  // const isEmpty = searchParams.get("isEmpty");
  // useEffect(() => {
  //   const localStorageChat = localStorage.getItem("selectedChat");
  //   if (!roomId || !selectedChat || !localStorageChat || isEmpty) {
  //     router.push("?isEmpty=true");
  //   }
  // }, [roomId, router, selectedChat, searchParams]);
  if (!selectedChat) return <LoaderComponent />; //<LoaderComponent />;
  return (
    <div className="border-l border-l-gray-200 dark:border-l-gray-700  w-full  ">
      {/* chat header */}
      <div className="fixed md:absolute top-0   w-full z-40  !overflow-hidden p-2">
        {" "}
        <ChatHeader />
      </div>
      {/* Message */}
      <div className="w-full fixed  md:absolute  bottom-2  py-2      z-20">
        {children}
      </div>
      {/* Inpute */}
      <div className="w-full  fixed   md:absolute bottom-0 z-50 ">
        {" "}
        <Input />
      </div>
    </div>
  );
};

export default MainClientWrapper;
