import { useMessageState } from "@/context/MessageContext";
import { addRemoveEmojiReactions } from "@/functions/messageActions";
import { Reaction, ReactionGroup } from "@/store/types";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import { useClickAway, useMediaQuery } from "@uidotdev/usehooks";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import dynamic from "next/dynamic";
import React, { useState } from "react";
const ReactionLists = dynamic(() => import("./ReactionLists"));

const DisplayReaction = ({
  reactions,
   reactionsGroup,
  isCurrentUserMessage,
}: {
  reactions: Reaction[];
  reactionsGroup: ReactionGroup[];
  isCurrentUserMessage: boolean;
}) => {
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  const { onlineUsers } = useOnlineUsersStore();
  const { user: currentUser, selectedChat } = useMessageState();
  const [isOpenReactionListModal, setIsOpenReactionListModal] = useState(false);
  const clickOutsideEmojiModal: any = useClickAway(() => {
    setIsOpenReactionListModal(false);
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
    <div ref={clickOutsideEmojiModal} className="absolute -bottom-4 right-0 ">
      {/* ref={clickOutsideEmojiModal} */}
      <div
        onClick={() => setIsOpenReactionListModal(!isOpenReactionListModal)}
        className="relative flex gap-1 cursor-pointer"
      >
        {reactions.slice(0, 3).map((react, i) => {
          return (
            <Emoji
              size={18}
              lazyLoad
              emojiStyle={EmojiStyle.APPLE}
              unified={(react as any)?.emoji?.codePointAt(0).toString(16)}
            />
          );
        })}
      </div>
      <ReactionLists
        reactions={reactions}
        reactionsGroup={reactionsGroup}
        isCurrentUserMessage={isCurrentUserMessage}
        isOpenReactionListModal={isOpenReactionListModal}
        setIsOpenReactionListModal={setIsOpenReactionListModal}
        handleRemoveReact={handleRemoveReact}
      />
    </div>
  );
};

export default DisplayReaction;
