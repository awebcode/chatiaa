import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Tuser } from "@/store/types";
import { useSocketContext } from "@/context/SocketContextProvider";
import { useMessageState } from "@/context/MessageContext";
import { useTypingStore } from "@/store/useTyping";

const TypingIndicator = ({ onFriendListCard }: { onFriendListCard: boolean }) => {
  const { socket } = useSocketContext();
  const { selectedChat } = useMessageState();
  const { typingUsers } = useTypingStore();

  const [additionalTypingUsers, setAdditionalTypingUsers] = useState<number>(0);

  useEffect(() => {
    if (typingUsers.length > 3) {
      setAdditionalTypingUsers(typingUsers.length - 3);
    } else {
      setAdditionalTypingUsers(0);
    }
  }, [typingUsers]);

  return (
    <div className="flex items-center">
      {typingUsers.slice(0, 3).map((typingUser, index) => (
        <div
          key={index}
          className={`${typingUser.chatId === selectedChat?.chatId ? "flex" : "hidden"}`}
        >
          {typingUser.userInfo && (
            <div
              className={`ml-1 relative h-7 w-7   ring-3 ring-blue-700 rounded-full ${
                onFriendListCard ? "hidden" : "inline"
              }`}
            >
              {" "}
              <Image
                height={32}
                width={32}
                className="rounded-full object-fill h-full w-full"
                alt={typingUser.userInfo.name}
                src={typingUser.userInfo.image}
                loading="lazy"
              />
              <span className="absolute bottom-0 right-0 p-[4px] bg-green-500 rounded-full"></span>
            </div>
          )}
        </div>
      ))}
      {additionalTypingUsers > 0 && (
        <div className="ml-1">
          <span className="text-gray-500">{`${additionalTypingUsers} more are typing`}</span>
        </div>
      )}
      {typingUsers.some((user) => user.chatId === selectedChat?.chatId) && (
        <div className="typingIndicatorContainer inline">
          <div className="typingIndicatorBubble">
            <div className="typingIndicatorBubbleDot"></div>
            <div className="typingIndicatorBubbleDot"></div>
            <div className="typingIndicatorBubbleDot"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingIndicator;
