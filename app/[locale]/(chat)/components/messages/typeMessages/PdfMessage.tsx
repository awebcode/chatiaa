import React from "react";
import { FiFile } from "react-icons/fi"; // Assuming you have imported the File icon
import { IMessage } from "@/context/reducers/interfaces";
import { useMessageState } from "@/context/MessageContext";
import { calculateTime } from "@/apisActions/formatTime";
import { PiFilePdf } from "react-icons/pi";
import { FaDownload } from "react-icons/fa";
import dynamic from "next/dynamic";
import Time from "./Time";
import { RiDownloadCloudFill } from "react-icons/ri";
import { handleDownload } from "@/config/handleDownload";
import LoaderComponent from "@/components/Loader";
import { ensureHttps } from "@/config/httpsParser";
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
function PdfMessage({
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
              ? "bg-gray-200 text-gray-900 dark:text-gray-200 dark:bg-incoming-background rounded-bl-3xl"
              : "dark:bg-outgoing-background rounded-br-3xl bg-gray-300"
          }`}
        >
          <div className={"relative"}>
            {/* reply */}
            <div className="pt-6">
              <RepliedMessage message={message} currentUser={currentUser as any} />
            </div>
            <div className="h-20 w-40">
              {" "}
              <span className="flex">
                <PiFilePdf className={"rounded-lg text-2xl w-auto h-auto"} />
                Pdf File
              </span>
              <FullScreenPreview
                file={{ url: ensureHttps(message.file.url), type: message.type }}
              />
              <RiDownloadCloudFill
                className="absolute bottom-1 right-1 text-sm md:text-lg cursor-pointer text-gray-300"
                onClick={() => handleDownload(ensureHttps(message.file.url))}
              />
            </div>

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
  );
}

export default PdfMessage;
