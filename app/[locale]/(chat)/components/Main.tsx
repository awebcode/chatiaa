import dynamic from "next/dynamic";
import React, { useEffect } from "react";
const ChatHeader = dynamic(() => import("./chatheader/ChatHeader"));
const Input = dynamic(() => import("./Input/Input"));
const Messages = dynamic(() => import("./messages/Messages"));
import { useSocketContext } from "@/context/SocketContextProvider";
import { useMessageState } from "@/context/MessageContext";
const Main = () => {
  const { socket } = useSocketContext();
  const { user: currentUser, messages, selectedChat } = useMessageState();
  useEffect(() => {
    socket.emit("join", { chatId: selectedChat?.chatId });
  }, [selectedChat, socket]);

  return (
    <div className="relative top-0 w-full h-full ">
      {/* chat header */}
      <div className="z-50  overflow-hidden">
        {" "}
        <ChatHeader />
      </div>
      {/* Message */}
      <div className="absolute py-4 bottom-20 w-full z-10">
        <Messages />
      </div>
      {/* Inpute */}
      <div className="w-full absolute bottom-0 z-50">
        <Input />
      </div>
    </div>
  );
};

export default Main;
