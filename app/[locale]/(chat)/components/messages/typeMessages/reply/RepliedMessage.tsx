import { IMessage } from "@/context/reducers/interfaces";
import { Tuser } from "@/store/types";
import Image from "next/image";
import React from "react";
import { AiOutlineAudio } from "react-icons/ai";
import { CiImageOn } from "react-icons/ci";
import { FaFile, FaRegFilePdf } from "react-icons/fa";
import { MdAudioFile, MdOutlineOndemandVideo } from "react-icons/md";

const RepliedMessage = ({
  message,
  currentUser,
}: {
  message: IMessage;
  currentUser: Tuser;
}) => {
  return (
    <div>
      {message && message.isReply ? (
        <>
          <div className="p-1  border-l-2 border-violet-600 rounded shadow-md cursor-pointer">
            {" "}
            <span className="text-blue-400 block text-sm">
              {" "}
              {message.isReply.repliedBy?._id === currentUser?._id
                ? "You"
                : message.isReply.repliedBy?.name}
            </span>
            {message.isReply.messageId?.type === "text" &&
            message.isReply.messageId?.status === "removed" &&
            message.isReply.messageId.removedBy?._id === currentUser?._id ? (
              "Removed"
            ) : message.isReply.messageId?.content ? (
              <span
                className={
                  "break-all text-xs font-thin text-gray-700 dark:text-gray-200 "
                }
              >
                {message.isReply.messageId.content?.length < 65
                  ? message.isReply.messageId?.content
                  : message.isReply.messageId?.content.slice(0, 65) + "..."}
              </span>
            ) : message.isReply.messageId?.type === "image" ? (
              message.isReply.messageId?.status === "removed" &&
              message.isReply.messageId?.removedBy?._id === currentUser?._id ? (
                "Removed"
              ) : (
                <div className="flex justify-between gap-2 items-center">
                  <span className="text-xs">
                    <CiImageOn className="text-green-500 mx-1 inline h-6 w-6" /> replied a
                    image
                  </span>
                  <div className="h-10 w-10 ">
                    <Image
                      src={message.isReply.messageId.file?.url}
                      height={1000}
                      width={1000}
                      alt="image"
                      className="h-full w-full object-cover rounded"
                      loading="lazy"
                    />
                  </div>
                </div>
              )
            ) : message.isReply.messageId?.type === "audio" ? (
              message.isReply.messageId?.status === "removed" &&
              message.isReply.messageId.removedBy?._id === currentUser?._id ? (
                "Removed"
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-xs">
                    <AiOutlineAudio className="text-blue-500 mx-1 inline h-4 w-4" />{" "}
                    replied an audio
                  </span>
                </div>
              )
            ) : message.isReply.messageId?.type === "video" ? (
              message.isReply.messageId?.status === "removed" &&
              message.isReply.messageId.removedBy?._id === currentUser?._id ? (
                "Removed"
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-xs">
                    <MdOutlineOndemandVideo className="text-orange-500 mx-1 inline h-4 w-4" />{" "}
                    replied a video
                  </span>
                </div>
              )
            ) : message.isReply.messageId?.type === "application" ? (
              message.isReply.messageId?.status === "removed" &&
              message.isReply.messageId.removedBy?._id === currentUser?._id ? (
                "Removed"
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-xs">
                    <FaRegFilePdf className="text-violet-500 mx-1 inline h-4 w-4" />{" "}
                    replied a pdf file
                  </span>
                </div>
              )
            ) : (
              ""
            )}
          </div>
          <span
            className={"break-all text-sm font-thin text-gray-700 dark:text-gray-200"}
          >
            {message.status === "removed" && message.removedBy?._id === currentUser?._id
              ? "Removed"
              : message.content}
          </span>
        </>
      ) : (
        <span
          className={"break-all text-sm font-medium text-gray-700 dark:text-gray-200"}
        >
          {message?.status === "removed" && message.removedBy?._id === currentUser?._id
            ? "Removed"
            : message.content}
        </span>
      )}
    </div>
  );
};

export default RepliedMessage;
