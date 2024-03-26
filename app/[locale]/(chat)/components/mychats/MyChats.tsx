"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";

import dynamic from "next/dynamic";
const InfiniteScroll = dynamic(() => import("react-infinite-scroll-component"));
const FriendsCard = dynamic(() => import("./FriendCard"));

import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import ChatLoading from "../ChatLoading";
import SkeletonContainer from "./SkeletonContainer";
import { BaseUrl } from "@/config/BaseUrl";
import { SET_CHATS } from "@/context/reducers/actions";
import { Button } from "@/components/ui/button";

const MyFriends = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchText = useDebounce(searchTerm, 700);
  const { user: currentUser, selectedChat, chats, totalChats } = useMessageState();
  const dispatch = useMessageDispatch();
  const [isLoading, setLoading] = useState(false);
  const [page, setpage] = useState(1);
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  // const { } = useInfiniteQuery({
  //   queryKey: ["users", searchText, currentUser?._id],

  //   queryFn: getChats as any,

  // });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${BaseUrl}/fetchChats?page=${page}&limit=10&search=${searchText}`,
          {
            credentials: "include",
            cache: "no-cache",
            // next: { revalidate: 0 },
            // cache: "reload",
          }
        );
        const data = await res.json();
          dispatch({
            type: SET_CHATS,
            payload: { chats: data.chats, total: data.total },
          });

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    if (page === 1) {
      fetchData();
    }
  }, [searchText]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${BaseUrl}/fetchChats?page=${page}&limit=10&search=${searchText}`,
          {
            credentials: "include",
            cache:"no-cache",
            // next:{revalidate:0}
          }
        );
        const data = await res.json();
        dispatch({ type: SET_CHATS, payload: { chats: data.chats, total: data.total,onScrollingData:"true" } });
      } catch (error) {
        console.log({ error });
      }
    };
    if (page > 1) {

      fetchData();
    }
  }, [page, searchText]);

  const fetchNextPage = () => {
    console.log("fetchnextpage")
    setpage((prev) => prev + 1);
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

    // if (messageEndRef.current)
    //   messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // console.log({chats});
  
  return (
    <>
      <div>
        <div className="menu p-4     bg-base-200 text-base-content overflow-y-scroll">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleInputChange(e)}
            placeholder="Search Friends"
            className="bg-transparent w-full    text-sm py-3 px-3 rounded-md  outline-none border border-gray-200 dark:border-gray-500 transition-all duration-300"
          />

          <div
            id="ChatscrollableTarget"
            style={{ height: "80vh", overflowY: "auto" }}
            className="mt-2 z-50 "
          >
            <InfiniteScroll
              dataLength={chats ? chats?.length : 0}
              next={() => {
                fetchNextPage();
              }}
              hasMore={totalChats > chats.length}
              loader={<div>Loading...</div>}
              endMessage={
                // chats &&
                // chats.length > 10 &&
                // !isLoading && (
                // <p className="text-green-400">
                //   <b>Yay! You have seen it all</b>
                // </p>
                // )
                <p className="text-green-400 text-center text-xl">
                  <b>Yay! You have seen  all</b>
                </p>
              }
              style={{ height: "100%", overflow: "auto" }}
              scrollableTarget="ChatscrollableTarget"
              scrollThreshold={0.5}
            >
              <div className="flex flex-col gap-2 z-50 min-h-[80vh] ">
                {isLoading ? (
                  <>
                    <SkeletonContainer />
                  </>
                ) : chats && chats.length > 0 ? (
                  chats.map((chat) => (
                    <FriendsCard chat={chat} key={chat._id + Date.now().toString()} />
                  ))
                ) : (
                  <h1 className="text-sm md:text-xl m-4 text-center">No Chat Found!</h1>
                )}
              </div>
              {/* {isFetching && <h1 className="text-center p-2 text-2xl">Fetching...</h1>} */}
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

export default MyFriends;
