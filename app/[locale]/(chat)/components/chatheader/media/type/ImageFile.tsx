import { IMessage } from "@/context/reducers/interfaces";
import Image from "next/image";
import React from "react";

import TooltipWrapper from "./TooltipWrapper";
import { handleDownload } from "@/config/handleDownload";
import { RiDownloadCloudFill } from "react-icons/ri";
import FullScreenPreview from "../FullScreen";
import LoaderComponent from "@/components/Loader";
import dynamic from "next/dynamic";
import { ensureHttps } from "@/config/httpsParser";
const Time = dynamic(() => import("../../../messages/typeMessages/Time"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});
const ImageFile = ({ message }: { message: IMessage }) => {
  return (
    <div className="relative inline-block h-32 w-32">
      <Image
        src={ensureHttps(message?.file?.url)}
        alt={"Image file"}
        className={"rounded-lg w-auto h-auto"}
        height={300}
        width={300}
        loading="lazy"
      />
      <FullScreenPreview
        file={{ url: ensureHttps(message?.file?.url), type: message.type }}
      />
      <RiDownloadCloudFill
        className="absolute bottom-1 right-1 text-xl cursor-pointer text-gray-300"
        onClick={() => handleDownload(ensureHttps(message?.file?.url))}
      />
      <Time message={message} isCurrentUserMessage={true} />
      <TooltipWrapper message={message} />
    </div>
  );
};

export default ImageFile;
