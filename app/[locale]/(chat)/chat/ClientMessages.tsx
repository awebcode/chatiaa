"use client"
import React, { Suspense } from "react";


import dynamic from "next/dynamic";
import LoaderComponent from "@/components/Loader";
import EmptyChat from "../components/Empty";
import MyChats from "../components/mychats/MyChats";
import { useMessageState } from "@/context/MessageContext";
import Messages from "../components/messages/Messages";
import MainClientWrapper from "../components/Main";
// const Messages = dynamic(() => import("../components/messages/Messages"), {
//   ssr: false,
//   loading: () => <LoaderComponent text="Fetching messages..." />,
// });
const LeftSideClientWrapper = dynamic(() => import("../components/LeftSide"), {
  // loading: () => <LoaderComponent text="Fetching Chats..." />,
});

// const PrefetchMyChats = dynamic(() => import("../components/mychats/PrefetchChats"), {
//   ssr: false,
//   loading: () => <LoaderComponent text="Fetching Chats..." />,
// });

// const MainClientWrapper = dynamic(() => import("../components/Main"), {
//   loading: () => <LoaderComponent text="Fetching Messages..." />,
// });

const ClientMessages = () => {
  const {selectedChat}=useMessageState()
  return (
    <>
      <div className="flexBetween gap-1 md:gap-2 overflow-hidden">
        {/* Left side */}
        <div
          className={`h-[93vh] md:h-[92vh] basis-[100%]  w-full md:basis-3/6 border  ${
            selectedChat?.chatId ? "hidden md:block" : "block"
          }`}
        >
          <LeftSideClientWrapper chatId={selectedChat?.chatId as string}>
            {/* <PrefetchMyChats /> */}
            <MyChats />
          </LeftSideClientWrapper>
        </div>
        {/* Rightside */}
        {!selectedChat?.chatId ? (
          <div className="hidden md:block w-full">
            {" "}
            <EmptyChat />
          </div>
        ) : (
          <div
            className={`relative h-screen  ${
              selectedChat?.chatId ? "block" : "hidden"
            } md:block  md:h-[92vh] border w-full `}
          >
            {selectedChat?.chatId ? (
              <MainClientWrapper>
                {/* <PrefetchMessages chatId={selectedChat?.chatId as string} /> */}
                {/* Client side rendering more than faster */}
                <Messages chatId={selectedChat?.chatId as string} />
              </MainClientWrapper>
            ) : (
              // <Messages chatId={selectedChat?.chatId as string} />
              <EmptyChat />
            )}
            {/* <EmptyChat /> */}
          </div>
        )}

        {/* <EmptyChat /> */}
      </div>
    </>
  );
};

export default ClientMessages;
