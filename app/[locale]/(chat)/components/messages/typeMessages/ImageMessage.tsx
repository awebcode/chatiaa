import React from "react";
import Image from "next/image";
import { IMessage } from "@/context/reducers/interfaces";
import { useMessageState } from "@/context/MessageContext";
import dynamic from "next/dynamic";
import Time from "./Time";
import { handleDownload } from "@/config/handleDownload";
import { RiDownloadCloudFill } from "react-icons/ri";
import LoaderComponent from "@/components/Loader";
const FullScreenPreview = dynamic(() => import("../../chatheader/media/FullScreen"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});
const SeenBy = dynamic(() => import("./seenby/SeenBy"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});
const DisplayReaction = dynamic(() => import("./reactions/DisplayReaction"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});

// Import RepliedMessage dynamically
const RepliedMessage = dynamic(() => import("./reply/RepliedMessage"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});

const RREsystem = dynamic(() => import("../RRE/RREsystem"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});
const Status = dynamic(() => import("./Status"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});
function ImageMessage({
  message,
  isCurrentUserMessage,
}: {
  message: IMessage;
  isCurrentUserMessage: boolean;
}) {
  const { selectedChat: currentChatUser, user: currentUser } = useMessageState();
  return (
    <div className="flex items-center gap-2 max-w-sm md:max-w-2xl">
      {/* Remove/Replay/Emoji */}
      <RREsystem message={message} isCurrentUserMessage={isCurrentUserMessage} />
      <div className="">
        <Time message={message} isCurrentUserMessage={isCurrentUserMessage} />
        <div
          className={`m-4 p-1 rounded-lg ${
            message?.sender?._id === currentChatUser?.userInfo?._id
              ? "bg-gray-200 text-gray-900 dark:text-gray-200 dark:bg-incoming-background rounded-tr-xl"
              : "dark:bg-outgoing-background rounded-br-xl bg-gray-300"
          }`}
        >
          <div className={""}>
            <div className={"relative"}>
              {/* Reply */}
              <div className="pt-5">
                <RepliedMessage message={message} currentUser={currentUser as any} />
              </div>
              <div className="w-[160px] h-40 md:w-[208px] md:h-52">
                <Image
                  src={`${message.file.url}`}
                  alt={"Unknown file"}
                  className={"rounded-lg w-full h-full "}
                  height={300}
                  width={300}
                  loading="lazy"
                />
              </div>
              <FullScreenPreview file={{ url: message?.file?.url, type: message.type }} />
              <RiDownloadCloudFill
                className="absolute bottom-1 right-1 text-xl cursor-pointer text-gray-300"
                onClick={() => handleDownload(message?.file?.url)}
              />

              {/* REACTIONS */}
              {message.reactions?.length > 0 && (
                <DisplayReaction
                  message={message}
                  reactions={message.reactions}
                  isCurrentUserMessage={isCurrentUserMessage}
                  reactionsGroup={message.reactionsGroup}
                />
              )}
              {/* message status */}
              <Status isCurrentUserMessage={isCurrentUserMessage} message={message} />
              {/* Seen by lists */}
              {message?.seenBy?.length > 0 && (
                <SeenBy message={message} currentUser={currentUser as any} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageMessage;
