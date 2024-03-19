import React, { useState, useEffect, useRef, useCallback } from "react";
import { CiMicrophoneOn } from "react-icons/ci";
import { AiOutlineSmile } from "react-icons/ai"; // Emoji icon
import { MdSend } from "react-icons/md"; // Send icon
import dynamic from "next/dynamic";

const CaptureAudio = dynamic(() => import("./AudioCapture"));
const ImageCapture = dynamic(() => import("./CaptureImage"));

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { useTypingStore } from "@/store/useTyping";
import useEditReplyStore from "@/store/useEditReply";
import { useClickAway } from "@uidotdev/usehooks";
import { useSocketContext } from "@/context/SocketContextProvider";
import { useMessageState } from "@/context/MessageContext";
import { useQueryClient } from "@tanstack/react-query";
const EmojiComponent = dynamic(() => import("./EmojiComponent"));
type Temoji = {
  emoji: string;
  unified: string;
};
const Input = () => {
  const { socket } = useSocketContext();
  
  const { user: currentUser, messages, selectedChat } = useMessageState();
  const [audioRecorder, setAudioRecorder] = useState(false);
  const [message, setMessage] = useState("");
  const { isTyping, content: typingContent, chatId: typingChatId } = useTypingStore();
  const { cancelEdit, cancelReply, isEdit, isReply } = useEditReplyStore();
  const [openEmoji, setOpenEmoji] = useState(false);
  // Function to handle emoji click
  const clickOutsideEmojiRef: any = useClickAway(() => setOpenEmoji(false));
  const onEmojiClick = (e: Temoji) => {
    // Render the Emoji component and get its value

    // Append the value of the Emoji component to the message
    setMessage((prev) => prev + e.emoji);
  };
  //sent message
  const sentMessage = useCallback(() => {
    const socketData = {
      senderId: currentUser?._id,
      receiverId: selectedChat?.userInfo._id,
      chatId: selectedChat?.chatId,
      content: message,
      type: "text",
      image: currentUser?.image,
      isGroupChat: selectedChat?.isGroupChat,
      groupChatId: selectedChat?.isGroupChat ? selectedChat.chatId : null,
    };
    socket.emit("sentMessage", socketData);
    setMessage("")
  }, [message, socket]);
  const handleKeyDown = useCallback(
    (e: KeyboardEvent | any) => {
      if (e.key === "Enter") {
        sentMessage();
      }
    },
    [sentMessage]
  );
  if (audioRecorder) {
    return (
      <div className="w-full bg-gray-100 h-12 dark:bg-gray-800 rounded p-2 flex items-center justify-center">
        <CaptureAudio hide={setAudioRecorder} />
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 rounded dark:bg-gray-800">
      <div className="flex items-center rounded-lg p-2">
        <div className="p-1" ref={clickOutsideEmojiRef}>
          <AiOutlineSmile
            onClick={() => setOpenEmoji(!openEmoji)}
            className="text-orange-600 text-xl cursor-pointer"
          />{" "}
          {/* Emoji icon */}
          <EmojiComponent onEmojiClick={onEmojiClick} openEmoji={openEmoji} />
        </div>
        {/* image Capture */}
        <ImageCapture />
        <div className="flex-grow px-2">
          <textarea
            onKeyDown={handleKeyDown}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full  h-10 text-xs md:text-sm p-[2px] rounded-md dark:text-gray-400  bg-transparent  resize-none focus:outline-none"
            placeholder="Type a message..."
          />
        </div>

        {message.trim() !== "" ? (
          <div className="p-1">
            {/* Right side icon */}
            <MdSend
              className="text-blue-600 cursor-pointer"
              size={20}
              onClick={() => sentMessage()}
            />
          </div>
        ) : (
          <div className="p-1">
            {/* Right side audio recorder icon */}
            <CiMicrophoneOn
              onClick={() => setAudioRecorder(true)}
              className=" text-xl cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;
