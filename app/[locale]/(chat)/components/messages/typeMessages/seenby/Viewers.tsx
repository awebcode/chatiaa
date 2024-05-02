import React, { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/apisActions/authActions";

import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import LoaderComponent from "@/components/Loader";
import { IMessage } from "@/context/reducers/interfaces";
import { getSeenByInfoForSingleMessage } from "@/apisActions/messageActions";
import { Tuser } from "@/store/types";
const InfiniteScroll = dynamic(() => import("react-infinite-scroll-component"));
const UserCard = dynamic(() => import("./UserCard"));
export default function ViewersDialog({ message }: { message: IMessage }) {
  const [searchTerm, setSearchTerm] = useState("");
  const searchText = useDebounce(searchTerm, 600);
  const { data, isFetching, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["messages-seen-users", searchText, message?.chat?._id, message?._id],

    queryFn: getSeenByInfoForSingleMessage as any,

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

  const users = data?.pages.flatMap((page) => page?.users);
  //createGroupHandler
  return (
    <>
      <div>
        {" "}
        <div>
          {/* Search group users */}
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => handleInputChange(e)}
            placeholder="username or email..."
            className="shadow-lg w-full h-auto bg-transparent  text-[10px] md:text-sm py-3 px-3 rounded-md  outline-none border border-gray-400  transition-all duration-300"
          />
          <h1 className="text-right mx-2 font-medium text-gray-500">
            Total ({data?.pages[0]?.total})
          </h1>
          {/* Infinite scrolling */}
          <div id="messageViewersTarget" style={{ height: "40vh", overflowY: "scroll" }}>
            <InfiniteScroll
              dataLength={users ? users?.length : 0}
              next={() => {
                fetchNextPage();
              }}
              hasMore={hasNextPage} //searchText.trim() !== "" &&
              loader={<LoaderComponent text="Fetching..." />}
              endMessage={
                users &&
                users?.length > 0 && ( //searchText.trim() !== ""
                  <p className="text-green-400">
                    <b>all users here!</b>
                  </p>
                )
              }
              style={{ height: "100%" }}
              scrollableTarget="messageViewersTarget"
            >
              <div className="flex flex-col gap-5 my-4">
                <div className="flex flex-col gap-3">
                  {users && users.length > 0 ? (
                    users.map((user: { userId: Tuser }) =>
                      // Check if user.userId exists
                      user?.userId ? (
                        <UserCard
                          user={user.userId}
                          key={user?.userId?._id + Math.random() * 1000 + Date.now()}
                        />
                      ) : null
                    )
                  ) : !isLoading && !isFetching ? (
                    <h1 className="text-sm md:text-xl m-4 text-center">No User Found!</h1>
                  ) : null}
                </div>

                <h1>{isFetching ? <LoaderComponent text="Fetching..." /> : ""}</h1>
              </div>
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </>
  );
}
