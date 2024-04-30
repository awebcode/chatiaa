// ChatStatus.js

import Link from "next/link";
import React from "react";
import { Tuser } from "@/store/types";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import DeleteButton from "@/components/DeleteButton";
import { useBlockMutation } from "../mutations/Chatmutations";
import { BLOCK_CHAT } from "@/context/reducers/actions";

const ChatStatus = ({ chatBlockedBy }: { chatBlockedBy?: Tuser[] }) => {
  const { selectedChat, user: currentUser } = useMessageState();
  const dispatch = useMessageDispatch();
  const blockMutation = useBlockMutation();
  const blockData = {
    chatId: selectedChat?.chatId,
    status: chatBlockedBy?.some((user) => user?._id === currentUser?._id)
      ? "unblock"
      : "block",
  };
  const handleUnblock = () => {
    dispatch({
      type: BLOCK_CHAT,
      payload: { user: currentUser, chatId: selectedChat?.chatId }, //data.chat.chatBlockedBy
    });
    blockMutation.mutateAsync(blockData);
  };
  return (
    <div className="m-2 p-4 bg-gray-200 dark:bg-gray-800 rounded-lg">
      {chatBlockedBy?.some((user) => user._id === currentUser?._id) ? (
        <p className="text-[10px] md:text-xs flex justify-center items-center text-gray-800 dark:text-gray-300 ">
          You blocked{" "}
          <span className="font-medium mx-1">{selectedChat?.userInfo?.name}</span>
          <Link href="#" className="inline  text-blue-500 cursor-pointer mx-2">
            <DeleteButton
              btnClassName="text-[10px] md:text-sm p-1 md:text-sm bg-blue-600 shadow-none m-0 hover:bg-transparent text-blue-500 inline w-auto bg-transparent border-none ring-none outline-none"
              navigatePath="#"
              buttonText={`Unblock`}
              title=""
              desc={`unblock ${selectedChat?.userInfo?.name} and start new conversation`}
              onClick={handleUnblock}
            ></DeleteButton>
            <span>and start a conversation!</span>
          </Link>
        </p>
      ) : chatBlockedBy &&
        chatBlockedBy?.length > 0 &&
        chatBlockedBy?.some((user) => user._id !== currentUser?._id) ? (
        <p className="text-[10px] md:text-xs text-gray-800 dark:text-gray-300 ">
          You can&apos;t send messages!. {chatBlockedBy[0]?.name} blocked you.{" "}
          <Link href="#" className="text-blue-500 cursor-pointer mx-2">
            Learn more
          </Link>
        </p>
      ) : null}
    </div>
  );
};

export default ChatStatus;
