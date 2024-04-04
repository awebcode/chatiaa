import { useMessageState } from "@/context/MessageContext";
import { Reaction } from "@/store/types";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import Image from "next/image";
import React from "react";

const Card = ({
  reaction,
  handleRemoveReact,
}: {
  reaction: Reaction;
  handleRemoveReact: (messageId: string, reactionId: string,emoji:string) => void;
}) => {
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  const { onlineUsers } = useOnlineUsersStore();
  const { user: currentUser, selectedChat } = useMessageState();
  return (
    <div className="flexBetween gap-1 bg-gray-200  hover:bg-gray-300 dark:bg-gray-900 duration-300 p-1 rounded-md">
      <div className=" p-1 flex items-center w-full">
        {" "}
        <div className="h-5 w-5  relative rounded-full ring  ring-violet-600">
          <Image
            height={35}
            width={35}
            className="rounded-full h-full w-full "
            alt={reaction?.reactBy?.name as any}
            src={reaction?.reactBy?.image as any}
          />
          {onlineUsers.some((u: any) => u.id === reaction?.reactBy._id) ? (
            <span
              className={`absolute bottom-0 right-0 rounded-full p-1 md:p-[3px] 
                                        bg-green-500
                                      `}
            ></span>
          ) : (
            <span
              className={`absolute bottom-0 right-0 rounded-full p-1 md:p-[3px] 
                                       bg-rose-500
                                      `}
            ></span>
          )}
        </div>
        <div className="flex flex-col mx-4">
          <span className="text-xs">{reaction?.reactBy.name}</span>
          {/* Remove own react */}
          {reaction.reactBy._id === currentUser?._id && (
            <span
              className="text-rose-300 text-[8px] md:text-[10px] cursor-pointer my-1"
              onClick={() => {
                handleRemoveReact(reaction.messageId, reaction._id,reaction.emoji);
                // setIsOpenReactionListModal(false);
              }}
            >
              Click to remove
            </span>
          )}
        </div>
      </div>
      {/* Right side */}

      <div className="emoji    text-yellow-400">
        <Emoji
          size={isSmallDevice ? 14 : 16}
          lazyLoad
          emojiStyle={EmojiStyle.APPLE}
          unified={(reaction as any).emoji?.codePointAt(0).toString(16)}
        />{" "}
        {/* <span className="">{v.emoji}</span> */}
      </div>
    </div>
  );
};

export default Card;
