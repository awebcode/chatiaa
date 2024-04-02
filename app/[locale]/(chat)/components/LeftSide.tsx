import React from "react";
import { SearchDrawer } from "./searchfriends/SearchDrawer";
import dynamic from "next/dynamic";
// const CreateGroupModal = dynamic(() => import("./group/GroupModal"));
// const MyFriends = dynamic(() => import("./mychats/MyChats"),{loading:()=><h1>Loading..</h1>});
import CreateGroupModal from "./group/GroupModal";
import MyFriends from "./mychats/MyChats";
import OnlineFriends from "./mychats/online/OnlieFriends";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { useMessageState } from "@/context/MessageContext";
const LeftSide = () => {
  const { onlineUsers } = useOnlineUsersStore();
  const {user:currentUser}=useMessageState()
  return (
    <div className="border flex flex-col">
      <div className="m-4">
        <SearchDrawer />
        <CreateGroupModal />
      </div>

      {onlineUsers.filter((curr) => curr.userInfo?._id !== currentUser?._id).length >
        0 && <OnlineFriends />}

      <MyFriends />
    </div>
  );
};

export default LeftSide;
