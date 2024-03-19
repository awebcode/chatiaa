"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { useInfiniteQuery } from "@tanstack/react-query";

import dynamic from "next/dynamic";
const InfiniteScroll = dynamic(() => import("react-infinite-scroll-component"));
const FriendsCard = dynamic(() => import("./FriendCard"));
import { getChats } from "@/functions/chatActions";

import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import ChatLoading from "../ChatLoading";
import { ChatSkeleton } from "./ChatSkeleton";
import SkeletonContainer from "./SkeletonContainer";

const MyFriends = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchText = useDebounce(searchTerm, 700);
  const { user: currentUser, selectedChat } = useMessageState();
  const dispatch = useMessageDispatch();
  const { data, isFetching, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["users", searchText, currentUser?._id],

    queryFn: getChats as any,

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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const chats = data?.pages.flatMap((page) => page.chats);

  return (
    <>
      <div>
        <div className="menu p-4   h-full  bg-base-200 text-base-content overflow-y-scroll">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleInputChange(e)}
            placeholder="Search Friends"
            className="bg-transparent w-full    text-sm py-3 px-3 rounded-md  outline-none border border-gray-200 dark:border-gray-500 transition-all duration-300"
          />

          <div
            id="customTargetFriend"
            style={{ height: "80vh", overflowY: "scroll" }}
            className="mt-2 z-50 "
          >
            <InfiniteScroll
              dataLength={chats ? chats?.length : 0}
              next={() => {
                fetchNextPage();
              }}
              hasMore={hasNextPage}
              loader={<div>Loading...</div>}
              endMessage={
                chats &&
                chats.length > 10 &&
                !isLoading && (
                  <p className="text-green-400">
                    <b>Yay! You have seen it all</b>
                  </p>
                )
              }
              style={{ height: "100%" }}
              scrollableTarget="customTargetFriend"
            >
              <div className="flex flex-col gap-5 z-50 min-h-[80vh] ">
                {isLoading ? (
                  // <ChatLoading count={9} height={70} inline={false} radius={5} />
                  <>
                   <SkeletonContainer/>
                  </>
                ) : chats && chats.length > 0 ? (
                  chats.map((chat: any) => (
                    <FriendsCard
                      chat={chat}
                      unseenArray={data?.pages[0].unseenCountArray}
                      key={chat._id}
                    />
                  ))
                ) : (
                  <h1 className="text-sm md:text-xl m-4 text-center">No Friend Found!</h1>
                )}
              </div>
              {/* {isFetching && <h1 className="text-center p-2 text-2xl">Fetching...</h1>} */}
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyFriends;
