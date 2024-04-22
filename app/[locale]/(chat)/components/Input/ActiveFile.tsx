import Image from "next/image";
import React from "react";
import PDFViewer from "./PdfViewer";
import ReactPlayer from "react-player";
import { IoMdCloseCircleOutline } from "react-icons/io";

const ActiveFile = ({ activeFile, removeFile }: { activeFile: any; removeFile: any }) => {
  return (
    <div>
      {activeFile && (
        <div className="mt-4 relative">
          {activeFile.type.startsWith("image/") ? (
            <div className="relative ">
              <Image
                height={300}
                width={400}
                src={URL.createObjectURL(activeFile)}
                alt=""
                className="w-full h-full object-cover rounded"
                loading="lazy"
              />
            </div>
          ) : activeFile.type === "application/pdf" ? (
            <div className="relative">
              <PDFViewer file={activeFile} />
            </div>
          ) : activeFile.type === "audio/pdf" ? (
            <div className="relative">
              <ReactPlayer src={activeFile} />
            </div>
          ) : (
            <div className="relative">
              <video controls className="w-full max-h-[200px]">
                <source src={URL.createObjectURL(activeFile)} type={activeFile.type} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          <button
            className="absolute right-1 top-1   bg-gray-100 rounded  focus:outline-none"
            onClick={() => removeFile(activeFile)}
          >
            <IoMdCloseCircleOutline className="text-rose-400 text-xl " />
          </button>
        </div>
      )}
    </div>
  );
};

export default ActiveFile;
