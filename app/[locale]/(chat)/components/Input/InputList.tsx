import dynamic from 'next/dynamic';
import React from 'react'
import { FaCamera, FaFileAlt } from 'react-icons/fa';
import { HiOutlineVideoCamera } from 'react-icons/hi2';
import { IoMdImages } from 'react-icons/io';
import { MdAudioFile } from 'react-icons/md';
const CaptureMedia = dynamic(() => import("./captureMedia/CaptureMedia"));

const InputList = ({
  handleFileChange,
}: {
  handleFileChange: any;
}) => {
  return (
    <div className="">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        id="imageInput"
        multiple
      />
      <input
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
        id="videoInput"
        multiple
      />
      <input
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileChange}
        id="audioInput"
        multiple
      />
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileChange}
        id="documentInput"
        multiple
      />

      <div className=" grid grid-cols-3  justify-around items-center mb-4 p-4 gap-5">
        <button
          className="flex flex-col items-center space-x-2 text-4xl text-green-400 focus:outline-none"
          onClick={() => document.getElementById("imageInput")?.click()}
        >
          <IoMdImages className=" cursor-pointer" />
          <span className="text-sm">Image</span>
        </button>
        <button
          className="flex flex-col items-center text-blue-600 text-4xl space-x-2 focus:outline-none"
          onClick={() => document.getElementById("videoInput")?.click()}
        >
          <HiOutlineVideoCamera className="  cursor-pointer" />{" "}
          <span className="text-sm">Video</span>
        </button>
        <button
          className="flex flex-col text-purple-600 text-4xl items-center space-x-2 focus:outline-none"
          onClick={() => document.getElementById("audioInput")?.click()}
        >
          <MdAudioFile className=" cursor-pointer" />
          <span className="text-sm"> Audio</span>
        </button>
        <button
          className="flex flex-col text-4xl text-yellow-400 items-center space-x-2 focus:outline-none"
          onClick={() => document.getElementById("documentInput")?.click()}
        >
          <FaFileAlt className="cursor-pointer" />{" "}
          <span className="text-sm">Document</span>
        </button>
        {/* Capture image/video from camera */}
        <CaptureMedia />
      </div>
    </div>
  );
};

export default InputList