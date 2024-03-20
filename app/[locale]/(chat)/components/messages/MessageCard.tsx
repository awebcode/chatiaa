import { useMessageState } from "@/context/MessageContext";
import { IMessage } from "@/context/reducers/interfaces";
import Image from "next/image";
import React from "react";
import { RenderStatus } from "../logics/RenderStatusComponent";
import dynamic from "next/dynamic";


const TextMessage = dynamic(() => import("./typeMessages/TextMessage"));
const ImageMessage = dynamic(() => import("./typeMessages/ImageMessage"));
const VoiceMessage = dynamic(() => import("./typeMessages/VoiceMessage"));
const PdfMessage = dynamic(() => import("./typeMessages/PdfMessage"));
const VideoMessage = dynamic(() => import("./typeMessages/VideoMessage"));

const MessageCard = ({
  message,
  isLastSeenMessage,
}: {
  message: IMessage;
  isLastSeenMessage: boolean;
}) => {
  const { user: currentUser } = useMessageState();
  const isUserOnline = true;
  const isCurrentUserMessage = message?.sender?._id === currentUser?._id;

  return (
    <div
      className={`flex ${
        isCurrentUserMessage ? "justify-end " : "justify-start"
      } mb-4 py-10`}
    >
      <div
        className={`flex items-center ${
          isCurrentUserMessage ? "flex-row-reverse" : "flex-row"
        } space-x-2`}
      >
        {message?.sender?._id === currentUser?._id ? (
          // Assuming RenderStatus is a function
          RenderStatus(message, "onMessage", 0, currentUser, isLastSeenMessage)
        ) : (
          <div className="h-8 w-8 relative">
            {/* Assuming Image is a component */}
            <Image
              height={35}
              width={35}
              className="rounded-full h-full w-full object-cover"
              alt={message?.sender?.name}
              src={message?.sender?.image}
            />
            )
            <span
              className={`absolute bottom-0 right-0 rounded-full p-[4px] ${
                isUserOnline ? "bg-green-500" : "bg-rose-500"
              }`}
            ></span>
          </div>
        )}
        {/* Content Here */}
        {message.type === "text" && <TextMessage message={message} />}
        {message.type === "video" && <VideoMessage message={message} />}
        {message.type === "audio" && <VoiceMessage message={message} />}
        {message.type === "image" && <ImageMessage message={message} />}
        {message.type === "application" && <PdfMessage message={message} />}
      </div>
    </div>
  );
};

export default MessageCard;
