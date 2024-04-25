import { useMessageState } from "@/context/MessageContext";
import { IMessage } from "@/context/reducers/interfaces";
import { formatTime } from "@/apisActions/formatTime";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaPlay, FaStop } from "react-icons/fa";
import WaveSurfer from "wavesurfer.js";
import dynamic from "next/dynamic";
import Time from "./Time";
import { RiDownloadCloudFill } from "react-icons/ri";
import { handleDownload } from "@/config/handleDownload";
import LoaderComponent from "@/components/Loader";
import { ensureHttps } from "@/config/httpsParser";
import { useMediaQuery } from "@uidotdev/usehooks";

const SeenBy = dynamic(() => import("./seenby/SeenBy"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});
const DisplayReaction = dynamic(() => import("./reactions/DisplayReaction"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});

// Import RepliedMessage dynamically
const RepliedMessage = dynamic(() => import("./reply/RepliedMessage"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});

const RREsystem = dynamic(() => import("../RRE/RREsystem"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});
const Status = dynamic(() => import("./Status"), {
  // loading: () => <LoaderComponent text="Fetching..." />,
});

// Import RepliedMessage dynamically
// styles

export default function VoiceMessage({
  message,
  isCurrentUserMessage,
}: {
  message: IMessage;
  isCurrentUserMessage: boolean;
}) {
  const isSmallDevice = useMediaQuery("only screen and (max-width:768px)");
  const { selectedChat: currentChatUser, user: currentUser } = useMessageState();
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [totalTime, setTotalTime] = useState("00:00");
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
    wavesurfer.current.load(ensureHttps(message.file.url)); // Ensure URL starts with "https://"

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
    <div
      className={` flex items-center  gap-0 max-w-sm md:max-w-2xl  ${
        isCurrentUserMessage ? "" : "flex-row-reverse"
      }`}
    >
      {/* Remove/Replay/Emoji */}
      <RREsystem message={message} isCurrentUserMessage={isCurrentUserMessage} />
      <div
        className={`${
          isCurrentUserMessage
            ? "flex flex-col  items-end mr-4 md:mr-4"
            : "flex flex-col  items-start "
        }`}
      >
        <Time message={message} isCurrentUserMessage={isCurrentUserMessage} />
        <div
          className={`  flex items-center justify-center gap-2 md:gap-5 text-gray-500 dark:text-white  text-sm rounded-md`}
        >
          <div
            className={`-mt-2 h-6 w-6 md:h-8 md:w-8 ${
              isCurrentUserMessage ? "" : "hidden"
            }`}
          >
            <Image
              src={message.sender?.image}
              height={60}
              width={60}
              loading="lazy"
              alt="avatar"
              className="h-full w-full object-cover rounded-full"
            />
          </div>

          <div className={"cursor-pointer text-sm md:text-lg -mt-2 md:mt-0"}>
            {!playing ? (
              <FaPlay onClick={handlePlayAudio} />
            ) : (
              <FaStop onClick={handlePauseAudio} />
            )}
          </div>
          <div className={`relative ${isCurrentUserMessage ? "" : "p-[2px]"} `}>
            {/* reply */}
            <div className="pt-2 md:pt-6">
              <RepliedMessage message={message} currentUser={currentUser as any} />
            </div>
            <div className={"w-24 md:w-40"} ref={waveformRef}></div>

            <div>
              <span className="text-xs md:text-sm font-medium text-gray-400">
                {playing ? currentTime : totalTime}
              </span>
              {/* REACTIONS */}
              {message.reactions?.length > 0 && (
                <DisplayReaction
                  message={message}
                  reactions={message.reactions}
                  isCurrentUserMessage={isCurrentUserMessage}
                  reactionsGroup={message.reactionsGroup}
                />
              )}
              {/* message status */}
              <Status isCurrentUserMessage={isCurrentUserMessage} message={message} />
              {/* <FullScreenPreview file={{ url: message?.file?.url, type: message.type }} /> */}
              <RiDownloadCloudFill
                className="absolute bottom-1 right-1 text-sm md:text-lg cursor-pointer text-gray-300"
                onClick={() => handleDownload(ensureHttps(message?.file?.url))}
              />
              {/* Seen by lists */}
              {message?.seenBy?.length > 0 && (
                <SeenBy message={message} currentUser={currentUser as any} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
