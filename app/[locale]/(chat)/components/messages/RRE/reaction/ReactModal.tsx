import { IMessage } from "@/context/reducers/interfaces";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import React, { useState } from "react";
const EmojiModal = dynamic(() => import("./EmojiModal"));
import { MdAdd } from "react-icons/md";
import { useClickAway } from "@uidotdev/usehooks";
import dynamic from "next/dynamic";
import { useMessageState } from "@/context/MessageContext";
import { addRemoveEmojiReactions } from "@/functions/messageActions";
import { toast } from "react-toastify";

const ReactModal = ({
  message,
  setIsOpenReactModal,
  isOpenReactModal,
}: {
  isOpenReactModal: boolean;
  setIsOpenReactModal: any;
  message: IMessage;
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

  return (
    <div
      className={`absolute  z-50  -top-[80px] -left-10 md:-left-52 p-2 flex md:p-4 rounded-xl bg-gray-800  max-w-[40rem] transition-transform   duration-500  ${
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
      <span
        ref={clickOutsideEmojiModal}
        className="p-2 rounded-full bg-gray-700 relative"
      >
        <MdAdd
          onClick={() => setIsOpenEmojiModal((prev: boolean) => !prev)}
          className={`text-gray-300 h-5 w-5 md:h-6 md:w-6 mr-1 cursor-pointer `}
        />
        <EmojiModal
          onEmojiClick={onEmojiClick}
          openEmoji={isOpenEmojiModal}
          setIsOpenEmojiModal={setIsOpenEmojiModal}
          setIsOpenReactModal={setIsOpenReactModal}
          message={message}
        />
      </span>
    </div>
  );
};

export default ReactModal;
