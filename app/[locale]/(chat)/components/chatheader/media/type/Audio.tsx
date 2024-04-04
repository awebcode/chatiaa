import { IMessage } from "@/context/reducers/interfaces";
import { calculateTime, formatTime } from "@/functions/formatTime";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaPlay, FaStop } from "react-icons/fa";
import WaveSurfer from "wavesurfer.js";
import dynamic from "next/dynamic";
import TooltipWrapper from "./TooltipWrapper";
import { handleDownload } from "@/config/handleDownload";
import { RiDownloadCloudFill } from "react-icons/ri";
import FullScreenPreview from "../FullScreen";
const Time = dynamic(() => import("../../../messages/typeMessages/Time"));
// Import RepliedMessage dynamically
// styles

const formWaveSurferOptions = (ref: any) => ({
  container: ref,
  waveColor: "#7ae3c3",
  progressColor: "#4a9eff",
  cursorColor: "#ddd",
  barWidth: 4,
  barRadius: 3,
  height: 50,
  responsive: true,
  normalize: true,
  partialRender: true,
});

export default function AudioFile({
  message,
  onPreview,
}: {
  message: IMessage;
  onPreview: boolean;
}) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [totalTime, setTotalTime] = useState("00:00");
  //   const url = `${HOST}/${message.message}`;

  useEffect(() => {
    // Create WaveSurfer instance when the component mounts
    wavesurfer.current = WaveSurfer.create(formWaveSurferOptions(waveformRef.current));
    wavesurfer.current.load(message.file.url);

    // Set up event listeners
    wavesurfer.current.on("play", () => setPlaying(true));
    wavesurfer.current.on("pause", () => setPlaying(false));
    wavesurfer.current.on("audioprocess", () => {
      setCurrentTime(formatTime(wavesurfer?.current?.getCurrentTime()));
    });
    wavesurfer.current.on("ready", () => {
      setTotalTime(formatTime(wavesurfer?.current?.getDuration()));
    });

    // Cleanup: Destroy WaveSurfer instance when the component unmounts
    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [message.file.url]); // Ensure useEffect runs when url changes

  const handlePlayAudio = () => {
    // Placeholder for play audio logic
    if (wavesurfer.current) {
      wavesurfer.current.play();
    }
  };

  const handlePauseAudio = () => {
    // Placeholder for pause audio logic
    if (wavesurfer.current) {
      wavesurfer.current.pause();
    }
  };

  return (
    <div className="relative flex items-center gap-2 ">
      {/* Remove/Replay/Emoji */}
      <TooltipWrapper message={message} />
      {/* <FullScreenPreview file={{ url: message?.file?.url, type: message.type }} /> */}
      <RiDownloadCloudFill
        className="absolute bottom-1 right-1 text-xl cursor-pointer text-gray-300"
        onClick={() => handleDownload(message?.file?.url)}
      />
      <div className="">
        <Time message={message} isCurrentUserMessage={true} />
        <div
          className={`md:m-4 flex items-center gap-5 text-white px4 pr-2 py-4 text-sm rounded-md`}
        >
          <div className={"cursor-pointer text-xl"}>
            {!playing ? (
              <FaPlay onClick={handlePlayAudio} />
            ) : (
              <FaStop onClick={handlePauseAudio} />
            )}
          </div>
          <div className={"relative "}>
            <div className={`${onPreview ? "w-80" : "w-16"}`} ref={waveformRef}></div>
            <div
              className={
                "text-bubble-meta text-[11px] pt-1 flex justify-between absolute bottom-[-22px] w-full"
              }
            >
              <span className="text-sm font-medium">
                {playing ? currentTime : totalTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
