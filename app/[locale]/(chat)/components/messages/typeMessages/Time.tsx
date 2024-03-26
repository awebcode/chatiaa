import { useMessageState } from "@/context/MessageContext";
import { IMessage } from "@/context/reducers/interfaces";
import moment from "moment";
import React from "react";

const Time = ({
  message,
  isCurrentUserMessage,
}: {
  message: IMessage;
  isCurrentUserMessage: boolean;
}) => {
  const { user: currentUser } = useMessageState();
  return (
    <div
      className={` ${
        isCurrentUserMessage ? "float-right mr-6 " : "ml-4 float-left"
      }   gap-1`}
    >
      <span className={"text-gray-400 dark:text-bubble-meta text-[11px] pt-1 min-w-fit"}>
        <p className="text-[10px] md:text-xs ">
          {message.isEdit ? (
            <span className="font-bold mr-1">Edited</span>
          ) : message.status === "unsent" ? (
            <span className="font-bold mr-1">UnsentAt</span>
          ) : message.status === "removed" &&
            message.removedBy?._id === currentUser?._id ? (
            <span className="font-bold mr-1">removedAt</span>
          ) : null}
          {moment(
            message.isEdit ||
              message.status === "unsent" ||
              (message.status === "removed" &&
                message.removedBy?._id === currentUser?._id)
              ? message.updatedAt
              : message.createdAt
          ).format("lll")}
        </p>
        {/* {calculateTime(message.createdAt)} */}
      </span>
      <span className={"text-gray-600 dark:text-bubble-meta"}></span>
    </div>
  );
};

export default Time;
