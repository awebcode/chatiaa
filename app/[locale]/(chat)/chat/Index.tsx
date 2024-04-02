"use client";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";

import dynamic from "next/dynamic";
import React, { useEffect } from "react";
// const LeftSide = dynamic(() => import("../components/LeftSide"),{loading:()=><h1>Loader</h1>});
// const Main = dynamic(() => import("../components/Main"));
// const EmptyChat = dynamic(() => import("../components/Empty"));
import LeftSide from "../components/LeftSide";
import Main from "../components/Main";
import EmptyChat from "../components/Empty";
const Index = () => {
  const { selectedChat } = useMessageState();
  
  return (
    <div className="">
      <div className="  flexBetween gap-2 overflow-hidden">
        {/* Left side */}
        <div
          className={`h-[88vh] basis-[100%] ${
            selectedChat ? "hidden" : "block"
          } md:block w-full md:basis-2/4 border `}
        >
          <LeftSide />
        </div>
        {/* Rightside */}
        <div
          className={`h-[88vh] border w-full ${
            selectedChat ? "block basis-[100%] w-full" : "hidden"
          }  md:block`}
        >
          {selectedChat ? <Main /> : <EmptyChat />}
        </div>
      </div>
    </div>
  );
};

export default Index;
