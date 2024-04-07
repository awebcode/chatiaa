"use client";
import React, { ReactNode } from "react";
const SearchDrawer = dynamic(() => import("./searchfriends/SearchDrawer"), {
  loading: () => <LoaderComponent/>,
});

const CreateGroupModal = dynamic(() => import("./group/GroupModal"), {
  loading: () => <LoaderComponent/>,
});

const OnlineFriends = dynamic(() => import("./mychats/online/OnlieFriends"), {
  loading: () => <LoaderComponent />,
});

import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { useMessageState } from "@/context/MessageContext";
import dynamic from "next/dynamic";
import LoaderComponent from "@/components/Loader";
const LeftSideClientWrapper = ({ children }: { children: ReactNode }) => {
  const { onlineUsers } = useOnlineUsersStore();
  const { user: currentUser } = useMessageState();
  return (
    <div className="border flex flex-col">
      <div className="m-4">
        <SearchDrawer />
        <CreateGroupModal />
      </div>

      {onlineUsers.filter((curr) => curr.userInfo?._id !== currentUser?._id).length >
        0 && <OnlineFriends />}
      {/* my friends server rendering here */}
      {children}
    </div>
  );
};

export default LeftSideClientWrapper;
