import React, { useState, useEffect, useRef, useCallback } from "react";
import { CiMicrophoneOn } from "react-icons/ci";
import { MdSend } from "react-icons/md"; // Send icon
import dynamic from "next/dynamic";
import { TbClockEdit } from "react-icons/tb";
const CaptureAudio = dynamic(() => import("./AudioCapture"));
const ImageCapture = dynamic(() => import("./CaptureImage"));
// import CaptureAudio from "./AudioCapture";
// import ImageCapture from "./CaptureImage";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import useEditReplyStore from "@/store/useEditReply";
import { useClickAway } from "@uidotdev/usehooks";
import { useSocketContext } from "@/context/SocketContextProvider";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { editMessage, replyMessage } from "@/apisActions/messageActions";
import { ADD_REPLY_MESSAGE, SET_MESSAGES } from "@/context/reducers/actions";
import { v4 } from "uuid";
import { updateSenderMessagesUI } from "@/config/functions";
import { FaReply } from "react-icons/fa";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import { BsReply, BsSendCheck } from "react-icons/bs";

const EdRePreview = dynamic(() => import("./EdRepreview/EdRePreview"), { ssr: false });
const ChatBlockStatus = dynamic(() => import("../block/ChatBlockStatus"), { ssr: false });
const EmojiComponent = dynamic(() => import("./EmojiComponent"), { ssr: false });
type Temoji = {
  emoji: string;
  unified: string;
};
const Input = () => {
  const { socket } = useSocketContext();
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
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
      tempMessageId: v4(), ///for update sender ui instantly
    };
    dispatch({ type: SET_MESSAGES, payload: socketData });
    socket.emit("sentMessage", socketData);
    setMessage("");
    messageInputRef.current?.focus();
  }, [message, socket]);
  //editSubmitHandler
  const editSubmit = async () => {
    if (!selectedChat?.chatId && !isEdit) {
      return;
    }
    const tempMessageId = await updateSenderMessagesUI(
      currentUser,
      selectedChat,
      null,
      "text",
      dispatch,
      null,
      { ...isEdit, content: message } as any
    );

    const formData = new FormData();
    formData.append("tempMessageId", tempMessageId as string);
    formData.append("messageId", isEdit?._id as any);
    formData.append("content", message);
    formData.append("chatId", selectedChat?.chatId as any);
    formData.append("receiverId", selectedChat?.userInfo?._id as any);
    cancelEdit();
    setMessage("");
    messageInputRef.current?.focus();
    const res = await editMessage(formData);

    if (res.success) {
      cancelEdit();

      setMessage("");
      messageInputRef.current?.focus();
    }
  };
  //replySubmitHandler
  const replySubmit = async () => {
    if (!selectedChat?.chatId && !isReply) {
      return;
    }
    const tempMessageId = v4();
    const dispatchData = {
      senderId: currentUser?._id,
      receiverId: selectedChat?.userInfo._id,
      chatId: selectedChat?.chatId,
      content: message,
      type: "text",
      image: currentUser?.image,
      isGroupChat: selectedChat?.isGroupChat,
      groupChatId: selectedChat?.isGroupChat ? selectedChat.chatId : null,
      sender: currentUser,
      isReply: { ...isReply, repliedBy: currentUser, messageId: isReply },
      // chat:selectedChat,
      tempMessageId, ///for update sender ui instantly
    };
    dispatch({ type: ADD_REPLY_MESSAGE, payload: dispatchData });
    const formData = new FormData();
    formData.append("tempMessageId", tempMessageId as string);
    formData.append("messageId", isReply?._id as string);
    formData.append("content", message);
    formData.append("chatId", selectedChat?.chatId as string);
    formData.append("receiverId", selectedChat?.userInfo?._id as string);

    cancelReply();
    setMessage("");
    messageInputRef.current?.focus();
    const res = await replyMessage(formData);
    if (res.success) {
      cancelReply();
      setMessage("");
      messageInputRef.current?.focus();
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
      <>
        <EdRePreview setMessage={setMessage} />{" "}
        <div className="w-full bg-gray-100 h-full dark:bg-gray-800 rounded px-2 p-1 md:p-2 flex items-center justify-center">
          <CaptureAudio hide={setAudioRecorder} />
        </div>
      </>
    );
  }
  if (selectedChat?.chatBlockedBy && selectedChat?.chatBlockedBy?.length > 0) {
    return <ChatBlockStatus chatBlockedBy={selectedChat?.chatBlockedBy} />;
  }
  return (
    <div className="w-full  bg-gray-100 rounded dark:bg-gray-800 z-50">
      {/* edit replay preview */}
      <EdRePreview setMessage={setMessage} />
      <div className="flex items-center rounded-lg px-3">
        <div className="p-1" ref={clickOutsideEmojiRef}>
          <div className="cursor-pointer" onClick={() => setOpenEmoji(!openEmoji)}>
            {" "}
            <Emoji
              size={20}
              lazyLoad
              emojiStyle={EmojiStyle.FACEBOOK}
              unified={"1f642"}
            />{" "}
          </div>

          {/* Emoji icon */}
          <EmojiComponent onEmojiClick={onEmojiClick} openEmoji={openEmoji} />
        </div>
        {/* image Capture */}
        <ImageCapture />
        <div className="flex-grow px-2">
          <textarea
            ref={messageInputRef}
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
              <BsReply
                className="text-blue-600 cursor-pointer"
                size={20}
                onClick={() => replySubmit()}
              />
            ) : isEdit ? (
              <BsSendCheck
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
          <div className="animate-pulse p-1 md:p-2 bg-emerald-500 text-white rounded-full">
            {/* Right side audio recorder icon */}
            <CiMicrophoneOn
              onClick={() => setAudioRecorder(true)}
              className=" text-sm md:text-lg cursor-pointer h-full w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;
