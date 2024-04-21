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
import Input from "./Input/Input";
// const Input = dynamic(() => import("./Input/Input"), {
//   // loading: () => <LoaderComponent
//   // text="Fetching..."/>,
// });
import LoaderComponent from "@/components/Loader";
import EmptyChat from "./Empty";
import { useRouter } from "@/navigation";
import { useSearchParams } from "next/navigation";
const MainClientWrapper = ({ children }: { children: ReactNode }) => {
  const { selectedChat } = useMessageState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socket } = useSocketContext();
  useEffect(() => {
    socket.emit("join", { chatId: selectedChat?.chatId });
  }, [selectedChat?.chatId, socket]); //selectedChat
  //it only when use router.relace('/chat?chatId') on friends card
  const roomId = searchParams.get("chatId");
  useEffect(() => {
    const chatData = localStorage.getItem("selectedChat");
    if (!roomId || !chatData) {
      router.replace("/chat");
    }
  }, [roomId, router]);
   useEffect(() => {
    if (!selectedChat||!roomId) return router.replace("/chat");
   }, [roomId, router,selectedChat]);
  //<EmptyChat />;
  // if (!selectedChat) return <EmptyChat />;
  return (
    <div className="border-l border-l-gray-200 dark:border-l-gray-700  w-full  ">
      {/* chat header */}
      <div className="fixed md:absolute top-0  w-full z-50  !overflow-hidden p-2">
        {" "}
        <ChatHeader />
      </div>
      {/* Message */}
      <div className="w-full fixed  md:absolute  py-2      z-20">
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
