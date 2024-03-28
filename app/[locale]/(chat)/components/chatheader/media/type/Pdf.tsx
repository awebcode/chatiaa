import { IMessage } from "@/context/reducers/interfaces";
import dynamic from "next/dynamic";
import Image from "next/image";
import React from "react";
import TooltipWrapper from "./TooltipWrapper";
import { RiDownloadCloudFill } from "react-icons/ri";
import { handleDownload } from "@/config/handleDownload";
import FullScreenPreview from "../FullScreen";
const Time = dynamic(() => import("../../../messages/typeMessages/Time"));

const Pdf = ({ message }: { message: IMessage }) => {
  const senderImage = message.sender?.image;

  return (
    <div className="relative inline-block">
      <div>
        <h1>Document file</h1>
      </div>
      <FullScreenPreview file={{ url: message?.file?.url, type: message.type }} />
      <RiDownloadCloudFill
        className="absolute bottom-1 right-1 text-xl cursor-pointer text-gray-300"
        onClick={() => handleDownload(message?.file?.url)}
      />
      <TooltipWrapper message={message} />
    </div>
  );
};

export default Pdf;
