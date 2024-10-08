import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { ADD_REACTION_ON_MESSAGE } from "@/context/reducers/actions";
import { IMessage } from "@/context/reducers/interfaces";
import { addRemoveEmojiReactions } from "@/apisActions/messageActions";
import { Reaction, ReactionGroup } from "@/store/types";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { useClickAway, useMediaQuery } from "@uidotdev/usehooks";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { v4 } from "uuid";
const ReactionLists = dynamic(() => import("./ReactionLists"));

const DisplayReaction = ({
  message,
  reactions,
  reactionsGroup,
  isCurrentUserMessage,
}: {
  message: IMessage;
  reactions: Reaction[];
  reactionsGroup: ReactionGroup[];
  isCurrentUserMessage: boolean;
}) => {
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  const { onlineUsers } = useOnlineUsersStore();
  const { user: currentUser, selectedChat } = useMessageState();
  const [isOpenReactionListModal, setIsOpenReactionListModal] = useState(false);
  const [messageId, setMessageId] = useState("");
  const dispatch = useMessageDispatch();
  const clickOutsideEmojiModal: any = useClickAway(() => {
    setIsOpenReactionListModal(false);
    setMessageId("");
  });
  const handleRemoveReact = (
    messageId: string,
    reactionId: string,
    tempReactionId: string,
    emoji: string
  ) => {
    //update sender ui without delay
    if (!messageId || !emoji || (!tempReactionId && !reactionId)) return;
    dispatch({
      type: ADD_REACTION_ON_MESSAGE,
      payload: {
        reaction: {
          _id: reactionId,
          reactionId,
          emoji,
          messageId,
          reactBy: currentUser,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          tempReactionId,
        },
        type: "remove",
      },
    });
    const data = {
      reactionId,
      messageId,
      chatId: selectedChat?.chatId,
      receiverId: selectedChat?.userInfo?._id,
      type: "remove",
      tempReactionId,
    };
    addRemoveEmojiReactions(data);
  };
  return (
    <div
      ref={clickOutsideEmojiModal}
      className={`absolute -bottom-[14px]  ${
        isCurrentUserMessage ? "right-0" : "right-0"
      }`}
    >
      {/* ref={clickOutsideEmojiModal} */}
      <Popover>
        <PopoverTrigger
          onClick={() => {
            setIsOpenReactionListModal(!isOpenReactionListModal);
            setMessageId(message._id);
          }}
          className={` relative  cursor-pointer flex gap-[2px]  rounded-lg`}
        >
          {reactionsGroup.slice(0, 4).map((react, i) => {
            // const hasReacted = message.reactions.some(
            //   (e) => e.reactBy?._id === currentUser?._id
            // );
            return (
              <div
                key={i}
                // className={`${
                //   hasReacted ? "border-b-[1px] border-emerald-500 rounded-full " : ""
                // }`}
              >
                <Emoji
                  size={isSmallDevice ? 15 : 18}
                  lazyLoad
                  emojiStyle={EmojiStyle.FACEBOOK}
                  unified={(react as any)?._id?.codePointAt(0).toString(16)}
                />
              </div>
            );
          })}

          {message.totalReactions > 0 && (
            <span className="text-[10px]  ">{message.totalReactions}</span>
          )}
        </PopoverTrigger>
        <ReactionLists
          messageId={messageId}
          message={message}
          reactions={reactions}
          reactionsGroup={reactionsGroup}
          isCurrentUserMessage={isCurrentUserMessage}
          isOpenReactionListModal={isOpenReactionListModal}
          setIsOpenReactionListModal={setIsOpenReactionListModal}
          handleRemoveReact={handleRemoveReact}
        />
      </Popover>
    </div>
  );
};

export default DisplayReaction;
