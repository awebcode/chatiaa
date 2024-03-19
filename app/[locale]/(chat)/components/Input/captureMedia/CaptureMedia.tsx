import React, { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FaCamera} from "react-icons/fa";
import { Tabs,  TabsList, TabsTrigger } from "@/components/ui/tabs";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { CameraIcon, VideoIcon } from "@radix-ui/react-icons";

const ImageFiles = dynamic(() => import("./ImageFiles"));
const VideoFiles = dynamic(() => import("./VideoFiles"));

const CaptureMedia = () => {
  const webcamRef = useRef<any>(null);
  const [capturedImage, setCapturedImage] = useState<any>([]);
  const [isRecording, setIsRecording] = useState(false);

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File(
          [blob],
          `messengaria_cameraPhoto_photo_${
            Date.now() + Math.floor(Math.random() * 10000)
          }.jpg`,
          {
            type: "image/jpeg",
          }
        );
        setCapturedImage((prev: any) => [file, ...prev]);
      });
  };
  //download image
  const handleDownloadImage = (file: File) => {
    const blob = new Blob([file], {
      type: "image/png",
    });
    const url = URL.createObjectURL(blob);
    const a: any = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = `messengaria_download_${Date.now() + Math.floor(Math.random() * 10000)}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  const mediaRecorderRef = useRef<MediaRecorder | null | any>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState<any>(0);
    const [videoPlaybackTime, setVideoPlaybackTime] = useState<any>(0);
  // video recording start
  const startVideoRecording = useCallback(() => {
    setIsRecording(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener("dataavailable", handleDataAvailable);
    mediaRecorderRef.current.start();
  }, [webcamRef, setIsRecording, mediaRecorderRef]);

  const stopVideoRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current.stop();
    setRecordingTime(0);
  };

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev: any) => {
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isRecording]);

  const handleDataAvailable = useCallback(
    ({ data }: { data: Blob }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => [data, ...prev]);
      }
    },
    [setRecordedChunks]
  );

  //clear all files
  const clearCapturedPhoto = () => {
    setCapturedImage([]);
  };
  const clearCapturedVideo = () => {
    setRecordedChunks([]);
  };
  //clear single files
  const removeImageFile = (file: any) => {
    setCapturedImage(capturedImage.filter((image: any) => image !== file));
  };
  const removeVideoFile = (file: any) => {
    setRecordedChunks(recordedChunks.filter((video: any) => video !== file));
  };

   const handleVideoPlaybackTimeUpdate = (event: any) => {
     const currentTime = event.target.currentTime;
     setVideoPlaybackTime(currentTime);
   };
  return (
    <Dialog>
      <DialogTrigger>
        <button className="flex flex-col text-4xl text-emerald-400 items-center space-x-2 focus:outline-none">
          <FaCamera className="cursor-pointer" /> <span className="text-sm">Camera</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <Tabs defaultValue="photo" className="max-w-[400px]">
          <TabsList className="w-full">
            <TabsTrigger value="photo">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600">
                <CameraIcon /> Photo
              </Button>
            </TabsTrigger>
            <TabsTrigger value="video">
              {" "}
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                <VideoIcon /> Video
              </Button>
            </TabsTrigger>
          </TabsList>
          {/* image flies */}
          <ImageFiles
            webcamRef={webcamRef}
            capturedImage={capturedImage}
            removeImageFile={removeImageFile}
            handleDownloadImage={handleDownloadImage}
            capturePhoto={capturePhoto}
            clearCapturedPhoto={clearCapturedPhoto}
          />

          {/* videoFiles */}
          <VideoFiles
            webcamRef={webcamRef}
            recordedChunks={recordedChunks}
            startVideoRecording={startVideoRecording}
            isRecording={isRecording}
            recordingTime={recordingTime}
            clearCapturedVideo={clearCapturedVideo}
            stopVideoRecording={stopVideoRecording}
            videoPlaybackTime={videoPlaybackTime}
            handleVideoPlaybackTimeUpdate={handleVideoPlaybackTimeUpdate}
            removeVideoFile={removeVideoFile}
          />
        </Tabs>
        <DialogClose id="cameraDialog" className="hidden"></DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default CaptureMedia;
