import { IMessage } from "@/context/reducers/interfaces";
import { calculateTime, formatTime } from "@/apisActions/formatTime";
import { useEffect, useRef, useState } from "react";
import { FaPlay, FaStop } from "react-icons/fa";
import WaveSurfer from "wavesurfer.js";
import dynamic from "next/dynamic";
import TooltipWrapper from "./TooltipWrapper";
import { handleDownload } from "@/config/handleDownload";
import { RiDownloadCloudFill } from "react-icons/ri";
import LoaderComponent from "@/components/Loader";
import { ensureHttps } from "@/config/httpsParser";
import { useMediaQuery } from "@uidotdev/usehooks";
const Time = dynamic(() => import("../../../messages/typeMessages/Time"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});
// Import RepliedMessage dynamically
// styles

export default function AudioFile({
  message,
  onPreview,
}: {
  message: IMessage;
  onPreview: boolean;
}) {
  const isSmallDevice = useMediaQuery("only screen and (max-width:768px)");
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [totalTime, setTotalTime] = useState("00:00");
  //   const url = `${HOST}/${message.message}`;
  const formWaveSurferOptions = (ref: any) => ({
    container: ref,
    waveColor: "#7ae3c3",
    progressColor: "#4a9eff",
    cursorColor: "#ddd",
    barWidth: isSmallDevice ? 2 : 4,
    barRadius: isSmallDevice ? 2 : 3,
    height: isSmallDevice ? 20 : 40,
    responsive: true,
    normalize: true,
    partialRender: true,
  });
  useEffect(() => {
    // Create WaveSurfer instance when the component mounts
    wavesurfer.current = WaveSurfer.create(formWaveSurferOptions(waveformRef.current));
    wavesurfer.current.load(ensureHttps(message.file.url));

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
    <div className="relative flex items-center gap-1  md:gap-2 ">
      {/* Remove/Replay/Emoji */}
      <TooltipWrapper message={message} />
      {/* <FullScreenPreview file={{ url: message?.file?.url, type: message.type }} /> */}
      <RiDownloadCloudFill
        className="absolute bottom-1 right-1 text-sm md:text-lg cursor-pointer text-gray-300"
        onClick={() => handleDownload(ensureHttps(message.file.url))}
      />
      <div className="">
        <Time message={message} isCurrentUserMessage={true} />
        <div
          className={`md:m-4 flex items-center gap-5 text-black dark:text-white px4 pr-2 py-4 text-sm rounded-md`}
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
