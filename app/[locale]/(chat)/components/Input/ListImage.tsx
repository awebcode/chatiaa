import * as React from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { IoMdCloseCircleOutline } from "react-icons/io";
import Image from "next/image";
import PDFViewer from "./PdfViewer";
import ReactPlayer from "react-player";
export default function ImageList({
  files, activeFile,
  removeFile,
  setActive,
}: {
  files: any;
  activeFile: any;
  setActiveFile: any;
  removeFile: any;
  setActive: any;
}) {
  return (
    <Carousel
      opts={{
        align: "center",
      }}
      className={`w-full max-w-sm ${files?.length <= 0 ? "hidden" : "block"}`}
    >
      <CarouselContent>
        {files.map((file: any, index: number) => (
          <CarouselItem
            key={index}
            className={`relative basis-1/2 flex items-center   cursor-pointer ${
              activeFile === file && "border border-blue-500"
            }`}
            onClick={() => setActive(file)}
          >
            {file.type.startsWith("image/") ? (
              <div>
                <Image
                  height={150}
                  width={180}
                  src={URL.createObjectURL(file)}
                  alt="image"
                  className="h-full w-full object-cover rounded"
                />
              </div>
            ) : file.type === "application/pdf" ? (
              <div className="relative">
                <PDFViewer file={file} />
              </div>
            ) : file.type === "audio/" ? (
              <div className="">
                <ReactPlayer url={URL.createObjectURL(file)} />
              </div>
            ) : (
              <div>
                <video controls className="h-36 w-36 object-cover rounded">
                  <source src={URL.createObjectURL(file)} type={file.type} />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            <button
              className="absolute right-1 top-1   bg-gray-100 rounded  focus:outline-none"
              onClick={() => removeFile(file)}
            >
              <IoMdCloseCircleOutline className="text-rose-400 text-xl " />
            </button>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className={`${files?.length <= 2 ? "hidden" : "block"}`} />
      <CarouselNext className={`${files?.length <= 2 ? "hidden" : "block"}`} />
    </Carousel>
  );
}
