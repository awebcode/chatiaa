import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { useMessageState } from "@/context/MessageContext";
import { IMessage } from "@/context/reducers/interfaces";
import { addRemoveEmojiReactions } from "@/functions/messageActions";
import { Reaction, ReactionGroup } from "@/store/types";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { useClickAway, useMediaQuery } from "@uidotdev/usehooks";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import dynamic from "next/dynamic";
import React, { useState } from "react";
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
  const clickOutsideEmojiModal: any = useClickAway(() => {
    setIsOpenReactionListModal(false);
    setMessageId("")
  });
  const handleRemoveReact = async (messageId: string, reactionId: string) => {
    const data = {
      reactionId,
      messageId,
      chatId: selectedChat?.chatId,
      receiverId: selectedChat?.userInfo?._id,
      type: "remove",
    };
    const res = await addRemoveEmojiReactions(data);
  };
  return (
    <div
      ref={clickOutsideEmojiModal}
      className={`absolute -bottom-[30px]  ${
        isCurrentUserMessage ? "right-0" : "left-4"
      }`}
    >
      {/* ref={clickOutsideEmojiModal} */}
      <Popover>
        <PopoverTrigger
          onClick={() => {
            setIsOpenReactionListModal(!isOpenReactionListModal);
            setMessageId(message._id);
          }}
          className="relative  cursor-pointer flex gap-1 bg-gray-700 border border-black p-1 rounded-lg"
        >
          {reactionsGroup.slice(0, 4).map((react, i) => {
            return (
              <Emoji
                size={isSmallDevice ? 12 : 16}
                lazyLoad
                emojiStyle={EmojiStyle.APPLE}
                unified={(react as any)?._id?.codePointAt(0).toString(16)}
              />
            );
          })}
          <span className="text-xs">{message.totalReactions}</span>
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
