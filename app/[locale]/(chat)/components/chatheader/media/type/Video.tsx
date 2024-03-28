import { IMessage } from "@/context/reducers/interfaces";
import React from "react";

import TooltipWrapper from "./TooltipWrapper";
import { handleDownload } from "@/config/handleDownload";
import { RiDownloadCloudFill } from "react-icons/ri";
import FullScreenPreview from "../FullScreen";
const VideoFile = ({ message }: { message: IMessage }) => {
  return (
    <div className="relative inline-block h-36 w-36">
      <video src={message.file.url} controls className={"rounded-lg w-full h-full"} />
      <FullScreenPreview file={{ url: message?.file?.url, type: message.type }} />
      <RiDownloadCloudFill
        className="absolute bottom-1 right-1 text-xl cursor-pointer text-gray-300"
        onClick={() => handleDownload(message?.file?.url)}
      />
      <TooltipWrapper message={message} />
    </div>
  );
};

export default VideoFile;
