import React from "react";
import Image from "next/image";
import { Tuser } from "@/store/types";

const TypingIndicator = ({ user, isTyping, onFriendListCard }: { user: Tuser|null; isTyping:boolean,onFriendListCard:boolean}) => {
  return (
    <div className={`${isTyping ? " flex  items-center" : "hidden"}`}>
      {user && (
        <div
          className={`ml-1 relative h-7 w-7   ring-3 ring-blue-700 rounded-full ${onFriendListCard?"hidden":"inline"}`}
        >
          {" "}
          <Image
            height={32}
            width={32}
            className="rounded-full object-fill h-full w-full"
            alt={user.name}
            src={user.image}
            loading="lazy"
          />
          <span className="absolute bottom-0 right-0 p-[4px] bg-green-500 rounded-full"></span>
        </div>
      )}
      <div className="typingIndicatorContainer inline">
        <div className="typingIndicatorBubble">
          <div className="typingIndicatorBubbleDot"></div>
          <div className="typingIndicatorBubbleDot"></div>
          <div className="typingIndicatorBubbleDot"></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
