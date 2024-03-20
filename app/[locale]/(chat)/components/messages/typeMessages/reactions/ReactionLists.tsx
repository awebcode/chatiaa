import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMessageState } from "@/context/MessageContext";
import { Reaction, ReactionGroup } from "@/store/types";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import Image from "next/image";
import React, { Dispatch, useState } from "react";
import { MdClose } from "react-icons/md";

const ReactionLists = ({
  reactions,
  reactionsGroup,
  isCurrentUserMessage,
  isOpenReactionListModal,
  setIsOpenReactionListModal,
  handleRemoveReact,
}: {
  reactions: Reaction[];
  isCurrentUserMessage: boolean;
  isOpenReactionListModal: boolean;
  setIsOpenReactionListModal: Dispatch<boolean>;
  handleRemoveReact: (messageId: string, reactionId: string) => void;
  reactionsGroup: ReactionGroup[];
}) => {
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  const { onlineUsers } = useOnlineUsersStore();
  const { user: currentUser, selectedChat } = useMessageState();
  const [activeTab, setActiveTab] = useState(reactionsGroup[0]?._id);
  //BEST WILL BE REACT INFINITE SCROLL BASE ON ACTIVE TAB
  // useEffect(() => {
  //   // Fetch reactions for the initial active tab
  //   fetchReactionsForActiveTab();
  // }, [activeTab]);
  return (
    <div
      className={`z-50 absolute bottom-4 ${
        !isCurrentUserMessage
          ? isSmallDevice
            ? "-60px min-w-60 -top-52 max-h-[250px]"
            : "-right-[290px]  md:w-[400px]"
          : "right-10   min-w-60"
      } rounded transition-all bg-gray-100 hover:bg-gray-200 dark:bg-gray-800  p-4 md:p-8 duration-500 ${
        isOpenReactionListModal
          ? "translate-y-1 scale-100 opacity-100 w-auto md:w-[400px] max-h-[300px] overflow-y-auto"
          : "translate-y-0 scale-0 opacity-0"
      }`}
    >
      <button
        onClick={() => setIsOpenReactionListModal(false)}
        className="btn float-right "
      >
        <MdClose />
      </button>
      <h1 className="text-sm md:text-3xl p-3 border-b-2 mb-6 border-violet-600">
        Reactions ({reactions?.length})
      </h1>
      {/* Tab start */}
      <div className="flex gap-2 w-full  overflow-x-auto bg-gray-800">
        {reactionsGroup && reactionsGroup?.map((emoji, i) => {
          return (
            <div
              key={i}
              onClick={() => setActiveTab(emoji?._id)}
              className={`p-2 rounded flex gap-1 cursor-pointer hover:animate-pulse duration-200 ${
                activeTab === emoji._id ? "bg-gray-700" : "bg-gray-600"
              }`}
            >
              <Emoji
                size={isSmallDevice ? 18 : 20}
                lazyLoad
                emojiStyle={EmojiStyle.APPLE}
                unified={(emoji as any)._id.codePointAt(0).toString(16)}
              />
              <span className="mx-2 text-gray-200 font-medium">{emoji.count}</span>
            </div>
          );
        })}
      </div>
      {/* Tab end */}
      <div className="flex flex-col  gap-y-2 w-full">
        {reactions?.map((v, i) => {
          return (
            <div
              key={i}
              className="flexBetween gap-2 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-gray-900 duration-300 p-3 rounded-md"
            >
              <div className=" p-2 flex items-center w-full">
                {" "}
                <div className="h-5 w-5 md:h-8 md:w-8 relative rounded-full ring md:ring-2 ring-violet-600">
                  <Image
                    height={35}
                    width={35}
                    className="rounded-full h-full w-full "
                    alt={v?.reactBy?.name as any}
                    src={v?.reactBy?.image as any}
                  />
                  {onlineUsers.some((u: any) => u.id === v?.reactBy._id) ? (
                    <span
                      className={`absolute bottom-0 right-0 rounded-full p-1 md:p-[6px] 
                                        bg-green-500
                                      `}
                    ></span>
                  ) : (
                    <span
                      className={`absolute bottom-0 right-0 rounded-full p-[6px] 
                                       bg-rose-500
                                      `}
                    ></span>
                  )}
                </div>
                <div className="flex flex-col mx-4">
                  <span>{v?.reactBy.name}</span>
                  {/* Remove own react */}
                  {v.reactBy._id === currentUser?._id && (
                    <span
                      className="text-rose-300 text-[8px] md:text-xs cursor-pointer my-1"
                      onClick={() => {
                        handleRemoveReact(v.messageId, v._id);
                        // setIsOpenReactionListModal(false);
                      }}
                    >
                      Click to remove
                    </span>
                  )}
                </div>
              </div>
              {/* Right side */}

              <div className="emoji text-[14px] md:text-sm  text-yellow-400">
                <Emoji
                  size={isSmallDevice ? 18 : 20}
                  lazyLoad
                  emojiStyle={EmojiStyle.APPLE}
                  unified={(v as any).emoji?.codePointAt(0).toString(16)}
                />{" "}
                {/* <span className="">{v.emoji}</span> */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReactionLists;
