import { IMessage } from "@/context/reducers/interfaces";
import React from "react";
import dynamic from 'next/dynamic';
import LoaderComponent from "@/components/Loader";

const ImageFile = dynamic(() => import('./type/ImageFile'), {
  loading: () => <LoaderComponent />,
});
const VideoFile = dynamic(() => import('./type/Video'), {
  loading: () => <LoaderComponent />,
});
const Pdf = dynamic(() => import('./type/Pdf'), {
  loading: () => <LoaderComponent />,
});
const AudioFile = dynamic(() => import('./type/Audio'), {
  loading: () => <LoaderComponent />,
});

const Card = ({ message }: { message: IMessage }) => {
  return (
    <div>
      {message.type === "image" && <ImageFile message={message} />}
      {message.type === "video" && <VideoFile message={message} />}
      {message.type === "audio" && <AudioFile message={message} onPreview={false} />}
      {message.type === "application" && <Pdf message={message} />}
    </div>
  );
};

export default Card;
