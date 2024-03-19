"use client";

import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { useEffect, useRef, useState } from "react";
import { findLastSeenMessageIndex } from "../logics/logics";
import dynamic from "next/dynamic";

const MessageCard = dynamic(() => import("./MessageCard"));
const NoChatProfile = dynamic(() => import("../NoChatProfile"));
import { FaArrowDown } from "react-icons/fa";
import useIncomingMessageStore from "@/store/useIncomingMessage";
import InfiniteScroll from "react-infinite-scroll-component";
import { useMediaQuery } from "@uidotdev/usehooks";
import { axiosClient } from "@/config/AxiosConfig";
import { SET_MESSAGES, SET_TOTAL_MESSAGES_COUNT } from "@/context/reducers/actions";

export default function Messages() {
  const { selectedChat } = useMessageState();
  const { messages, totalMessagesCount } = useMessageState();

  const dispatch = useMessageDispatch();
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [page, setpage] = useState(1);
  const { isIncomingMessage } = useIncomingMessageStore();
  const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);
  useEffect(() => {
    const container = document.getElementById("CustomscrollableTarget"); //containerRef.current will be null and not work

  
   if (isIncomingMessage) {
      container?.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
   }
   const tid = setTimeout(() => {
     if (isIncomingMessage) {
       useIncomingMessageStore.setState({
         isIncomingMessage: false,
       });
     }
   }, 1500);
   return () => clearTimeout(tid);
 }, [isIncomingMessage]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get(
          `/allmessages/${selectedChat?.chatId}?page=${page}&limit=10`
        );
        if (messages.length === 0) {
          dispatch({ type: SET_MESSAGES, payload: data.messages });
        }
        dispatch({ type: SET_TOTAL_MESSAGES_COUNT, payload: data.total });
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    return () => {
      if (page === 1) {
        fetchData();
      }
    };
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axiosClient.get(
          `/allmessages/${selectedChat?.chatId}?page=${page}&limit=10`
        );
        dispatch({ type: SET_MESSAGES, payload: data.messages });
        const container = document.getElementById("CustomscrollableTarget");
        if (container) {
          container.scrollTop = -100;
        }
      } catch (error) {
        console.log({ error });
      }
    };
    if (page > 1) {
      fetchData();

      console.log("called in page > 1 page");
    }
  }, [page]);

  const fetchNextPage = () => {
    setpage((prev) => prev + 1);
  };

 
  // setShowScrollToBottomButton
  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById("CustomscrollableTarget");
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;

        setShowScrollToBottomButton(scrollTop <= -600);
      }
    };

    const container = document.getElementById("CustomscrollableTarget");
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    // Check initial scroll position

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [messages]);
  //scrollToBottom
  const scrollToBottom = () => {
    const container = document.getElementById("CustomscrollableTarget"); //containerRef.current will be null and not work

    container?.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

    // if (messageEndRef.current)
    //   messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  };
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  return (
    <div
      id="CustomscrollableTarget"
      className="menu p-2 md:p-4 bg-base-200 h-[64vh] overflow-y-scroll overflow-x-hidden flex flex-col-reverse"
    >
      <InfiniteScroll
        dataLength={messages ? messages?.length : 0}
        next={() => {
          fetchNextPage();
        }}
        hasMore={totalMessagesCount > messages.length}
        loader={
          <div className="flex justify-center items-center mt-8">
            <div className="w-9 h-9 border-l-transparent border-t-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        }
        endMessage={
          !loading &&
          messages.length > 0 &&
          // <div className="text-center text-2xl text-green-400 pt-10">
          //   You have viewed all data
          // </div>
          ""
        }
        style={{ display: "flex", flexDirection: "column-reverse" }}
        inverse={true}
        scrollableTarget="CustomscrollableTarget"
        scrollThreshold={1}
      >
        <div className="flex flex-col-reverse gap-3 m-2 p-2">
          {loading ? (
            <div className="flex justify-center items-center mt-6">
              <div className="w-9 h-9 border-l-transparent border-t-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            messages &&
            messages.map((message: any, index: number) => {
              return (
                <MessageCard
                  message={message}
                  key={message._id + Date.now() + Math.floor(Math.random() * 1000)}
                  isLastSeenMessage={index === findLastSeenMessageIndex(messages)}
                />
              );
            })
          )}
        </div>
        {totalMessagesCount > 0 && totalMessagesCount === messages?.length && (
          <div className="text-center text-2xl text-green-400 pt-10">
            You have viewed all messages
          </div>
        )}
        {totalMessagesCount > 0 && totalMessagesCount === messages?.length && (
          <NoChatProfile user={selectedChat as any} />
        )}
        {/* when user have no chat */}
        {messages.length === 0 && !loading && (
          <NoChatProfile user={selectedChat as any} />
        )}
        <div
          className={`absolute left-1/2 bottom-6  z-50 p-2 rounded cursor-pointer transition-all duration-300 ${
            showScrollToBottomButton
              ? "opacity-100 translate-y-100 scale-100"
              : "translate-y-0 opacity-0 scale-0"
          }`}
          onClick={() => scrollToBottom()}
        >
          <FaArrowDown className="w-5  h-5 mt-1 animate-bounce text-green-500" />
        </div>
      </InfiniteScroll>
    </div>
  );
}
