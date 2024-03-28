import React, { useState } from "react";
import ReactPlayer from "react-player";
import { FaExpand } from "react-icons/fa";
import { RiDownloadCloudFill } from "react-icons/ri";
import { handleDownload } from "@/config/handleDownload";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import dynamic from "next/dynamic";

// Dynamically import PDFViewer component
const PDFViewer = dynamic(() => import("../../Input/PdfViewer"));

// Dynamically import AudioFile component
const AudioFile = dynamic(() => import("./type/Audio"));

// Now you can use PDFViewer and AudioFile components in your code.

const FilePreview = ({ fileUrl, fileType }: { fileUrl: string; fileType: string }) => {
  if (fileType.startsWith("image")) {
    return (
      <Image
        loading="lazy"
        src={fileUrl}
        alt="Image"
        height={600}
        width={600}
        className="max-h-screen  object-cover"
      />
    );
  } else if (fileType.startsWith("video")) {
    return (
      <ReactPlayer url={fileUrl} autoPlay loop height={"100vh"} width="100vh" controls />
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsFullscreen(true)}
        className="fullscreen-button absolute -top-1 -left-0 p-[6px] bg-gray-800 text-white  rounded-full"
      >
        <FaExpand />
      </button>
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-85   flex items-center justify-center overflow-y-auto">
          <div className="max-w-full max-h-full overflow-y-auto">
            <div
              className="close-button absolute top-2 right-4 p-1  text-white text-3xl cursor-pointer"
              onClick={() => setIsFullscreen(false)}
            >
              &times;
            </div>
            <div className="flex gap-2 items-center absolute bottom-0 md:bottom-4 right-4">
              <Button
                size={"lg"}
                className="cursor-pointer bg-blue-500 hover:bg-blue-700"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                Close
              </Button>
              <Button
                size={"lg"}
                className=" cursor-pointer"
                onClick={() => handleDownload(file.url)}
              >
                <RiDownloadCloudFill /> Download File
              </Button>
            </div>
            <FilePreview fileUrl={file.url} fileType={file.type} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FullScreenPreview;
