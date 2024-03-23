import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { useSocketContext } from "@/context/SocketContextProvider";
import { IMessage } from "@/context/reducers/interfaces";

import useEditReplyStore from "@/store/useEditReply";
import React from "react";
import { unsent_remove_Message_function } from "./function";
import { toast } from "react-toastify";

const EditUnModal = ({
  message,
  openEdRemoveDialog,
}: {
  message: IMessage;
  openEdRemoveDialog: boolean;
}) => {
  const { socket } = useSocketContext();
  const { onEdit, cancelReply } = useEditReplyStore();
  const { user: currentUser, selectedChat } = useMessageState();
  const isCurrentUserMessage = message?.sender?._id === currentUser?._id;
  const dispatch = useMessageDispatch();
  //removeHandler
  const removeHandler = async (messageId: string) => {
    const data = {
      messageId,
      status: "removed",
      updatedBy: currentUser,
      groupChat: selectedChat?.isGroupChat,
      chatId: selectedChat?.chatId,
      receiverId: selectedChat?.userInfo?._id,
    };
    const res = await unsent_remove_Message_function(dispatch, socket, data);
    if (res.response.data.statusCode === 400) {
      toast.error(res.response.data.message);
    }
  };
  ///removeFromAllHandler
  const removeFromAllHandler = async (messageId: string) => {
    const data = {
      messageId,
      status: "removeFromAll",
      updatedBy: currentUser,
      groupChat: selectedChat?.isGroupChat,
      chatId: selectedChat?.chatId,
      receiverId: selectedChat?.userInfo?._id,
    };
    const res = await unsent_remove_Message_function(dispatch, socket, data);
    if (res.response?.status === 400 || res.response?.status === 500) {
      toast.error(res.response.data.message);
    }
  };
  //BackRemoveFromAllHandler
  const BackRemoveFromAllHandler = async (messageId: string) => {
    const data = {
      messageId,
      status: "reBack",
      updatedBy: currentUser,
      groupChat: selectedChat?.isGroupChat,
      chatId: selectedChat?.chatId,
      receiverId: selectedChat?.userInfo?._id,
    };
    const res = await unsent_remove_Message_function(dispatch, socket, data);
    if (res.response?.status === 400 || res.response?.status === 500) {
      toast.error(res.response.data.message);
    }
  };
  //unsentHandler
  const unsentHandler = async (messageId: string) => {
    const data = {
      messageId,
      status: "unsent",
      updatedBy: currentUser,
      groupChat: selectedChat?.isGroupChat,
      chatId: selectedChat?.chatId,
      receiverId: selectedChat?.userInfo?._id,
    };
    const res = await unsent_remove_Message_function(dispatch, socket, data);
    if (res.response?.status === 400 || res.response?.status === 500) {
      toast.error(res.response.data.message);
    }
  };
  return (
    <div>
      {" "}
      <div
        className={`absolute z-50 ${
          !isCurrentUserMessage
            ? "left-[0px] -top-24"
            : "right-0 -top-[148px]  md:-top-40"
        }   w-[140px]  bg-gray-200 dark:bg-gray-800  p-3 rounded-lg duration-300 transition-transform ${
          openEdRemoveDialog
            ? "translate-y-1 scale-100 opacity-100"
            : "translate-y-0 scale-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-1">
          {isCurrentUserMessage && (
            <a
              onClick={() => {
                onEdit(message as any);
                cancelReply();
              }}
              className="cursor-pointer text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
            >
              Edit
            </a>
          )}
          {message.status !== "removed" ? (
            <>
              {message.status !== "unsent" && (
                <a
                  onClick={() => removeHandler(message._id)}
                  className="cursor-pointer text-[10px] md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
                >
                  Remove
                </a>
              )}
              {message.status !== "unsent" ? (
                <a
                  onClick={() => removeFromAllHandler(message._id)}
                  className="cursor-pointer text-[10px] md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
                >
                  Remove from all
                </a>
              ) : (
                <a
                  onClick={() => removeFromAllHandler(message._id)}
                  className="cursor-pointer text-[10px] text-rose-500 tracking-wider md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
                >
                  Delete
                </a>
              )}
            </>
          ) : message.status === "removed" &&
            message.removedBy?._id === currentUser?._id ? (
            <a
              onClick={() => BackRemoveFromAllHandler(message._id)}
              className="cursor-pointer text-[10px] md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
            >
              Back Message
            </a>
          ) : message.status === "removed" &&
            message.removedBy?._id !== currentUser?._id ? (
            <>
              <a
                // onClick={() => removeHandler(message._id)}
                className=" text-[8px] md:text-[11px] text-rose-500 cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
              >
                {message.removedBy?.name.slice(0, 12)} Removed this
              </a>
              <a
                onClick={() => removeFromAllHandler(message._id)}
                className="cursor-pointer text-[10px] md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
              >
                Remove from all
              </a>
            </>
          ) : (
            ""
          )}

          {isCurrentUserMessage && message.status !== "unsent" && (
            <a
              onClick={() => {
                unsentHandler(message._id);
              }}
              className="cursor-pointer text-[10px] md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
            >
              Unsent
            </a>
          )}
        </ul>
      </div>
    </div>
  );
};

export default EditUnModal;
