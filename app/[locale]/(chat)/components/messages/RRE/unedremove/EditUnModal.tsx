import { useMessageState } from "@/context/MessageContext";
import { IMessage } from "@/context/reducers/interfaces";
import useEditReplyStore from "@/store/useEditReply";
import React from "react";

const EditUnModal = ({
  message,
  openEdRemoveDialog,
}: {
  message: IMessage;
  openEdRemoveDialog:boolean;
}) => {
  const { onEdit, cancelReply } = useEditReplyStore();
  const { user: currentUser } = useMessageState();
  const isCurrentUserMessage = message?.sender?._id === currentUser?._id;
  const removeHandler = (messageId: string) => {};
  const removeFromAllHandler = (messageId: string) => {};
  const BackRemoveFromAllHandler = (messageId: string) => {};
  const unsentHandler = (messageId: string) => {};
  return (
    <div>
      {" "}
      <div
        className={`absolute ${
          !isCurrentUserMessage ? "left-[0px] -top-24" : "-left-[150px] -top-36"
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
              className=" text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
            >
              Edit
            </a>
          )}
          {message.status !== "remove" && message.removedBy?._id !== currentUser?._id ? (
            <>
              <a
                onClick={() => removeHandler(message._id)}
                className=" text-[10px] md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
              >
                Remove
              </a>
              <a
                onClick={() => removeFromAllHandler(message._id)}
                className="text-[10px] md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
              >
                Remove from all
              </a>
            </>
          ) : message.status === "remove" &&
            message.removedBy?._id === currentUser?._id ? (
            <a
              onClick={() => BackRemoveFromAllHandler(message._id)}
              className="text-[10px] md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
            >
              Back Message
            </a>
          ) : message.status === "remove" &&
            message.removedBy?._id !== currentUser?._id ? (
            <>
              <a
                // onClick={() => removeHandler(message._id)}
                className=" text-[8px] md:text-[10px] text-rose-500 cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
              >
                {message.removedBy?.name} Removed this
              </a>
              <a
                onClick={() => removeFromAllHandler(message._id)}
                className="text-[10px] md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
              >
                Remove from all
              </a>
            </>
          ) : (
            ""
          )}

          {isCurrentUserMessage && (
            <a
              onClick={() => unsentHandler(message._id)}
              className=" text-[10px] md:text-xs hover:bg-gray-300 dark:hover:bg-gray-600  p-[6px] duration-300  rounded"
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
