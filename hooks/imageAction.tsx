import { useImagePreviewStore } from "@/store/usePreview";
import { useClickAway } from "@uidotdev/usehooks";
import { randomUUID } from "crypto";
import Image from "next/image";
import React, { useState } from "react";

// Custom Hook for handling download and full-screen preview
export const UseImageActions = () => {
  const { openPreview, closePreview, imageUrl, isPreviewOpen } = useImagePreviewStore();
  const clickOutsideRef: any = useClickAway(() => {
    closePreview();
  });
  const handleDownload: any = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "Messengaria-" + Math.floor(Math.random() * 100000);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const handlePreviewToggle = (url: string) => {
      openPreview(url);
      console.log("clicked")
  };

  const PreviewModal = () => {
    return (
      <div
        ref={clickOutsideRef}
        className={` flexCenter z-50 fixed top-0 bottom-0 left-0 right-0 overflow-auto bg-gray-100 dark:bg-black  w-screen  min-h-screen max-h-screen md:min-h-screen  md:max-h-screen   bg-opacity-80  duration-500  ${
          isPreviewOpen ? "block" : "hidden"
        }`}
      >
        <div className="container flexCenter mx-auto relative w-full ">
          <Image
            src={imageUrl}
            alt="Download"
            className="rounded-lg object-contain w-full h-full"
            height={1000}
            width={1000}
            layout="fixed"
            loading="lazy"
          />
          <div className="absolute right-0 bottom-0 flex items-center  justify-end gap-2 mt-4">
            <button onClick={handleDownload} className="btn bg-green-400">
              Download
            </button>
            <button onClick={closePreview} className="btn bg-rose-400">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { handleDownload, handlePreviewToggle, PreviewModal, isPreviewOpen };
};
