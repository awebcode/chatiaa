import React from "react";
import { SearchDrawer } from "./searchfriends/SearchDrawer";
import MyFriends from "./mychats/MyChats";

const LeftSide = () => {
  return (
    <div className="border flex flex-col">
      <div className="m-4">
        <SearchDrawer />
      </div>
      <MyFriends />
    </div>
  );
};

export default LeftSide;
