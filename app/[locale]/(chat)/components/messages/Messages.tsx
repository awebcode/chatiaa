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
import TypingIndicator from "../TypingIndicator";
import { useTypingStore } from "@/store/useTyping";
import { BaseUrl } from "@/config/BaseUrl";

export default function Messages() {
  const { selectedChat } = useMessageState();
  const { messages, totalMessagesCount } = useMessageState();
  const {
    isTyping,
    content: typingContent,
    chatId: typingChatId,
    userInfo: typingUserInfo,
  } = useTypingStore();
  const dispatch = useMessageDispatch();
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [page, setpage] = useState(1);
  const { isIncomingMessage } = useIncomingMessageStore();
  const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);
  const prevMessageRef = useRef(0);
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
  const mountref=useRef(true)
  useEffect(() => {

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${BaseUrl}/allmessages/${selectedChat?.chatId}?page=${page}&limit=10`,
          {
            credentials: "include",
            // cache: "reload",
          }
        );
        const data = await res.json();
        console.log({res:data})

        if (messages.length < 10) {
          
          dispatch({ type: SET_MESSAGES, payload: data.messages });
          dispatch({ type: SET_TOTAL_MESSAGES_COUNT, payload: data.total });
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    if (mountref.current&&selectedChat && page === 1) {
      fetchData();
    }

    return () => {
      mountref.current = false; // Setting mounted flag to false on component unmount
    };
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${BaseUrl}/allmessages/${selectedChat?.chatId}?page=${page}&limit=10`,
          {
            credentials: "include",
            // cache: "reload",
          }
        );
        const data = await res.json();
       
          dispatch({ type: SET_MESSAGES, payload: data.messages });
        dispatch({ type: SET_TOTAL_MESSAGES_COUNT, payload: data.total });

        
        const container = document.getElementById("CustomscrollableTarget");
        if (container) {
          const { scrollTop, scrollHeight, clientHeight } = container;
          if (prevMessageRef.current === null) {
            prevMessageRef.current = scrollHeight;
          } else {
            const heightDifference = scrollHeight - prevMessageRef.current;

            const checkDifference = prevMessageRef.current > 487 ? heightDifference : 150;

            //ofcontainer.scrollTop = scrollTop+clientHeight or greter than 500px
            container.scrollTop = scrollTop + checkDifference; // Maintain scroll position
            prevMessageRef.current = scrollHeight;
          }
        }
      } catch (error) {
        console.log({ error });
      }
    };
    if (page > 1) {
      fetchData();
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
        //when will scroll top greater than 500px
        setShowScrollToBottomButton(scrollTop <= -500);
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
  useEffect(() => {
    const container = document.getElementById("CustomscrollableTarget");
    if (container) {
      prevMessageRef.current = container.scrollHeight;
    }
  }, []);
  console.log("called",messages);
  return (
    <div
      id="CustomscrollableTarget"
      className="menu p-2 md:p-4 bg-base-200 h-[65vh] overflow-y-auto overflow-x-hidden flex flex-col-reverse"
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
        style={{ display: "flex", flexDirection: "column-reverse", height: "100%" }}
        inverse={true}
        scrollableTarget="CustomscrollableTarget"
        scrollThreshold={1}
      >
        <div className="flex flex-col-reverse gap-3 m-2 p-2">
          <div id="messageEndTarget" ref={messageEndRef}></div>
          {isTyping && typingContent && typingChatId === selectedChat?.chatId && (
            <TypingIndicator
              user={typingUserInfo}
              isTyping={isTyping}
              onFriendListCard={false}
            />
          )}
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
        {!loading &&
          totalMessagesCount > 0 &&
          totalMessagesCount === messages?.length && messages?.length>10 && (
            <div className="text-center text-2xl text-green-400 pt-10">
              You have viewed all messages
            </div>
          )}
        {!loading &&
          totalMessagesCount > 0 &&
          totalMessagesCount === messages?.length && (
            <NoChatProfile selectedChat={selectedChat as any} />
          )}
        {/* when selectedChat have no chat */}
        {messages.length === 0 && !loading && (
          <NoChatProfile selectedChat={selectedChat as any} />
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
