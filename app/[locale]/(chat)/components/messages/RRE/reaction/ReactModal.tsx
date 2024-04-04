import { IMessage } from "@/context/reducers/interfaces";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import React, { useState } from "react";
const EmojiModal = dynamic(() => import("./EmojiModal"));
import { MdAdd } from "react-icons/md";
import { useClickAway, useMediaQuery } from "@uidotdev/usehooks";
import dynamic from "next/dynamic";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { addRemoveEmojiReactions } from "@/functions/messageActions";

import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { ADD_REACTION_ON_MESSAGE } from "@/context/reducers/actions";
import { v4 } from "uuid";

const ReactModal = ({
  message,
  setIsOpenReactModal,
  isCurrentUserMessage,
}: {
  setIsOpenReactModal: any;
  message: IMessage;
  isCurrentUserMessage: boolean;
}) => {
  const dispatch = useMessageDispatch();

  //emoji
  const { selectedChat, user: currentUser } = useMessageState();
  const [isOpenEmojiModal, setIsOpenEmojiModal] = useState(false);
  const clickEmojiOutsideRef: any = useClickAway(() => {
    setIsOpenEmojiModal(false);
  });
  const onEmojiClick = async (
    e: { emoji: string; unified: string },
    messageId: string
  ) => {
    if(!messageId||!e.emoji)return
    const tempReactionId = v4();
    //update sender ui without delay
    dispatch({
      type: ADD_REACTION_ON_MESSAGE,
      payload: {
        reaction: {
          emoji: e.emoji,
          messageId,
          reactBy: currentUser,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          tempReactionId,
        },
        type: "add",
      },
    });
    const data = {
      emoji: e.emoji,
      messageId,
      chatId: selectedChat?.chatId,
      receiverId: selectedChat?.userInfo?._id,
      type: "add",
      tempReactionId,
    };

    const res = await addRemoveEmojiReactions(data);
    if (res.success) {
    }
  };
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  return (
    <DropdownMenuContent
      align={isCurrentUserMessage ? "end" : "start"}
      className={`md:absolute md:-top-16 flex justify-center items-center p-2 flex-row-reverse bg-gray-200 dark:bg-gray-800`}
    >
      {["🙂", "😢", "🥰", "😂", "😜"].map((v, i: number) => {
        return (
          <div key={i} className=" flex items-center gap-1">
            {" "}
            <span
              onClick={() => {
                const e = { emoji: v, unified: "" };
                onEmojiClick(e, message._id);
                // setOpenReactModal(false);
                // setOpenEmojiModal(false);
              }}
              className={`  text-gray-300 h-6 w-6 mr-1 cursor-pointer transition-all duration-500 hover:scale-105`}
            >
              {" "}
              {/* {v} */}
              <Emoji
                size={isSmallDevice ? 20 : 24}
                lazyLoad
                emojiStyle={EmojiStyle.APPLE}
                unified={(v as any)?.codePointAt(0).toString(16)}
              />{" "}
            </span>
          </div>
        );
      })}
      {/*  */}

      <Popover>
        <PopoverTrigger ref={clickEmojiOutsideRef} className="border-none outline-none">
          <MdAdd
            onClick={() => setIsOpenEmojiModal(!isOpenEmojiModal)}
            className={`flex text-gray-600 dark:text-gray-300 h-5 w-5 md:h-6 md:w-6 mr-1 cursor-pointer `}
          />
        </PopoverTrigger>
        {/* <EmojiBottomSheet
          onEmojiClick={onEmojiClick}
          openEmoji={isOpenEmojiModal}
          setIsOpenReactModal={setIsOpenReactModal}
          message={message}
        /> */}
        <EmojiModal
          onEmojiClick={onEmojiClick}
          openEmoji={isOpenEmojiModal}
          setIsOpenEmojiModal={setIsOpenEmojiModal}
          setIsOpenReactModal={setIsOpenReactModal}
          message={message}
          isCurrentUserMessage={isCurrentUserMessage}
        />
      </Popover>
    </DropdownMenuContent>
  );
};

export default ReactModal;
