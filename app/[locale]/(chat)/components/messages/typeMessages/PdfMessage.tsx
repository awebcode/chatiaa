import React from "react";
import { FiFile } from "react-icons/fi"; // Assuming you have imported the File icon
import { IMessage } from "@/context/reducers/interfaces";
import { useMessageState } from "@/context/MessageContext";
import { calculateTime } from "@/functions/formatTime";
import { PiFilePdf } from "react-icons/pi";
import { FaDownload } from "react-icons/fa";
import dynamic from "next/dynamic";
import Time from "./Time";
const RREsystem = dynamic(() => import("../RRE/RREsystem"));
const Status = dynamic(() => import("./Status"));
const DisplayReaction = dynamic(() => import("./reactions/DisplayReaction"));

// Import RepliedMessage dynamically
const RepliedMessage = dynamic(() => import("./reply/RepliedMessage"));
function PdfMessage({
  message,
  isLastSeenMessage,
  isUserOnline,
  isCurrentUserMessage,
}: {
  message: IMessage;
  isLastSeenMessage: boolean;
  isUserOnline: boolean;
  isCurrentUserMessage: boolean;
}) {
  const { selectedChat: currentChatUser, user: currentUser } = useMessageState();

  // Function to handle download action
  const handleDownload = () => {
    // Assuming the PDF URL is stored in the message object
    const pdfUrl = message.file.url;
    // Create an anchor element with the download attribute
    const anchor = document.createElement("a");
    anchor.href = pdfUrl;
    anchor.download = `messengaria_image` + Math.random() * 1000 + "document.pdf"; // Set a default filename
    anchor.click(); // Simulate a click to trigger download
  };

  return (
    <div className="flex items-center gap-2 max-w-sm md:max-w-2xl">
      {/* Remove/Replay/Emoji */}
      <RREsystem message={message} isCurrentUserMessage={isCurrentUserMessage} />
      <div className="">
        <Time message={message} isCurrentUserMessage={isCurrentUserMessage} />
        <div
          className={`m-4 p-1 rounded-lg ${
            message?.sender?._id === currentChatUser?.userInfo?._id
              ? "bg-incoming-background"
              : "bg-outgoing-background"
          }`}
        >
          <div className={"relative"}>
            <div className="h-20 w-40">
              {" "}
              <span className="flex">
                <PiFilePdf className={"rounded-lg text-2xl w-auto h-auto"} />
                Pdf File
              </span>
            </div>
            {/* Reply */}
            <RepliedMessage message={message} currentUser={currentUser as any} />
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
            <Status
              isCurrentUserMessage={isCurrentUserMessage}
              message={message}
              isLastSeenMessage={isLastSeenMessage}
              isUserOnline={isUserOnline}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PdfMessage;
