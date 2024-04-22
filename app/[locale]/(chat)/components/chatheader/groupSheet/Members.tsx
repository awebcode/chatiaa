import { Input } from "@/components/ui/input";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import {  getUsersInAChat } from "@/functions/chatActions";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import dynamic from "next/dynamic";
import React, {  useMemo, useState } from "react";
import Card from "./Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddMembers from "./add/AddMembers";
import LoaderComponent from "@/components/Loader";
const InfiniteScroll = dynamic(() => import("react-infinite-scroll-component"));
const Members = () => {
  const dispatch = useMessageDispatch();
  const { selectedChat } = useMessageState();
  const [searchTerm, setsearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 600);
  const { data, isFetching, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: [selectedChat?.chatId, debouncedSearch,"groupUsers"],

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
  const users = useMemo(() => {
   return data?.pages.flatMap((page) => page?.users);
  },[data]);
  //SET_GROUP_USERS_ON_FETCHING on group
  // useEffect(() => {
  //   if (users) {
  //     dispatch({ type: SET_GROUP_USERS_ON_FETCHING, payload: { users } });
  //   }
  // }, [users]);
  return (
    <div className="w-full  overflow-y-auto">
      <Tabs defaultValue="Members" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="Members">Members</TabsTrigger>
          <TabsTrigger value="Admins">Admins</TabsTrigger>
        </TabsList>
        <TabsContent value="Members">
          {/* Search group users */}
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setsearchTerm(e.target.value)}
            placeholder="username or email..."
            className="shadow-lg w-full h-auto bg-transparent  text-[10px] md:text-sm py-3 px-3 rounded-md  outline-none border border-gray-400  transition-all duration-300"
          />
          <div className="flex items-center justify-between">
            <h1>Members</h1>
            <AddMembers/>
          </div>

          {/* Infinite scrolling */}
          <div
            id="GroupUsersScrollableTarget"
            style={{ height: "40vh", overflowY: "auto" }}
          >
            <InfiniteScroll
              dataLength={users ? users?.length : 0}
              next={() => {
                fetchNextPage();
              }}
              hasMore={hasNextPage}
              loader={<LoaderComponent/>}
              endMessage={
                users &&
                users?.length > 0 && (
                  <p className="text-green-400">
                    <b>all users here!</b>
                  </p>
                )
              }
              style={{ height: "100%" }}
              scrollableTarget="GroupUsersScrollableTarget"
            >
              <div className="flex flex-col gap-2 my-2">
                {users && users?.length > 0
                  ? users?.map((user: any) => {
                      return <Card user={user} key={user?._id} />;
                    })
                  : !isLoading &&
                    !isFetching && (
                      <h1 className="text-sm md:text-xl m-4 text-center">
                        No User Found!
                      </h1>
                    )}

                <h1>{isFetching ? "isFetching" : ""}</h1>
              </div>
            </InfiniteScroll>
          </div>
        </TabsContent>
        {/* Admins */}
        <TabsContent value="Admins">
          {selectedChat?.groupAdmin && selectedChat?.groupAdmin?.length > 0
            ? selectedChat?.groupAdmin?.map((user: any) => {
                return <Card user={user} key={user?._id} />;
              })
            : null}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Members;
