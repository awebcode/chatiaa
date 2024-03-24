


import React, { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaPauseCircle, FaPlay, FaStop, FaTrash } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";
import { useMessageState } from "@/context/MessageContext";
import { useSocketContext } from "@/context/SocketContextProvider";
import { formatTime } from "@/functions/formatTime";
import { sentMessage } from "@/functions/messageActions";

function CaptureAudio({ hide }: any) {
  const { selectedChat } = useMessageState();
  const { socket } = useSocketContext();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<any>(null);
  const [recordedStopAudio, setRecordedStopAudio] = useState<any>(null);
  const [waveform, setWaveform] = useState<any>();
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPlayBackTime, setCurrentPlayBackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setloading] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | any>(null);
  const waveFormRef = useRef<HTMLDivElement | any>(null);

  useEffect(() => {
    const waveSurfer = WaveSurfer.create({
      container: waveFormRef.current,
      waveColor: "#ccc",
      progressColor: "#4a9eff",
      cursorColor: "#7ae3c3",
      barWidth: 2,
      height: 30,
    });

    setWaveform(waveSurfer);

    waveSurfer.on("finish", () => {
      setIsPlaying(false);
    });

    return () => waveSurfer.destroy();
  }, []);

  useEffect(() => {
    if (waveform) {
      handleStartRecording();
    }
  }, [waveform]);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => {
          setTotalDuration(prev + 1);
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isRecording]);

  const handleStartRecording = () => {
    setRecordingDuration(0);
    setCurrentPlayBackTime(0);
    setTotalDuration(0);
    setIsRecording(true);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioRef.current.srcObject = stream;

        const audioChunks: any = [];
        mediaRecorder.addEventListener("dataavailable", (event) => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks, {
            type: "audio/ogg; codecs=opus",
          });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio: any = new Audio(audioUrl);
          setRecordedAudio(audio);

          waveform.load(audioUrl);
          audioRef.current = audio;
        });

        mediaRecorder.start();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      waveform.stop();

      const audioChunks: any = [];
      mediaRecorderRef.current.addEventListener("dataavailable", (event: any) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      });

      mediaRecorderRef.current.addEventListener("stop", async () => {
        // Create a Blob from the audio chunks
        const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
        const audioFile: any = new File([audioBlob], "audio.mp3", {
          type: "audio/mp3",
        });
        setRecordedStopAudio(audioFile);
       
      })
  }
  };

  useEffect(() => {
    if (recordedAudio) {
      const updatePlayBackTime = () => {
        setCurrentPlayBackTime(audioRef.current.currentTime);
      };

      recordedAudio?.addEventListener("timeupdate", updatePlayBackTime);

      return () => {
        recordedAudio?.removeEventListener("timeupdate", updatePlayBackTime);
      };
    }
  }, [recordedAudio]);

  const handlePlayRecording = () => {
    if (recordedAudio) {
      waveform.stop();
      waveform.play();
      recordedAudio.play();
      setIsPlaying(true);
    }
  };

  const handlePauseRecording = () => {
    if (recordedAudio) {
      waveform.stop();
      recordedAudio.pause();
      setIsPlaying(false);
    }
  };

  const sendRecording = async () => {
    if (!isRecording && recordedStopAudio) {
      try {
       setloading(true);
       const formData = new FormData();
       formData.append("files", recordedStopAudio);
       formData.append("content", "");
       formData.append("type", "file");
       formData.append("chatId", selectedChat?.chatId as any);
       formData.append("receiverId", selectedChat?.userInfo?._id as any);

       const res = await sentMessage(formData);
       if (res.status === 200) {
         setloading(false);
         hide(false);
       }
    } catch (error) {
       setloading(false);
    }finally{
       setloading(false);
       hide(false);
    }
    } else {
       try {
         
         mediaRecorderRef.current.stop();
         setIsRecording(false);
        //  waveform.stop();

         const audioChunks: any = [];
         mediaRecorderRef.current.addEventListener("dataavailable", (event: any) => {
           if (event.data.size > 0) {
             audioChunks.push(event.data);
           }
         });

         mediaRecorderRef.current.addEventListener("stop", async () => {
           const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
           const audioFile: any = new File([audioBlob], "audio.mp3", {
             type: "audio/mp3",
           });
          //  setRecordedAudio(audioFile);
setloading(true);
           const formData = new FormData();
           formData.append("files", audioFile);
           formData.append("content", "");
           formData.append("type", "file");
           formData.append("chatId", selectedChat?.chatId as any);
           formData.append("receiverId", selectedChat?.userInfo?._id as any);

           const res = await sentMessage(formData);
           console.log({res})
           if (res.message) {
             setloading(false);
             hide(false);
           }
         });
       } catch (e) {
         setloading(false);
         console.log(e);
       } finally {
         setloading(false);
        //  hide(false);
       }
   }
  };
  return (
    <div className="flex text-2xl w-full z-50 justify-end items-center">
      <div className="pt-1">
        <FaTrash
          className="text-xs md:text-sm cursor-pointer"
          onClick={() => hide(false)}
        />
      </div>
      <div className="mx-4 py-2 px-4 text-white text-lg flex gap-3 justify-center items-center bg-search-input-container-background rounded-full drop-shadow-lg">
        {isRecording ? (
          <div className="text-red-500 text-[10px] md:text-sm animate-pulse text-center">
            Recording... {formatTime(recordingDuration)}
          </div>
        ) : (
          <div>
            {recordedAudio && (
              <>
                {!isPlaying ? (
                  <FaPlay
                    onClick={handlePlayRecording}
                    className="text-[10px] md:text-sm cursor-pointer"
                  />
                ) : (
                  <FaStop
                    onClick={handlePauseRecording}
                    className="text-[10px] md:text-sm cursor-pointer"
                  />
                )}
              </>
            )}
          </div>
        )}
        <div className="w-24 md:w-60" ref={waveFormRef} hidden={isRecording}></div>
        {recordedAudio && isPlaying && (
          <span className="text-xs md:text-sm">{formatTime(currentPlayBackTime)}</span>
        )}
        {recordedAudio && !isPlaying && (
          <span className="text-xs md:text-sm">{formatTime(totalDuration)}</span>
        )}
      </div>
      <audio ref={audioRef} hidden={true} />
      <div className="mr-4">
        {!isRecording ? (
          <FaMicrophone
            className="text-red-500 text-sm md:text-lg cursor-pointer"
            onClick={handleStartRecording}
          />
        ) : (
          <FaPauseCircle
            onClick={handleStopRecording}
            className="cursor-pointer text-red-500"
          />
        )}
      </div>
      <div>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="w-6 h-6 border-l-transparent border-t-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <MdSend
            className="text-blue-500 cursor-pointer mr-4 text-sm md:text-xl"
            title="Send"
            onClick={sendRecording}
          />
        )}
      </div>
    </div>
  );
}

export default CaptureAudio;
