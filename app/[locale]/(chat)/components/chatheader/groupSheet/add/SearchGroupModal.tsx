import React, { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import {
  allUsersForAddgroupExclueWhoinAlreadyChat,
  getAllUsers,
} from "@/apisActions/authActions";

import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import useGroupStore from "@/store/useGroupStore";
import { useSocketContext } from "@/context/SocketContextProvider";
import { toast } from "react-toastify";
import { addToGroup, createGroup } from "@/apisActions/chatActions";
import { SET_CHATS, SET_SELECTED_CHAT } from "@/context/reducers/actions";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { Button } from "@/components/ui/button";
import SliderUsers from "./SliderUsers";
import { getSenderFull } from "../../../logics/logics";
const InfiniteScroll = dynamic(() => import("react-infinite-scroll-component"));

const GroupCard = dynamic(() => import("./Card"));
export default function SearchGroupModal() {
  const dispatch = useMessageDispatch();
  const { socket } = useSocketContext();
  const { user: currentUser, selectedChat } = useMessageState();
  const [searchTerm, setSearchTerm] = useState("");
  const { selectedAddGroupUsers } = useGroupStore();
  const searchText = useDebounce(searchTerm, 600);
  const { data, isFetching, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: [selectedChat?.chatId, searchText],

    queryFn: allUsersForAddgroupExclueWhoinAlreadyChat as any,

    getNextPageParam: (lastPage: any) => {
      const { prevOffset, total, limit } = lastPage;
      // Calculate the next offset based on the limit
      const nextOffset = prevOffset + limit;

      // Check if there are more items to fetch
      if (nextOffset >= total) {
        return;
      }

      return nextOffset;
    },
    initialPageParam: 0,
  });
  //add new user to  group mutation
  const addGroupMutaion = useMutation({
    mutationFn: (data: any) => addToGroup(data),
    onSuccess: (chat) => {
      toast.success("Added members to group successfully!");

      socket.emit("addUserTogroupNotify", { chatId: chat._id, chat });

      document.getElementById("closeAddGroupDialog")?.click();
    },
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const users = data?.pages.flatMap((page) => page?.users);
  //createGroupHandler
  const addGroupHandler = () => {
    if (selectedAddGroupUsers.length < 1) {
      return;
    }

    const userIds = selectedAddGroupUsers.map((user: any) => user._id);
    const groupData = {
      userIds,
      chatId: selectedChat?.chatId,
    };
    addGroupMutaion.mutateAsync(groupData);
  };
  return (
    <>
      <div>
        <div className="p-2 bg-base-200 text-base-content overflow-y-scroll">
          {/* Group name */}

          {/* Search group users */}
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => handleInputChange(e)}
            placeholder="username or email..."
            className="shadow-lg w-full h-auto bg-transparent  text-[10px] md:text-sm py-3 px-3 rounded-md  outline-none border border-gray-400  transition-all duration-300"
          />
          {/* Selected users slider */}
          <h1>
            {selectedAddGroupUsers.length > 0 && (
              <span className="float-right text-lg mx-2 mt-2">
                {" "}
                Selected: ({selectedAddGroupUsers.length})
              </span>
            )}
          </h1>

          <div className="w-full relative flex items-center justify-center">
            {" "}
            <SliderUsers />
          </div>
          <div className="relative mb-5">
            <Button
              disabled={selectedAddGroupUsers.length === 0}
              className=" bg-blue-600 btn m-1 text-xs w-full rounded-md p-[7px] capitalize "
              onClick={() => addGroupHandler()}
            >
              {addGroupMutaion.isPending ? (
                <span className="animate-pulse">Adding...</span>
              ) : (
                " +Add more to group"
              )}
            </Button>
          </div>
          {/* Infinite scrolling */}
          <div id="GroupSearchTarget" style={{ height: "20vh", overflowY: "scroll" }}>
            <InfiniteScroll
              dataLength={users ? users?.length : 0}
              next={() => {
                fetchNextPage();
              }}
              hasMore={hasNextPage}
              loader={<div>Loading...</div>}
              endMessage={
                <p className="text-green-400">
                  <b>all users here!</b>
                </p>
              }
              style={{ height: "100%" }}
              scrollableTarget="GroupSearchTarget"
            >
              <div className="flex flex-col gap-5 my-4">
                <div className="flex flex-col gap-3">
                  {users && users?.length > 0
                    ? users?.map((user: any) => {
                        return <GroupCard user={user} key={user._id} />;
                      })
                    : !isLoading &&
                      !isFetching && (
                        <h1 className="text-sm md:text-xl m-4 text-center">
                          No User Found!
                        </h1>
                      )}
                </div>

                <h1>{isFetching ? "isFetching" : ""}</h1>
              </div>
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </>
  );
}
