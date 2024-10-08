"use client";
import React, { ReactNode, useEffect } from "react";
const SearchDrawer = dynamic(() => import("./searchfriends/SearchDrawer"), {
  // loading: () => <LoaderComponent text="Fetching..."/>,
});

const CreateGroupModal = dynamic(() => import("./group/GroupModal"), {
  // loading: () => <LoaderComponent text="Fetching..."/>,
});

const OnlineFriends = dynamic(() => import("./mychats/online/OnlieFriends"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});

import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { useMessageState } from "@/context/MessageContext";
import dynamic from "next/dynamic";
import { useRouter } from "@/navigation";
const LeftSideClientWrapper = ({
  children,
  chatId,
}: {
  children: ReactNode;
  chatId?: string;
}) => {
  const router = useRouter();
  const { onlineUsers } = useOnlineUsersStore();
  const { user: currentUser } = useMessageState();

  useEffect(() => {
    if (localStorage.getItem("selectedChat") && !chatId) {
      localStorage.removeItem("selectedChat");
      router.replace("/chat");
    }
  }, [chatId, router]);

  return (
    <div className=" flex flex-col md:border-r border-emerald-500/30">
      <div className="m-4">
        <SearchDrawer />
        <CreateGroupModal />
      </div>

      {onlineUsers.filter((curr) => curr.userInfo?._id !== currentUser?._id).length >
        0 && <OnlineFriends />}
      {/* my friends server rendering here */}
      <div className="overflow-y-auto"> {children}</div>
    </div>
  );
};

export default LeftSideClientWrapper;
