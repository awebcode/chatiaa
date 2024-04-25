import { IMessage } from "@/context/reducers/interfaces";
import React from "react";

import dynamic from "next/dynamic";
import LoaderComponent from "@/components/Loader";

const FullScreenPreview = dynamic(() => import("../FullScreen"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});

const TooltipWrapper = dynamic(() => import("./TooltipWrapper"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});
const Time = dynamic(() => import("../../../messages/typeMessages/Time"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});
import { handleDownload } from "@/config/handleDownload";
import { RiDownloadCloudFill } from "react-icons/ri";
import { ensureHttps } from "@/config/httpsParser";
const VideoFile = ({ message }: { message: IMessage }) => {
  return (
    <div className="relative inline-block h-36 w-36">
      <video
        src={ensureHttps(message?.file?.url)}
        controls
        className={"rounded-lg w-full h-full"}
      />
      <FullScreenPreview
        file={{ url: ensureHttps(message?.file?.url), type: message.type }}
      />
      <RiDownloadCloudFill
        className="absolute bottom-1 right-1 text-sm md:text-lg cursor-pointer text-gray-300"
        onClick={() => handleDownload(ensureHttps(message?.file?.url))}
      />
      <Time message={message} isCurrentUserMessage={true} />
      <TooltipWrapper message={message} />
    </div>
  );
};

export default VideoFile;
