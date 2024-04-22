"use client"
import React, { useEffect, useState } from "react";

const EmptyChat = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const LottieComponent = isClient ? require("react-lottie").default : null;
  const EmptyLOttie = isClient ? require("./lottie/EmptyLOttie.json") : null;

  const defaultOptions = {
    loop: true,
    autoplay: true,
    hover: false,
    
    animationData: EmptyLOttie,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="h-screen md:h-[98vh] w-full rounded flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-800">
      {LottieComponent && <LottieComponent options={defaultOptions} />}
    </div>
  );
};

export default EmptyChat;
