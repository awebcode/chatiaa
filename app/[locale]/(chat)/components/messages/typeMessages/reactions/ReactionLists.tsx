import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMessageState } from "@/context/MessageContext";
import { IMessage } from "@/context/reducers/interfaces";
import { Reaction, ReactionGroup } from "@/store/types";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import Image from "next/image";
import React, { Dispatch, useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import Card from "./Card";
import { BaseUrl } from "@/config/BaseUrl";
import InfiniteScroll from "react-infinite-scroll-component";
import { Button } from "@/components/ui/button";
import { PopoverArrow, PopoverClose, PopoverContent } from "@radix-ui/react-popover";
import { useTheme } from "next-themes";
import { axiosClient } from "@/config/AxiosConfig";

const ReactionLists = ({
  message,
  messageId,
  reactions,
  reactionsGroup,
  isCurrentUserMessage,
  isOpenReactionListModal,
  setIsOpenReactionListModal,
  handleRemoveReact,
}: {
  message: IMessage;
  messageId: string;
  reactions: Reaction[];
  isCurrentUserMessage: boolean;
  isOpenReactionListModal: boolean;
  setIsOpenReactionListModal: Dispatch<boolean>;
  handleRemoveReact: (messageId: string, reactionId: string) => void;
  reactionsGroup: ReactionGroup[];
}) => {
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  const {theme}=useTheme()
  const [activeTab, setActiveTab] = useState("");
  const [page, setpage] = useState(1);
  const [data, setData] = useState<Reaction[]>([]);
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  //BEST WILL BE REACT INFINITE SCROLL BASE ON ACTIVE TAB
  useEffect(() => {
    setData(message.reactions);
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      const data = await axiosClient.get(
        `/getMessageReactions/${messageId}?emoji=${activeTab}&page=${page}&limit=10`,
        { withCredentials:true }
      );
      setData(data as any);
    };
    if (messageId !== "" && page === 1) {
      fetchData();
    }
  }, [activeTab, messageId]);
  useEffect(() => {
    const fetchData = async () => {
       const data = await axiosClient.get(
         `/getMessageReactions/${messageId}?emoji=${activeTab}&page=${page}&limit=10`,
         { withCredentials: true }
       );
      setData((prev) => [...prev, data as any]);
    };
    if (page > 1) {
      fetchData();
    }
  }, [activeTab, page, messageId]);
  const fetchNextPage = () => {
    setpage((prev) => prev + 1);
  };
  // setShowScrollToBottomButton
  useEffect(() => {
    const container = document.getElementById("ReactionScrollableTarget");

    const handleScroll = () => {
      if (container) {
        const { scrollTop } = container;
        //when will scroll top greater than 500px
        setShowScrollToTopButton(scrollTop > 500);
      }
    };

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
  //scroll to top
  const scrollToTop = () => {
    const container = document.getElementById("ReactionScrollableTarget"); //containerRef.current will be null and not work

    container?.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <PopoverContent
      align={isCurrentUserMessage ? "end" : "start"}
      className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 z-50 min-w-60 md:min-w-80"
      sideOffset={3}
    >
      <PopoverClose className="float-right">
        <MdClose />
      </PopoverClose>
      <PopoverArrow fill={theme === "dark" ? "#1f2937" : "#e5e7eb"} height={12} width={12}/>

      <h1 className="text-xs md:text-sm p-3 border-b-2 mb-6 border-violet-600">
        Reactions ({message.totalReactions})
      </h1>
      {/* Tab start */}
      <div className="flex gap-2 w-full items-center  overflow-x-auto  ">
        <div className="all">
          <div
            onClick={() => setActiveTab("all")}
            className={`p-1  text-[10px] rounded flex gap-1 cursor-pointer hover:animate-pulse duration-200 ${
              activeTab === "" || activeTab === "all" ? "bg-blue-300" : "bg-gray-600"
            }`}
          >
            All
          </div>
          <span className="-mt-2 mx-2 w-full text-gray-800 dark:text-gray-300 text-[10px] rounded-lg p ">
            {message.totalReactions}
          </span>
        </div>
        {reactionsGroup &&
          reactionsGroup?.map((emoji, i) => {
            return (
              <div key={i}>
                <div
                  onClick={() => setActiveTab(emoji?._id)}
                  className={`p-1   rounded flex gap-1 cursor-pointer hover:animate-pulse duration-200 ${
                    activeTab === emoji._id ? "bg-blue-300" : "bg-gray-600"
                  }`}
                >
                  <Emoji
                    size={isSmallDevice ? 12 : 16}
                    lazyLoad
                    emojiStyle={EmojiStyle.APPLE}
                    unified={(emoji as any)._id.codePointAt(0).toString(16)}
                  />
                </div>
                <span className="-mt-2 mx-2 w-full text-gray-800 dark:text-gray-300 text-[10px] rounded-lg p ">
                  {emoji.count}
                </span>
              </div>
            );
          })}
      </div>
      {/* Tab end */}

      <div
        id="ReactionScrollableTarget"
        className="menu p-2 md:p-4 bg-base-200 h-[100px] overflow-y-auto overflow-x-hidden flex flex-col-reverse"
      >
        <InfiniteScroll
          dataLength={data ? data?.length : 0}
          next={() => {
            fetchNextPage();
          }}
          hasMore={message.totalReactions > data.length && data.length >= 10}
          loader={
            <div className="flex justify-center items-center mt-8">
              <div className="w-9 h-9 border-l-transparent border-t-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
          }
          endMessage={
            data.length > 10 && (
              <div className="text-center text-xs text-green-400 pt-10">
                You have viewed all reactions
              </div>
            )
          }
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
          scrollableTarget="ReactionScrollableTarget"
          scrollThreshold={1}
        >
          <div className="flex flex-col  gap-y-2 w-full">
            {data?.map((reaction, i) => {
              return (
                <Card
                  key={reaction._id + Date.now() + Math.random() * 1000}
                  handleRemoveReact={handleRemoveReact}
                  reaction={reaction}
                />
              );
            })}
          </div>
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
    </PopoverContent>
  );
};

export default ReactionLists;
