"use client";
import React, { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllAdminUsers, getAllUsers } from "@/functions/authActions";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dynamic from "next/dynamic";
import { Tuser } from "@/store/types";
import Image from "next/image";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import moment from "moment";
import LoaderComponent from "@/components/Loader";

const UserDropdownMenu = dynamic(() => import("./UserDropdown"), {
  loading: () => <LoaderComponent />,
});
import { useMessageState } from "@/context/MessageContext";
const InfiniteScroll = dynamic(() => import("react-infinite-scroll-component"));

const Users = () => {
  const { onlineUsers } = useOnlineUsersStore();
  const {user:currentUser}=useMessageState()
  const [searchTerm, setSearchTerm] = useState("");
  const searchText = useDebounce(searchTerm, 600);
  const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["fetch-server-user", searchText], //messages

    queryFn: getAllAdminUsers as any,

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

 
  return (
    <>
    
      <div>
        <div className="menu p-4   bg-base-200 text-base-content overflow-y-scroll">
          <div className="flex justify-between">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleInputChange(e)}
              placeholder="Enter name or email here"
              className="shadow-lg max-w-md bg-transparent border border-gray-500 text  text-sm py-3 px-3 rounded-md  outline-none border-1  transition-all duration-300"
            />
            <div className="flex gap-1">
              <TableCell colSpan={3}>Total Online users</TableCell>
              <TableCell className="text-right font-bold">
                ({data?.pages[0]?.totalOnlineUsers})
              </TableCell>
            </div>
            <div>
              <TableCell colSpan={3}>Total users</TableCell>
              <TableCell className="text-right font-bold">({data?.pages[0]?.total})</TableCell>
            </div>
          </div>

          <div id="customTarget" style={{ height: "90vh", overflowY: "scroll" }}>
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
                searchText.trim() !== "" && (
                  <p className="text-green-400">
                    <b>all users here!</b>
                  </p>
                )
              }
              style={{ height: "100%" }}
              scrollableTarget="customTarget"
            >
              <Table>
                <TableCaption>A list of your recent users.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>email</TableHead>
                    <TableHead>avatar</TableHead>
                    <TableHead>role</TableHead>
                    <TableHead>lastActive</TableHead>
                    <TableHead>createdAt</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="">
                  {users && users?.length > 0 ? (
                    users?.map((user: Tuser) => {
                      return (
                        <TableRow
                          className="p-4 "
                          key={user._id + Date.now() + Math.random() * 1500}
                        >
                          <TableCell className="">{user?.name}</TableCell>
                          <TableCell className="">{user?.email}</TableCell>
                          <TableCell className="relative h-16 w-16 rounded-full">
                            <Image
                              src={user?.image}
                              alt={user?.name}
                              height={60}
                              width={60}
                              className="h-full w-full object-cover rounded-full"
                            />
                            <span
                              className={`absolute bottom-2 right-3 rounded-full  p-[6px] ${
                                user?.isOnline
                                  ? "bg-green-500"
                                  : "bg-rose-500"
                              }`}
                            ></span>
                          </TableCell>
                          <TableCell
                            className={`${
                              user?.role === "admin" ? "text-green-500" : "text-rose-500"
                            }`}
                          >
                            {user?.role}
                          </TableCell>
                          <TableCell className="">
                            {moment(user?.lastActive).fromNow()}
                          </TableCell>
                          <TableCell className="">
                            {moment(user?.createdAt).format("lll")}
                          </TableCell>
                          <TableCell className="">
                            <UserDropdownMenu user={user} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <h1 className="text-sm md:text-xl m-4 text-center">No User Found!</h1>
                  )}

                  <h1>{isFetching ? "isFetching" : ""}</h1>
                </TableBody>
              </Table>
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </>
  );
};

export default Users;
