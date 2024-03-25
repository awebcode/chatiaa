import { Input } from "@/components/ui/input";
import { useMessageState } from "@/context/MessageContext";
import { getFilesInChat, getUsersInAChat } from "@/functions/chatActions";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import Card from "./Card";
const InfiniteScroll = dynamic(() => import("react-infinite-scroll-component"));
const Members = () => {
  const { selectedChat } = useMessageState();
  const [searchTerm, setsearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 600);
  const { data, isFetching,isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: [selectedChat?.chatId, debouncedSearch],

    queryFn: getUsersInAChat as any,

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
  const users = data?.pages.flatMap((page) => page?.users);
  return (
    <div className="w-full  overflow-y-auto">
      <h1>Members</h1>
      {/* Search group users */}
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => setsearchTerm(e.target.value)}
        placeholder="username or email..."
        className="shadow-lg w-full h-auto bg-transparent  text-[10px] md:text-sm py-3 px-3 rounded-md  outline-none border border-gray-400  transition-all duration-300"
      />
      {/* Infinite scrolling */}
      <div
        id="GroupUsersScrollableTarget"
        style={{ height: "30vh", overflowY: "auto" }}
      >
        <InfiniteScroll
          dataLength={users ? users?.length : 0}
          next={() => {
            fetchNextPage();
          }}
          hasMore={hasNextPage}
          loader={<div>Loading...</div>}
          endMessage={
            users &&
            users?.length > 0 &&
             (
              <p className="text-green-400">
                <b>all users here!</b>
              </p>
            )
          }
          style={{ height: "100%" }}
          scrollableTarget="GroupUsersScrollableTarget"
        >
          <div className="flex flex-col gap-5 my-4">
            <div className="flex flex-col gap-3">
              {users && users?.length > 0
                ? users?.map((user: any) => {
                    return <Card user={user} key={user?._id} />;
                  })
                : !isLoading &&
                  !isFetching && (
                    <h1 className="text-sm md:text-xl m-4 text-center">No User Found!</h1>
                  )}
            </div>

            <h1>{isFetching ? "isFetching" : ""}</h1>
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default Members;
