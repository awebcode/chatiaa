import React from "react";
import { FiFile } from "react-icons/fi"; // Assuming you have imported the File icon
import { IMessage } from "@/context/reducers/interfaces";
import { useMessageState } from "@/context/MessageContext";
import { calculateTime } from "@/functions/formatTime";
import { PiFilePdf } from "react-icons/pi";
import { FaDownload } from "react-icons/fa";
import dynamic from "next/dynamic";
const RREsystem = dynamic(() => import("../RRE/RREsystem"));
function PdfMessage({ message }: { message: IMessage }) {
  const { user: userInfo, selectedChat: currentChatUser } = useMessageState();

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
    <div className=" flex items-center gap-2">
      {/* Remove/Replay/Emoji */}
      <RREsystem message={message} />
      <div
        className={`p-1 rounded-lg ${
          message.sender._id === currentChatUser?.userInfo._id
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

          <div className={"absolute   bottom-1 right-1 flex  items-end gap-2"}>
            <span className={"text-bubble-meta text-[11px] pt-1 min-w-fit"}>
              {calculateTime(message.createdAt)}
            </span>
            <a href={message.file.url} download="document.pdf" onClick={handleDownload}>
              <FaDownload />
            </a>
            <span className={"text-bubble-meta"}></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PdfMessage;
