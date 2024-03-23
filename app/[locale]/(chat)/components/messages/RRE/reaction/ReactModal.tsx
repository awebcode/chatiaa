import { IMessage } from "@/context/reducers/interfaces";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import React, { useState } from "react";
const EmojiModal = dynamic(() => import("./EmojiModal"));
import { MdAdd } from "react-icons/md";
import { useClickAway, useMediaQuery } from "@uidotdev/usehooks";
import dynamic from "next/dynamic";
import { useMessageState } from "@/context/MessageContext";
import { addRemoveEmojiReactions } from "@/functions/messageActions";
import { toast } from "react-toastify";
import { EmojiBottomSheet } from "./SheetBottomEmoji";

const ReactModal = ({
  message,
  setIsOpenReactModal,
  isOpenReactModal,
  isCurrentUserMessage
}: {
  isOpenReactModal: boolean;
  setIsOpenReactModal: any;
    message: IMessage;
  isCurrentUserMessage:boolean
}) => {
  //emoji
  const { selectedChat } = useMessageState();
  const [isOpenEmojiModal, setIsOpenEmojiModal] = useState(false);
  const clickOutsideEmojiModal: any = useClickAway(() => {
    setIsOpenEmojiModal(false);
  });
  const onEmojiClick = async (
    e: { emoji: string; unified: string },
    messageId: string
  ) => {
    const data = {
      emoji: e.emoji,
      messageId,
      chatId: selectedChat?.chatId,
      receiverId: selectedChat?.userInfo?._id,
      type: "add",
    };
    const res = await addRemoveEmojiReactions(data);
    if (res.success) {
    }
  };
 const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  return (
    <div
      className={`absolute  z-50  -top-[80px] ${
        isCurrentUserMessage
          ? `${
              isSmallDevice?"-left-10":""} -top-[32px] md:-top-[70px] md:-left-44  items-center justify-center`
          : `${
              isSmallDevice ? `-right-6 flex-row` : `-left-0 flex-row-reverse`
            }   -top-[32px] md:-top-[80px]`
      }  p-2 flex md:p-4 rounded-xl bg-gray-800  max-w-[40rem] transition-transform   duration-500  ${
        isOpenReactModal
          ? "translate-y-1 scale-100 opacity-100"
          : "translate-y-0 scale-0 opacity-0"
      }`}
    >
      {["🙂", "😢", "🥰", "😠", "😜"].map((v, i: number) => {
        return (
          <div key={i} className=" flex items-center">
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
                size={20}
                lazyLoad
                emojiStyle={EmojiStyle.APPLE}
                unified={(v as any)?.codePointAt(0).toString(16)}
              />{" "}
            </span>
          </div>
        );
      })}
      <span ref={clickOutsideEmojiModal} className=" rounded-full  relative ">
        <MdAdd
          onClick={() => setIsOpenEmojiModal((prev: boolean) => !prev)}
          className={`hidden md:flex text-gray-300 h-5 w-5 md:h-6 md:w-6 mr-1 cursor-pointer `}
        />
        <EmojiBottomSheet
          onEmojiClick={onEmojiClick}
          openEmoji={isOpenEmojiModal}
          setIsOpenReactModal={setIsOpenReactModal}
          message={message}
        />
        <EmojiModal
          onEmojiClick={onEmojiClick}
          openEmoji={isOpenEmojiModal}
          setIsOpenEmojiModal={setIsOpenEmojiModal}
          setIsOpenReactModal={setIsOpenReactModal}
          message={message}
          isCurrentUserMessage={isCurrentUserMessage}
        />
      </span>
    </div>
  );
};

export default ReactModal;
