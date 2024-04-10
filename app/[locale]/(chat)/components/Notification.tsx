import { Button } from "@/components/ui/button";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { useSocketContext } from "@/context/SocketContextProvider";
import { ADD_REPLY_MESSAGE, SET_MESSAGES } from "@/context/reducers/actions";
import { replyMessage } from "@/functions/messageActions";
import { useNotificationStore } from "@/store/notificationStore";
import React, { useCallback, useEffect, useState } from "react";
import { BiLoaderCircle } from "react-icons/bi";
import { IoCloseCircle } from "react-icons/io5";
import { v4 } from "uuid";

const Notification: React.FC = () => {
  const { notification, removeNotification } = useNotificationStore();
  const { user: currentUser } = useMessageState();
  const dispatch = useMessageDispatch();
  const [message, setMessage] = useState("");
  const { socket } = useSocketContext();
  const [replying, setReplying] = useState(false); // State to track if user is replying
  const [loading, setLoading] = useState(false);
  const [showFullMessage, setShowFullMessage] = useState(false); // State to track if full message content should be displayed
  const handleClose = () => {
    removeNotification();
  };

  const handleReply = () => {
    setReplying(true); // Set replying state to true when reply button is clicked
  };

  const cancelReply = () => {
    handleClose();
    setReplying(false); // Set replying state to true when reply button is clicked
  };
  const sentMessage = useCallback(async () => {
    setLoading(true);
    const tempMessageId = v4();
    const replyData = {
      senderId: currentUser?._id,
      receiverId: notification?.message?.sender._id,
      chatId: notification?.message?.chat?._id,
      content: message,
      type: "text",
      image: currentUser?.image,
      isGroupChat: notification?.message?.chat?.isGroupChat,
      groupChatId: notification?.message?.chat?.isGroupChat
        ? notification?.message?.chat?._id
        : null,
      sender: currentUser,
      isReply: {
        ...notification?.message,
        repliedBy: currentUser,
        messageId: notification?.message,
      },
      tempMessageId, ///for update sender ui instantly
    };
    dispatch({ type: ADD_REPLY_MESSAGE, payload: replyData });
    const formData = new FormData();
    formData.append("tempMessageId", tempMessageId as string);
    formData.append("messageId", notification?.message?._id as string);
    formData.append("content", message);
    formData.append("chatId", notification?.message?.chat?._id as string);
    formData.append("receiverId", notification?.message?.sender?._id as string);

    setMessage("");

    await replyMessage(formData);
    setLoading(false);
    setReplying(false); // Set replying state back to false after sending the message
    handleClose();
  }, [message, socket]);

  useEffect(() => {
    if (!replying && !showFullMessage) {
      const timeoutId = setTimeout(() => {
        handleClose();
        setLoading(false);
      }, 7000);
      return () => clearTimeout(timeoutId);
    }
  }, [replying, showFullMessage]);

  return notification ? (
    <div className="fixed top-0  w-full  flex justify-center z-50">
      <div className="relative bg-emerald-100 text-black dark:bg-gray-800 dark:text-gray-200  min-w-[350px] max-w-[400px] md:max-w-lg  py-3 px-4 rounded-md shadow-lg mt-10">
        <Button
          variant={"outline"}
          size="icon"
          className="absolute right-1 top-2 bg-transparent float-right"
          onClick={handleClose}
        >
          <IoCloseCircle className="text-black dark:text-gray-300 w-5 h-5 cursor-pointer" />
        </Button>
        <div className="flex items-center gap-2 justify-between">
          <div className="flex gap-2 items-center">
            <img
              className="w-8 h-8 md:w-10 md:h-10 rounded-full mr-2"
              src={notification?.message?.sender?.image}
              alt={notification?.message?.sender?.name}
            />
            <div>
              <div className="text-sm font-semibold">
                {notification?.message?.sender?.name}
              </div>
              <div className="text-xs">{notification?.message?.sender?.email}</div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs md:text-sm font-semibold">
          {showFullMessage || notification?.message?.content?.length <= 100 ? (
            notification?.message?.type !== "text" ? (
              `${notification?.message?.sender.name} sent a 📂 file `
            ) : (
              <>
                {notification?.message?.content}
                {notification?.message?.content.length > 100 && (
                  <Button
                    size={"sm"}
                    className={`ml-1`}
                    onClick={() => setShowFullMessage(false)}
                  >
                    see less...
                  </Button>
                )}
              </>
            )
          ) : (
            <>
              {notification?.message?.content.slice(0, 100)}{" "}
              <Button
                size={"sm"}
                className="ml-1"
                onClick={() => setShowFullMessage(true)}
              >
                See more...
              </Button>
            </>
          )}
        </div>
        {replying ? ( // Render input box and reply button only if user is replying
          <div className="mt-2 flex flex-col gap-1 items-start">
            <div className="w-full flex items-center gap-2">
              <input
                type="text"
                className="border-1 border-gray-200 rounded-md p-2 mr-2 w-full "
                placeholder="Reply..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button disabled={loading || !message} onClick={sentMessage}>
                {loading ? (
                  <div className="flex gap-x-1 text-xs md:text-sm">
                    <BiLoaderCircle className="animate-spin h-4 w-4 text-blue-500 rounded-full relative" />
                    Sending...
                  </div>
                ) : (
                  "Send"
                )}
              </Button>
            </div>
            <Button onClick={cancelReply} size="sm" variant="destructive">
              Cancel
            </Button>
          </div>
        ) : null}
        {!replying && !showFullMessage && (
          <div className="text-xs text-gray-400 mt-2">
            This notification will close in 7 seconds
          </div>
        )}

        <Button className="float-right mx-2" onClick={handleReply}>
          Reply
        </Button>
      </div>
    </div>
  ) : null;
};

export default Notification;
