import { useMessageState } from "@/context/MessageContext";
import { IMessage } from "@/context/reducers/interfaces";
import { calculateTime, formatTime } from "@/functions/formatTime";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaPlay, FaStop } from "react-icons/fa";
import WaveSurfer from "wavesurfer.js";
import dynamic from "next/dynamic";
const RREsystem = dynamic(() => import("../RRE/RREsystem"));
const Status = dynamic(() => import("./Status"));
const DisplayReaction = dynamic(() => import("./reactions/DisplayReaction"));

// Import RepliedMessage dynamically
const RepliedMessage = dynamic(() => import("./reply/RepliedMessage"));
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

export default function  ({
  message,
  isLastSeenMessage,
  isUserOnline,
  isCurrentUserMessage,
}: {
  message: IMessage;
  isLastSeenMessage: boolean;
  isUserOnline: boolean;
  isCurrentUserMessage:boolean
})  {
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
    <div className="flex items-center gap-2 ">
      {/* Remove/Replay/Emoji */}
      <RREsystem message={message} />
      <div
        className={`md:m-4 flex items-center gap-5 text-white px4 pr-2 py-4 text-sm rounded-md`}
      >
        <div>
          <Image
            src={message.sender.image}
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
          <div className={"w-60"} ref={waveformRef}></div>
          <div
            className={
              "text-bubble-meta text-[11px] pt-1 flex justify-between absolute bottom-[-22px] w-full"
            }
          >
            <span className="text-sm font-medium">
              {playing ? currentTime : totalTime}
            </span>
            {/* Reply */}
            <RepliedMessage message={message} currentUser={currentUser as any} />
            {/* REACTIONS */}
            {message.reactions?.length > 0 && (
              <DisplayReaction
                reactions={message.reactions}
                isCurrentUserMessage={isCurrentUserMessage}
                reactionsGroup={message.reactionsGroup}
              />
            )}
            {/* message status */}
            <Status
              message={message}
              isLastSeenMessage={isLastSeenMessage}
              isUserOnline={isUserOnline}
            />
            <span className={"flex gap-1 text-sm font-medium "}>
              <span>{calculateTime(message.createdAt)}</span>
              {/* {message.senderId === userInfo.id && (
              <MessageStatus messageStatus={message.messageStatus} />
            )} */}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
