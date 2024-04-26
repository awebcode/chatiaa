"use client";

import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
// const MessageCard = dynamic(() => import("./MessageCard"), {
//   loading: () => <MessageLoader />,
// });
// const NoChatProfile = dynamic(() => import("../NoChatProfile"));
import { FaArrowDown } from "react-icons/fa";
import useIncomingMessageStore from "@/store/useIncomingMessage";
import InfiniteScroll from "react-infinite-scroll-component";
import { useMediaQuery } from "@uidotdev/usehooks";
import { SET_MESSAGES, SET_TOTAL_MESSAGES_COUNT } from "@/context/reducers/actions";
import TypingIndicator from "../TypingIndicator";
import { IMessage } from "@/context/reducers/interfaces";
import { allMessages } from "@/apisActions/messageActions";
import { QueryClient, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import LoaderComponent from "@/components/Loader";
import NoChatProfile from "../NoChatProfile";
import MessageCard from "./MessageCard";
import type { Scrollbar as BaseScrollbar } from "smooth-scrollbar/scrollbar";
import MessageLoader from "@/components/MessageLoader";
import { inittialDummyMessages } from "@/config/dummyData/messages";
import { filterDuplicateTempMessageIds } from "../logics/logics";
function Messages({ chatId }: { chatId: string }) {
  const { selectedChat } = useMessageState();
  const { messages, totalMessagesCount } = useMessageState();
  // const queryClient = new QueryClient();

  const dispatch = useMessageDispatch();
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const { isIncomingMessage } = useIncomingMessageStore();
  const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);
  const prevMessageRef = useRef(0);
  const { data, fetchNextPage, hasNextPage, isLoading, isFetching } = useInfiniteQuery({
    queryKey: ["messages", chatId],
    queryFn: allMessages as any,
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

    // initialData: (): any => {
    //   // const messages = selectedChat?.messages?.messages;
    //   if (inittialDummyMessages) {
    //     return {
    //       pageParams: [0],
    //       pages: [{ messages:inittialDummyMessages }],
    //     };
    //   } else {
    //     return undefined;
    //   }
    // }, //queryClient.getQueryData(['messages',chatId])
    staleTime: 0,
  });

  const messagesPayload = useMemo(() => {
    return data?.pages.flatMap((page) => page.messages);
  }, [data?.pages]);

  useEffect(() => {
    dispatch({
      type: SET_MESSAGES,
      payload: messagesPayload,
    });
    ///down from the top without set it then will infinite refetching without scrolling
    const container = document.getElementById("MessagesscrollableTarget");
    if (container) {
      container.scrollTop = container.scrollTop + 100; //200
    }

    dispatch({ type: SET_TOTAL_MESSAGES_COUNT, payload: data?.pages[0]?.total });

    // Uncomment the following lines if you want to update local storage chat
    // const storedChats = JSON.parse(localStorage.getItem("chats") || "[]");
    // const isExistChatIndex = storedChats.findIndex(
    //   (chat) => chat?._id === selectedChat?.chatId
    // );
    // if (data?.pages[0]?.messages) {
    //   if (isExistChatIndex !== -1) {
    //     storedChats[isExistChatIndex].messages.messages = data?.pages[0]?.messages;
    //     localStorage.setItem("chats", JSON.stringify(storedChats));
    //   }
    // }
  }, [messagesPayload, data?.pages, dispatch, selectedChat]);
  useEffect(() => {
    const container = document.getElementById("MessagesscrollableTarget"); //containerRef.current will be null and not work

    if (isIncomingMessage && container) {
      // container?.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      container.scrollTop = container.scrollHeight - container.clientHeight - 50; // Scroll slightly above the bottom
      useIncomingMessageStore.setState({
        isIncomingMessage: false,
      });
    }
  }, [isIncomingMessage]);

  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById("MessagesscrollableTarget");
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        //when will scroll top greater than 500px
        setShowScrollToBottomButton(scrollTop <= -500);
      }
    };

    const container = document.getElementById("MessagesscrollableTarget");
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
    const container = document.getElementById("MessagesscrollableTarget"); //containerRef.current will be null and not work

    container?.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

    // if (messageEndRef.current)
    //   messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  };
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  useEffect(() => {
    const container = document.getElementById("MessagesscrollableTarget");
    if (container) {
      prevMessageRef.current = container.scrollHeight;
    }
  }, []);
  //return
  if (!selectedChat) return;
  return (
    <div
      id="MessagesscrollableTarget"
      className="menu p-1 bg-base-200 max-h-[85vh] md:max-h-[80vh]   overflow-y-auto  flex flex-col-reverse"
    >
      <InfiniteScroll
        dataLength={messages ? messages?.length : 0}
        next={fetchNextPage}
        hasMore={hasNextPage} //!isLoading &&
        loader={<LoaderComponent text="Fetching messages..." />}
        endMessage={
          !isLoading && (
            <div className="text-center text-2xl text-green-400 pt-10">
              {/* You have viewed all messages! */}
            </div>
          )
        }
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          overflow: "scroll",

          height: "100%",
          scrollBehavior: "smooth",
        }}
        inverse={true}
        scrollableTarget="MessagesscrollableTarget"
        // scrollThreshold={1}
      >
        {/* //mb-[66px] */}
        <div className="messageRender flex flex-col-reverse m-1 p-1 gap-[7px] mr-1 md:mr-2  h-full">
          {/* //gap-3 p-2  m-1 */}
          <div
            id="messageEndTarget"
            className="pb-4 mb-4 md:pb-3 md:mb-0"
            ref={messageEndRef}
          ></div>
          {/* typing indicator */}

          <TypingIndicator onFriendListCard={false} />
          {isLoading ? (
            <LoaderComponent text="Fetching messages..." />
          ) : (
            messages &&
            messages?.length > 0 &&
            filterDuplicateTempMessageIds(messages).map(
              (message: IMessage, index: number) => {
                //every message card must use  unuque key and don't use random key , if you use random key and update in messages then all messages will re render... prefetch messages duplicate key  problem here although i used unique key
                return (
                  <MessageCard
                    message={message}
                    key={
                      message?._id + message?.tempMessageId

                      //+ Date.now() +
                      // Math.floor(Math.random() * 100)}

                      // //   message?._id +
                      //   message?.tempMessageId +
                      //   Date.now() +
                      //   Math.floor(Math.random() * 100)
                    }
                  />
                );
              }
            )
          )}
        </div>

        {selectedChat &&
          !isLoading &&
          !isFetching &&
          totalMessagesCount > 0 &&
          totalMessagesCount === messages?.length && (
            <NoChatProfile selectedChat={selectedChat as any} />
          )}
        {/* when selectedChat have no chat */}
        {selectedChat &&
          !isLoading &&
          !isFetching &&
          data?.pages[0]?.total === 0 &&
          totalMessagesCount === 0 && (
            <NoChatProfile selectedChat={selectedChat as any} />
          )}
        <div
          className={`absolute left-1/2 bottom-20 bg-gray-600 bg-opacity-75 animate-pulse   z-50 p-1 rounded-sm cursor-pointer transition-all duration-300 ${
            showScrollToBottomButton
              ? "opacity-100 translate-y-100 scale-100"
              : "translate-y-0 opacity-0 scale-0"
          }`}
          onClick={() => scrollToBottom()}
        >
          <FaArrowDown className="w-3 h-3 md:w-4  md:h-4 m-2 animate-bounce text-emerald-500" />
        </div>
      </InfiniteScroll>
    </div>
  );
}
export default memo(Messages)
