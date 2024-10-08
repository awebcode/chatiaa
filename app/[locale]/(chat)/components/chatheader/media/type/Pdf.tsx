import { IMessage } from "@/context/reducers/interfaces";
import dynamic from "next/dynamic";
import Image from "next/image";
import React from "react";
import TooltipWrapper from "./TooltipWrapper";
import { RiDownloadCloudFill } from "react-icons/ri";
import { handleDownload } from "@/config/handleDownload";
import FullScreenPreview from "../FullScreen";
import LoaderComponent from "@/components/Loader";
import { ensureHttps } from "@/config/httpsParser";
const Time = dynamic(() => import("../../../messages/typeMessages/Time"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});

const Pdf = ({ message }: { message: IMessage }) => {
  const senderImage = message.sender?.image;

  return (
    <div className="relative inline-block">
      <div>
        <h1>Document file</h1>
      </div>
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

export default Pdf;
