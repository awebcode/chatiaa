import React from "react";
import { SearchDrawer } from "./searchfriends/SearchDrawer";
import dynamic from "next/dynamic";
// const CreateGroupModal = dynamic(() => import("./group/GroupModal"));
// const MyFriends = dynamic(() => import("./mychats/MyChats"),{loading:()=><h1>Loading..</h1>});
import CreateGroupModal from "./group/GroupModal";
import MyFriends from "./mychats/MyChats";
const LeftSide = () => {
  return (
    <div className="border flex flex-col">
      <div className="m-4">
        <SearchDrawer />
        <CreateGroupModal />
      </div>
      <MyFriends />
    </div>
  );
};

export default LeftSide;
