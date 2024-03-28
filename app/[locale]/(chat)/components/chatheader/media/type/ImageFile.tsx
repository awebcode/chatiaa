import { IMessage } from "@/context/reducers/interfaces";
import Image from "next/image";
import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/navigation";
import TooltipWrapper from "./TooltipWrapper";
import { BsDownload } from "react-icons/bs";
import { handleDownload } from "@/config/handleDownload";
import { RiDownloadCloudFill } from "react-icons/ri";
import FullScreenPreview from "../FullScreen";
const ImageFile = ({ message }: { message: IMessage }) => {
  const senderImage = message.sender?.image;
  const Router = useRouter();
  return (
    <div className="relative inline-block h-32 w-32">
      <Image
        src={message.file.url}
        alt={"Image file"}
        className={"rounded-lg w-auto h-auto"}
        height={300}
        width={300}
        loading="lazy"
      />
      <FullScreenPreview file={{ url: message?.file?.url, type: message.type }} />
      <RiDownloadCloudFill
        className="absolute bottom-1 right-1 text-xl cursor-pointer text-gray-300"
        onClick={() => handleDownload(message?.file?.url)}
      />
      <TooltipWrapper message={message} />
    </div>
  );
};

export default ImageFile;
