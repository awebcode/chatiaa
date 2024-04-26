import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { useSocketContext } from "@/context/SocketContextProvider";
import { IMessage } from "@/context/reducers/interfaces";

import useEditReplyStore from "@/store/useEditReply";
import React, { useCallback } from "react";
import { unsent_remove_Message_function } from "./function";
import { toast } from "react-hot-toast";
import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { AiOutlineCopy, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import { FcDataRecovery } from "react-icons/fc";
import { GiCrossedSabres } from "react-icons/gi";
const EditUnModal = ({ message }: { message: IMessage }) => {
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
    if (res.response?.data?.statusCode === 400) {
      toast.error(res.response?.data?.message);
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
    if (res.response?.data?.statusCode === 400) {
      toast.error(res.response?.data?.message);
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
    if (res.response?.data?.statusCode === 400) {
      toast.error(res.response?.data?.message);
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
    if (res.response?.data?.statusCode === 400) {
      toast.error(res.response?.data?.message);
    }
  };
  //coping
  const onCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success("Text copied to clipboard", {
          position: "top-left",
        });
      },
      (err) => {
        toast.error("Could not copy text");
      }
    );
  }, []);
  return (
    <DropdownMenuContent>
      {message.type === "text" && (
        <DropdownMenuItem
          onClick={() => {
            onCopy(message.content);
          }}
          className="flex gap-x-1 cursor-pointer text-[10px] md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
        >
          <AiOutlineCopy /> Copy
        </DropdownMenuItem>
      )}

      {isCurrentUserMessage && (
        <DropdownMenuItem
          onClick={() => {
            onEdit(message as any);
            cancelReply();
          }}
          className="flex gap-x-1 cursor-pointer text-[10px] md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
        >
          <AiOutlineEdit />
          Edit
        </DropdownMenuItem>
      )}
      {message.status !== "removed" ? (
        <>
          {message.status !== "unsent" && (
            <DropdownMenuItem
              onClick={() => removeHandler(message._id)}
              className="flex gap-x-1 cursor-pointer text-[10px] md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
            >
              <IoIosRemoveCircleOutline /> Remove
            </DropdownMenuItem>
          )}
          {message.status !== "unsent" ? (
            <DropdownMenuItem
              onClick={() => removeFromAllHandler(message._id)}
              className="flex gap-x-1 cursor-pointer text-[10px] md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
            >
              <AiOutlineDelete /> Remove from all
            </DropdownMenuItem>
          ) : (
            <>
              {/* <DropdownMenuItem
          onClick={() => removeFromAllHandler(message._id)}
          className="cursor-pointer text-[10px] text-rose-500 tracking-wider md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
        >
          Delete
        </DropdownMenuItem> */}
            </>
          )}
        </>
      ) : message.status === "removed" && message.removedBy?._id === currentUser?._id ? (
        <DropdownMenuItem
          onClick={() => BackRemoveFromAllHandler(message._id)}
          className="flex gap-x-1 cursor-pointer text-[10px] md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
        >
          <FcDataRecovery /> Back Message
        </DropdownMenuItem>
      ) : message.status === "removed" && message.removedBy?._id !== currentUser?._id ? (
        <>
          <DropdownMenuItem
            // onClick={() => removeHandler(message._id)}
            className=" text-[8px] md:text-[11px] text-rose-500 cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
          >
            {message.removedBy?.name.slice(0, 12)} Removed this
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => removeFromAllHandler(message._id)}
            className="flex gap-x-1 cursor-pointer text-[10px] md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
          >
            <AiOutlineDelete /> Remove from all
          </DropdownMenuItem>
        </>
      ) : (
        ""
      )}

      {isCurrentUserMessage && message.status !== "unsent" && (
        <DropdownMenuItem
          onClick={() => {
            unsentHandler(message._id);
          }}
          className="flex gap-x-1 cursor-pointer text-[10px] md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
        >
          <GiCrossedSabres /> Unsent
        </DropdownMenuItem>
      )}
      {isCurrentUserMessage && (
        <DropdownMenuItem
          onClick={() => removeFromAllHandler(message._id)}
          className="flex gap-x-1 cursor-pointer text-[10px] text-rose-500 tracking-wider md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
        >
          <AiOutlineDelete /> Delete
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  );
};

export default EditUnModal;
