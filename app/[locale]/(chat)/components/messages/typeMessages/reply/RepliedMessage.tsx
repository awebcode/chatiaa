import { Button } from "@/components/ui/button";
import { IMessage } from "@/context/reducers/interfaces";
import { Tuser } from "@/store/types";
import Image from "next/image";
import React, { useState } from "react";
import { AiOutlineAudio } from "react-icons/ai";
import { CiImageOn } from "react-icons/ci";
import { FaFile, FaRegFilePdf } from "react-icons/fa";
import { MdAudioFile, MdOutlineCallEnd, MdOutlineOndemandVideo } from "react-icons/md";
import { RenderMessageWithEmojis } from "../../../logics/checkEmoji";
import { useMediaQuery } from "@uidotdev/usehooks";

const RepliedMessage = ({
  message,
  currentUser,
}: {
  message: IMessage;
  currentUser: Tuser;
}) => {
  const [showFullMessage, setShowFullMessage] = useState(false);
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  return (
    <div className=" w-full">
      {message && message.isReply ? (
        <>
          <div className="p-1  border-l-2 border-violet-600 rounded shadow-md cursor-pointer">
            {" "}
            <span className="text-blue-400 block text-xs md:text-sm">
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
                  ? RenderMessageWithEmojis(
                      message.isReply.messageId?.content,
                      isSmallDevice,
                      false
                    )
                  : RenderMessageWithEmojis(
                      message.isReply.messageId?.content?.slice(0, 65),
                      isSmallDevice,
                      false
                    ) + "..."}
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
            ) : message.isReply.messageId?.type === "call-notify" ? (
              message.isReply.messageId?.status === "removed" &&
              message.isReply.messageId.removedBy?._id === currentUser?._id ? (
                "Removed"
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-xs">replied a call</span>
                  <MdOutlineCallEnd className="text-rose-600" />
                </div>
              )
            ) : (
              ""
            )}
          </div>
          <span
            className={
              "break-all text-xs md:text-sm font-thin text-gray-700 dark:text-gray-200"
            }
          >
            {message.status === "removed" && message.removedBy?._id === currentUser?._id
              ? "Removed"
              : RenderMessageWithEmojis(message?.content, isSmallDevice, false)}
          </span>
        </>
      ) : (
        <span className={"break-all text-xs md:text-sm text-gray-600 dark:text-gray-200"}>
          {message?.status === "removed" &&
          message.removedBy?._id === currentUser?._id ? (
            "Removed"
          ) : showFullMessage || message?.content?.length <= 300 ? (
            <>
              {RenderMessageWithEmojis(message?.content, isSmallDevice, false)}{" "}
              {message?.content.length > 300 && (
                <span
                  className="ml-1 text-xs text-violet-400 cursor-pointer"
                  onClick={() => setShowFullMessage(false)}
                >
                  see less...
                </span>
              )}
            </>
          ) : (
            <>
              {RenderMessageWithEmojis(
                message?.content.slice(0, 300),
                isSmallDevice,
                false
              )}{" "}
              <span
                className="ml-1 text-xs text-blue-400 cursor-pointer"
                onClick={() => setShowFullMessage(true)}
              >
                see more...
              </span>
            </>
          )}
        </span>
      )}
    </div>
  );
};

export default RepliedMessage;
