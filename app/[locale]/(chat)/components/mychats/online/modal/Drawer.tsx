"use client";
import React, { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllUsers, getOnlineUsers } from "@/functions/authActions";

import dynamic from "next/dynamic";
import { Tuser } from "@/store/types";
import LoaderComponent from "@/components/Loader";
const InfiniteScroll = dynamic(() => import("react-infinite-scroll-component"));

const UserCard = dynamic(() => import("./UserCard"));
const Drawer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchText = useDebounce(searchTerm, 600);
  const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["online-users", searchText], //messages

    queryFn: getOnlineUsers as any,

    getNextPageParam: (lastPage: any) => {
      const { prevOffset, totalOnlineUsers, limit } = lastPage;
      // Calculate the next offset based on the limit
      const nextOffset = prevOffset + limit;

      // Check if there are more items to fetch
      if (nextOffset >= totalOnlineUsers) {
        return;
      }

      return nextOffset;
    },
    initialPageParam: 0,
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const users = data?.pages.flatMap((page) => page?.onlineUsers);
  console.log({ users });
  return (
    <>
      <div>
        <div className="menu p-4   bg-base-200 text-base-content overflow-y-scroll">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleInputChange(e)}
            placeholder="Enter name or email here"
            className="shadow-lg w-full bg-transparent border border-gray-500 text  text-sm py-3 px-3 rounded-md  outline-none border-1  transition-all duration-300"
          />

          <div id="customTarget" style={{ height: "90vh", overflowY: "scroll" }}>
            <InfiniteScroll
              dataLength={users ? users?.length : 0}
              next={() => {
                fetchNextPage();
              }}
              hasMore={hasNextPage}
              loader={<LoaderComponent text="Fetching..." />}
              endMessage={
                users &&
                users?.length > 0 && (
                  <p className="text-green-400">
                    <b>all online users here!</b>
                  </p>
                )
              }
              style={{ height: "100%" }}
              scrollableTarget="customTarget"
            >
              <div className="flex flex-col gap-5 my-4">
                {/* {users?.map((user: any) => {
          return <UserCard user={user} key={user._id} />;
        })} */}
                {users && users?.length > 0 ? (
                  users?.map((user: Tuser) => {
                    return <UserCard user={user} key={user._id + Date.now()} />;
                  })
                ) : (
                  <h1 className="text-sm md:text-xl m-4 text-center">
                    No Online User Found!
                  </h1>
                )}

                <h1>{isFetching ? <LoaderComponent text="Fetching..." /> : ""}</h1>
              </div>
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </>
  );
};

export default Drawer;
