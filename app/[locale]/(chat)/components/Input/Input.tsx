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
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { useQueryClient } from "@tanstack/react-query";
import TypingIndicator from "../TypingIndicator";
import { editMessage, replyMessage } from "@/functions/messageActions";
import { SET_MESSAGES } from "@/context/reducers/actions";
import { v4 } from "uuid";

const EdRePreview = dynamic(() => import("./EdRepreview/EdRePreview"));
const ChatBlockStatus = dynamic(() => import("../block/ChatBlockStatus"));
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
  // const { isTyping, content: typingContent, chatId: typingChatId } = useTypingStore();
  const { cancelEdit, cancelReply, isEdit, isReply } = useEditReplyStore();
  const [openEmoji, setOpenEmoji] = useState(false);
  // Function to handle emoji click
  const clickOutsideEmojiRef: any = useClickAway(() => setOpenEmoji(false));
  const dispatch = useMessageDispatch();
  const onEmojiClick = (e: Temoji) => {
    // Render the Emoji component and get its value

    // Append the value of the Emoji component to the message
    setMessage((prev) => prev + e.emoji);
  };
  // typing

  // Function to render the Emoji component and get its value

  const timerRef = useRef<any | null>(null);
  useEffect(() => {
    if (message.trim() !== "") {
      socket.emit("startTyping", {
        content: message,
        chatId: selectedChat?.chatId,
        senderId: currentUser?._id,
        userInfo: currentUser,
        receiverId: selectedChat?.userInfo._id,
        isGroupChat: selectedChat?.isGroupChat,
        groupChatId: selectedChat?.isGroupChat ? selectedChat.chatId : null,
      });
    } else {
      if (message.trim() === "") {
        socket.emit("stopTyping", {
          content: message,
          chatId: selectedChat?.chatId,
          senderId: currentUser?._id,
          userInfo: currentUser,
          receiverId: selectedChat?.userInfo._id,
          isGroupChat: selectedChat?.isGroupChat,
          groupChatId: selectedChat?.isGroupChat ? selectedChat.chatId : null,
        });
      }
    }

    const timerLength = 2500;

    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set a new timer
    timerRef.current = setTimeout(() => {
      // Check if the user is still typing after the delay
      if (message.trim() !== "") {
        socket.emit("stopTyping", {
          content: message,
          chatId: selectedChat?.chatId,
          senderId: currentUser?._id,
          receiverId: selectedChat?.userInfo._id,
          userInfo: currentUser,
          isGroupChat: selectedChat?.isGroupChat,
          groupChatId: selectedChat?.isGroupChat ? selectedChat.chatId : null,
        });
      }
    }, timerLength);

    return () => {
      // Clear the timer on component unmount or when the dependency changes
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [message, currentUser, selectedChat, socket]);
  //sent message handler
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
      sender: currentUser,
      // chat:selectedChat,
      tempMessageId:v4() ///for update sender ui instantly 
    };
    dispatch({ type: SET_MESSAGES, payload: socketData });
    socket.emit("sentMessage", socketData);
    setMessage("");
  }, [message, socket]);
  //editSubmitHandler
  const editSubmit = async () => {
    if (!selectedChat?.chatId && !isEdit) {
      return;
    }
    const formData = new FormData();
    formData.append("messageId", isEdit?._id as any);
    formData.append("content", message);
    formData.append("chatId", selectedChat?.chatId as any);
    formData.append("receiverId", selectedChat?.userInfo?._id as any);
    const res = await editMessage(formData);
    if (res.success) {
      cancelEdit();
      setMessage("");
    }
  };
  //replySubmitHandler
  const replySubmit = async () => {
    if (!selectedChat?.chatId && !isReply) {
      return;
    }
    const formData = new FormData();
    formData.append("messageId", isReply?._id as any);
    formData.append("content", message);
    formData.append("chatId", selectedChat?.chatId as any);
    formData.append("receiverId", selectedChat?.userInfo?._id as any);
    const res = await replyMessage(formData);
    if (res.success) {
      cancelReply();
      setMessage("");
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent | any) => {
      if (e.key === "Enter" && !isEdit && !isReply) {
        sentMessage();
      } else if (e.key === "Enter" && isEdit) {
        editSubmit();
      } else if (e.key === "Enter" && isReply) {
        replySubmit();
      }
    },
    [sentMessage]
  );
  //clear set message
  useEffect(() => {
    if (isEdit && isEdit.content) {
      setMessage(isEdit.content);
    }
  }, [isEdit]);
  useEffect(() => {
    if (isReply && message.trim() !== "") {
      setMessage("");
    }
  }, [isReply]);
  if (audioRecorder) {
    return (
      <div className="w-full bg-gray-100 h-12 dark:bg-gray-800 rounded p-2 flex items-center justify-center">
        <CaptureAudio hide={setAudioRecorder} />
      </div>
    );
  }
  if (selectedChat?.chatBlockedBy && selectedChat?.chatBlockedBy?.length > 0) {
    return <ChatBlockStatus chatBlockedBy={selectedChat?.chatBlockedBy} />;
  }
  return (
    <div className="w-full bg-gray-100 rounded dark:bg-gray-800 z-50">
      {/* edit replay preview */}
      <EdRePreview setMessage={setMessage} />
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
            {isReply ? (
              <MdSend
                className="text-blue-600 cursor-pointer"
                size={20}
                onClick={() => replySubmit()}
              />
            ) : isEdit ? (
              <MdSend
                className="text-blue-600 cursor-pointer"
                size={20}
                onClick={() => editSubmit()}
              />
            ) : (
              <MdSend
                className="text-blue-600 cursor-pointer"
                size={20}
                onClick={() => sentMessage()}
              />
            )}
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
