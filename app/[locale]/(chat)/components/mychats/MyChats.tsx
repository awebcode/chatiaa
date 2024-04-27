"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";

import dynamic from "next/dynamic";
const InfiniteScroll = dynamic(() => import("react-infinite-scroll-component"));

import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import SkeletonContainer from "./SkeletonContainer";
import { Button } from "@/components/ui/button";
import { getChats } from "@/apisActions/chatActions";
import { QueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { BiLoaderCircle } from "react-icons/bi";
import { SET_CHATS } from "@/context/reducers/actions";
import FriendsCard from "./FriendCard";
import LoaderComponent from "@/components/Loader";
import { IChat } from "@/context/reducers/interfaces";
import { inittialDummyChats } from "@/config/dummyData/chats";

const MyChats = () => {
  const queryClient = new QueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const searchText = useDebounce(searchTerm, 700);
  const { user: currentUser, selectedChat, chats, totalChats } = useMessageState();
  const dispatch = useMessageDispatch();
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  const { data, isLoading, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["chats", searchText],
    queryFn: getChats as any,
    getNextPageParam: (lastPage: any) => {
      const { prevOffset, total, limit } = lastPage;
      // Calculate the next offset based on the limit
      const nextOffset = prevOffset !== undefined ? prevOffset + limit : 0;
      // Check if there are more items to fetch
      if (nextOffset >= total) {
        return;
      }
      return nextOffset;
    },
    initialPageParam: 0,
    initialData: (): any => {
      if (chats && chats.length > 0) {
        return {
          pageParams: [0],
          pages: [{ chats: chats }],
        };
      } else {
        return undefined;
      }
    }, 
    staleTime: 0,
  });
  // set chats in reducer store
  const chatsPayload = useMemo(() => {
    return {
      chats: data?.pages.flatMap((page) => page.chats),
      total: data?.pages[0]?.total,
    };
  }, [data?.pages]);

  useEffect(() => {
    dispatch({
      type: SET_CHATS,
      payload: chatsPayload,
    });

    // Uncomment the following lines if you want to save chats to localStorage
    if (data?.pages[0]?.chats) {
      localStorage.setItem("chats", JSON.stringify(data?.pages[0]?.chats));
    }
  }, [chatsPayload, dispatch]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // setShowScrollToTopButton
  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById("ChatscrollableTarget");
      if (container) {
        const { scrollTop } = container;
        //when will scroll top greater than 500px
        setShowScrollToTopButton(scrollTop > 1000);
      }
    };

    const container = document.getElementById("ChatscrollableTarget");
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    // Check initial scroll position

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);
  //scrollToBottom
  const scrollToTop = () => {
    const container = document.getElementById("ChatscrollableTarget"); //containerRef.current will be null and not work

    container?.scrollTo({ top: 0, behavior: "smooth" });
  };
  // console.log({ chats: queryClient.getQueryData(["chats", searchText]) });

  return (
    <>
      <div>
        <div className="menu p-2 md:p-4     bg-base-200 text-base-content overflow-y-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleInputChange(e)}
            placeholder="Search for group people"
            className="bg-transparent w-full    text-sm py-2 md:py-3 px-3 rounded-md  outline-none border border-gray-200 dark:border-gray-500 transition-all duration-300"
          />

          <div
            id="ChatscrollableTarget"
            style={{ height: "80vh", overflowY: "auto" }}
            className="mt-2 z-50 overflow-scroll"
          >
            <InfiniteScroll
              dataLength={chats ? chats?.length : 0}
              next={fetchNextPage}
              hasMore={!isLoading && hasNextPage}
              loader={<>{/* <LoaderComponent /> */}</>}
              endMessage={
                !isLoading &&
                chats?.length > 10 && (
                  <div className="text-center text-2xl text-green-400 pt-10">
                    You have viewed all chats!
                  </div>
                )
              }
              scrollableTarget="ChatscrollableTarget"
              scrollThreshold={1}
            >
              <div
                className={`flex flex-col gap-2 z-50 overflow-y-scroll ${
                  chats.length > 6 ? "h-[60vh]" : "min-h-[60vh]"
                } `}
              >
                {isLoading ? (
                  <SkeletonContainer />
                ) : chats && chats.length > 0 ? (
                  chats.map((chat) => (
                    <FriendsCard
                      chat={chat}
                      key={chat._id + Date.now().toString() + Math.random() * 100}
                    />
                  ))
                ) : (
                  <h1 className="text-sm md:text-xl m-4 text-center font-medium">
                    No Chat Found!
                  </h1>
                )}
              </div>
              {/* {isFetching && <LoaderComponent />} */}
            </InfiniteScroll>
            <Button
              onClick={scrollToTop}
              className={`absolute bottom-0 right-0 ${
                showScrollToTopButton ? "block" : "hidden"
              }`}
            >
              Top
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyChats;
