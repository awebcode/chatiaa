import React, { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { getAllUsers } from "@/functions/authActions";

import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import useGroupStore from "@/store/useGroupStore";
import { useSocketContext } from "@/context/SocketContextProvider";
import { toast } from "react-toastify";
import { createGroup } from "@/functions/chatActions";
import { SET_CHATS, SET_SELECTED_CHAT } from "@/context/reducers/actions";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { getSenderFull } from "../logics/logics";
import { Button } from "@/components/ui/button";
const SliderUsers = dynamic(() => import("./SliderUsers"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});
import LoaderComponent from "@/components/Loader";
import { useRouter } from "@/navigation";
const InfiniteScroll = dynamic(() => import("react-infinite-scroll-component"));

const GroupCard = dynamic(() => import("./Card"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});
export default function SearchGroupModal() {
  const router = useRouter();
  const dispatch = useMessageDispatch();
  const { socket } = useSocketContext();
  const { user: currentUser } = useMessageState();
  const [searchTerm, setSearchTerm] = useState("");
  const { selectedAddGroupUsers } = useGroupStore();
  const searchText = useDebounce(searchTerm, 600);
  const { data, isFetching, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["messages", searchText, "onGroupsearch"],

    queryFn: getAllUsers as any,

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
  //create group mutation
  const groupMutaion = useMutation({
    mutationFn: (data: any) => createGroup(data),
    onSuccess: (chat) => {
      const isFriend = getSenderFull(currentUser, chat.users);
      toast.success("Group created successfully!");
      const chatData = {
        _id: chat?._id,
        chatId: chat?._id,
        latestMessage: chat?.latestMessage,
        chatCreatedAt: chat?.createdAt,
        groupChatName: chat?.chatName,
        chatName: chat?.chatName,
        isGroupChat: chat?.isGroupChat,
        groupAdmin: chat?.groupAdmin,
        // status: chat?.chatStatus?.status,
        // chatUpdatedBy: chat?.chatStatus?.updatedBy,
        chatStatus: chat?.chatStatus,
        users: chat.isGroupChat ? chat.users : null,
        userInfo: {
          name: !chat?.isGroupChat ? isFriend?.name : chat.chatName,
          email: !chat?.isGroupChat ? isFriend?.email : "",
          _id: !chat?.isGroupChat ? isFriend?._id : chat?._id,
          image: !chat.isGroupChat ? isFriend?.image : "/vercel.svg",
          lastActive: !chat.isGroupChat
            ? getSenderFull(currentUser, chat.isGroupChat.users)?.lastActive
            : "",
          createdAt: !chat.isGroupChat ? isFriend?.createdAt : "",
        } as any,
        groupInfo: {
          description: (chat as any)?.description,
          image: { url: (chat as any)?.image?.url },
        },
        isOnline: true,
        onCallMembers: chat?.onCallMembers,
      };
      socket.emit("groupCreatedNotify", { chatId: chat._id, chat });

      dispatch({ type: SET_SELECTED_CHAT, payload: chatData });
      localStorage.setItem("selectedChat", JSON.stringify(chatData));
      router.replace(`?${chat?._id}`);
      dispatch({ type: SET_CHATS, payload: chatData });
      document.getElementById("closeCreateGroupDialog")?.click();
    },
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const users = data?.pages.flatMap((page) => page?.users);
  //createGroupHandler
  const [groupName, setGroupName] = useState("");
  const createGroupHandler = () => {
    if (selectedAddGroupUsers.length < 2 && groupName.trim() === "") {
      return;
    }

    const userIds = selectedAddGroupUsers.map((user: any) => user._id);
    const groupData = {
      users: userIds,
      groupName,
    };
    groupMutaion.mutateAsync(groupData);
  };
  return (
    <>
      <div>
        <div className="p-2 bg-base-200 text-base-content overflow-y-scroll">
          {/* Group name */}
          <div className="relative mb-5">
            <label className="" htmlFor="Group">
              Group Name:
            </label>
            <Input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group Name."
              className="shadow-lg w-full h-auto bg-transparent  text-[10px] md:text-sm py-3 px-3 rounded-md  outline-none border border-gray-400  transition-all duration-300"
            />
            <Button
              disabled={selectedAddGroupUsers.length < 2 || groupName.trim() === ""}
              className="absolute right-1 top-[22px]  btn m-1 text-xs rounded-md p-[7px] capitalize "
              onClick={() => createGroupHandler()}
            >
              {groupMutaion.isPending ? (
                <LoaderComponent text="Creating..." />
              ) : (
                "+Create"
              )}
            </Button>
          </div>
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
          {/* Infinite scrolling */}
          <div id="GroupSearchTarget" style={{ height: "40vh", overflowY: "scroll" }}>
            <InfiniteScroll
              dataLength={users ? users?.length : 0}
              next={() => {
                fetchNextPage();
              }}
              hasMore={hasNextPage} //searchText.trim() !== "" &&
              loader={<LoaderComponent />}
              endMessage={
                users &&
                users?.length > 0 && ( //searchText.trim() !== ""
                  <p className="text-green-400">
                    <b>all users here!</b>
                  </p>
                )
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

                <h1>{isFetching ? <LoaderComponent /> : ""}</h1>
              </div>
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </>
  );
}
