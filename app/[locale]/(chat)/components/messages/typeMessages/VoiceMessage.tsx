import { useMessageState } from "@/context/MessageContext";
import { IMessage } from "@/context/reducers/interfaces";
import { formatTime } from "@/functions/formatTime";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaPlay, FaStop } from "react-icons/fa";
import WaveSurfer from "wavesurfer.js";
import dynamic from "next/dynamic";
import Time from "./Time";
import { RiDownloadCloudFill } from "react-icons/ri";
import { handleDownload } from "@/config/handleDownload";
import LoaderComponent from "@/components/Loader";

const SeenBy = dynamic(() => import("./seenby/SeenBy"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});
const DisplayReaction = dynamic(() => import("./reactions/DisplayReaction"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});

// Import RepliedMessage dynamically
const RepliedMessage = dynamic(() => import("./reply/RepliedMessage"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});

const RREsystem = dynamic(() => import("../RRE/RREsystem"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});
const Status = dynamic(() => import("./Status"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});

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

export default function VoiceMessage({
  message,
  isCurrentUserMessage,
}: {
  message: IMessage;
  isCurrentUserMessage: boolean;
}) {
  const { selectedChat: currentChatUser, user: currentUser } = useMessageState();
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
    <div className="flex items-center gap-2 max-w-sm md:max-w-2xl">
      {/* Remove/Replay/Emoji */}
      <RREsystem message={message} isCurrentUserMessage={isCurrentUserMessage} />
      <div className="flex flex-col justify-end items-end">
        <Time message={message} isCurrentUserMessage={isCurrentUserMessage} />
        <div
          className={`md:m-4 flex items-center gap-5 text-gray-500 dark:text-white px4 pr-2 py-4 text-sm rounded-md`}
        >
          <div>
            <Image
              src={message.sender?.image}
              height={60}
              width={60}
              loading="lazy"
              alt="avatar"
              className="h-full w-full object-cover rounded-full"
            />
          </div>

          <div className={"cursor-pointer text-xl"}>
            {!playing ? (
              <FaPlay onClick={handlePlayAudio} />
            ) : (
              <FaStop onClick={handlePauseAudio} />
            )}
          </div>
          <div className={"relative "}>
            {/* reply */}
            <div className="pt-6">
              <RepliedMessage message={message} currentUser={currentUser as any} />
            </div>
            <div className={"w-28 md:w-60"} ref={waveformRef}></div>

            <div
              className={
                "text-bubble-meta text-[11px] pt-1 flex justify-between absolute bottom-[-22px] w-full"
              }
            >
              <span className="text-sm font-medium">
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
                className="absolute bottom-1 right-1 text-xl cursor-pointer text-gray-300"
                onClick={() => handleDownload(message?.file?.url)}
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
