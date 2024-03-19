import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import React, { useState } from 'react'
import Webcam from 'react-webcam';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { formatTime } from '@/functions/formatTime';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { VideoIcon } from '@radix-ui/react-icons';
import { useMessageState } from '@/context/MessageContext';
import { sentMessage } from '@/functions/messageActions';
const VideoFiles = ({
  webcamRef,
  recordedChunks,
  startVideoRecording,
  isRecording,
  recordingTime,
  clearCapturedVideo,
  stopVideoRecording,
  videoPlaybackTime,
  handleVideoPlaybackTimeUpdate,
  removeVideoFile,
}: {
  webcamRef: any;
  recordedChunks: any;
  startVideoRecording: any;
  isRecording: any;
  recordingTime: any;
  clearCapturedVideo: any;
  stopVideoRecording: any;
  videoPlaybackTime: any;
  handleVideoPlaybackTimeUpdate:any;
  removeVideoFile:any;
  }) => {
  const { user: currentUser, messages, selectedChat } = useMessageState();
  const [loading, setloading] = useState<boolean>(false);
  const sentFileMessage = async () => {
    try {
      if (recordedChunks.length <= 0) return;

      setloading(true);
      const formData = new FormData();
      recordedChunks.forEach((file: any) => {
        formData.append("files", file);
      });
      formData.append("content", "");
      formData.append("type", "file");
      formData.append("chatId", selectedChat?.chatId as any);
      formData.append("receiverId", selectedChat?.userInfo?._id as any);
      const res = await sentMessage(formData);
      if (res.status === 200) {
        document.getElementById("closeFileDialog")?.click();
         document.getElementById("cameraDialog")?.click();
        clearCapturedVideo();
        setloading(false);
      }
    } catch (error) {
      setloading(false);
    } finally {
      setloading(false);
      document.getElementById("closeFileDialog")?.click();
       document.getElementById("cameraDialog")?.click();
      clearCapturedVideo();
    }
    // socket.emit("sentMessage", socketData);
  };
  return (
    <div>
      {" "}
      <TabsContent value="video">
        <Webcam audio={true} ref={webcamRef} className="w-full h-auto object-cover" />
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600"
            onClick={startVideoRecording}
          >
            {isRecording ? (
              <span className="animate-pulse">
                Recording.. {formatTime(recordingTime)}
              </span>
            ) : (
              <span className=" flex items-center gap-1">
                <VideoIcon /> Capture Video
              </span>
            )}
          </Button>
          {isRecording && (
            <Button
              className="bg-rose-600 hover:bg-rose-500"
              onClick={stopVideoRecording}
            >
              Stop Recording
            </Button>
          )}
          {recordedChunks && recordedChunks.length > 0 && (
            <Button
              className="bg-rose-600 hover:bg-rose-500"
              onClick={clearCapturedVideo}
            >
              Clear all
            </Button>
          )}
          <Button
            disabled={loading || recordedChunks.length <= 0}
            className="bg-blue-500 hover:bg-blue-700 duration-300"
            onClick={sentFileMessage}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="w-6 h-6 border-l-transparent border-t-2 border-yellow-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              "Sent Videos"
            )}
          </Button>
        </div>
        {recordedChunks && recordedChunks.length > 0 && (
          <Carousel
            opts={{
              align: "center",
            }}
            className={`w-full max-w-sm ${
              recordedChunks?.length <= 0 ? "hidden" : "block"
            }`}
          >
            <CarouselContent>
              {recordedChunks?.map((file: any, index: number) => (
                <CarouselItem
                  key={index}
                  className={`relative basis-1/2 flex items-center    border border-blue-500
            }`}
                >
                  {/* URL.createObjectURL(file) */}
                  <video
                    className="h-[150px] w-[150px]"
                    autoPlay
                    controls
                    onTimeUpdate={handleVideoPlaybackTimeUpdate}
                  >
                    <source src={URL.createObjectURL(file)} type="video/webm" />
                  </video>
                  <div className="absolute bottom-2 right-2 text-white text-sm bg-black bg-opacity-50 px-1 rounded">
                    {formatTime(videoPlaybackTime)}
                  </div>
                  <button
                    className="absolute right-1 top-1   bg-gray-100 rounded  focus:outline-none"
                    onClick={() => removeVideoFile(file)}
                  >
                    <IoMdCloseCircleOutline className="text-rose-400 text-xl " />
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              className={`${recordedChunks?.length <= 2 ? "hidden" : "block"}`}
            />
            <CarouselNext
              className={`${recordedChunks?.length <= 2 ? "hidden" : "block"}`}
            />
          </Carousel>
        )}
      </TabsContent>
    </div>
  );
};

export default VideoFiles