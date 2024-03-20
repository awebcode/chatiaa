// ChatStatus.js

import Link from "next/link";
import React from "react";
import { useUserStore } from "@/store/useUser";
import { Tuser } from "@/store/types";
import { useMessageState } from "@/context/MessageContext";

const ChatStatus = ({ user }: { user?: Tuser }) => {
  const { currentUser } = useUserStore();
  const { selectedChat } = useMessageState();
  return (
    <div className="p-4 bg-gray-200 rounded-lg">
      {currentUser?._id === user?._id ? (
        <p className="text-gray-700 ">
          You blocked <span className="font-bold">{selectedChat?.userInfo?.name}</span>
          <Link href="#" className="text-blue-500 cursor-pointer mx-2">
            unblock and start a conversation!
          </Link>
        </p>
      ) : (
        <p className="text-gray-700 ">
          You can&apos;t send messages!. This user has blocked you.{" "}
          <Link href="#" className="text-blue-500 cursor-pointer mx-2">
            Learn more
          </Link>
        </p>
      )}
    </div>
  );
};

export default ChatStatus;
