"use client"
import React from "react";
import ReactPlayer from "react-player";
import { FaExpand } from "react-icons/fa";
import { RiDownloadCloudFill } from "react-icons/ri";
import { handleDownload } from "@/config/handleDownload";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import dynamic from "next/dynamic";
import LoaderComponent from "@/components/Loader";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// Dynamically import PDFViewer component
const PDFViewer = dynamic(() => import("../../Input/PdfViewer"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});

// Dynamically import AudioFile component
const AudioFile = dynamic(() => import("./type/Audio"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});

// Now you can use PDFViewer and AudioFile components in your code.

const FilePreview = ({ fileUrl, fileType }: { fileUrl: string; fileType: string }) => {
  if (fileType.startsWith("image")) {
    return (
      <Image
        src={fileUrl}
        alt="Image"
        height={500}
        width={500}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  } else if (fileType.startsWith("video")) {
    return (
      <ReactPlayer
        url={fileUrl}
        autoPlay
        loop
        className="h-full w-full object-cover"
        controls
      />
    );
  } else if (fileType.startsWith("application")) {
    return <PDFViewer file={fileUrl} />;
  } else if (fileType.startsWith("audio")) {
    return (
      <AudioFile
        message={{ file: { url: fileUrl as any, public_id: "" } } as any}
        onPreview={true}
        // Add any additional props you need for audio player customization
      />
    );
  } else {
    return (
      <a href={fileUrl} download>
        Download {fileType}
      </a>
    );
  }
};

const FullScreenPreview = ({ file }: { file: { url: string; type: string } }) => {
  return (
    <Dialog>
      <DialogTrigger>
        {" "}
        <Button id="fullScreenDialogOpenId" variant={"secondary"} size={"icon"} className="absolute left-0 -top-3 z-50 mb-2">
          <FaExpand />
        </Button>
      </DialogTrigger>
      <DialogContent className="z-50 h-full w-full  bg-opacity-85 ">
        <div className="rounded-2xl p-2 max-h-[72vh] max-w-sm md:w-screen">
          {" "}
          <FilePreview fileUrl={file.url} fileType={file.type} />
        </div>
        <DialogFooter className="">
          <Button
            size={"sm"}
            className="cursor-pointer bg-blue-500 hover:bg-blue-700"
            onClick={() => {document.getElementById("fullScreenDialogCloseId")?.click();}}
          >
            Close
          </Button>
          <Button
            size={"sm"}
            className=" cursor-pointer mt-1"
            onClick={() => handleDownload(file.url)}
          >
            <RiDownloadCloudFill /> Download File
          </Button>
        </DialogFooter>
        <DialogClose id="fullScreenDialogCloseId"></DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenPreview;
