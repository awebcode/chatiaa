import { IMessage } from "@/context/reducers/interfaces";
import dynamic from "next/dynamic";
import Image from "next/image";
import React from "react";
const Time = dynamic(() => import("../../messages/typeMessages/Time"));
const ImageFile = ({ message }: { message: IMessage }) => {
  const senderImage = message.sender?.image;

  return (
    <div className="relative inline-block">
      <Image
        src={message.file.url}
        alt={"Image file"}
        className={"rounded-lg w-auto h-auto"}
        height={300}
        width={300}
        loading="lazy"
      />
      {senderImage && (
        <Image
          src={senderImage}
          alt="Sender Image"
          height={40}
          width={40}
          loading="lazy"
          className="absolute top-2 right-2 w-10 h-10 rounded-full border-2 border-white"
        />
      )}
    </div>
  );
};

export default ImageFile;
