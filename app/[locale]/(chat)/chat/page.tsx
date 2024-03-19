import dynamic from "next/dynamic";
import React from "react";
const Chat = dynamic(() => import("./Chat"));

const page = () => {
  return (
    <>
      <Chat />
    </>
  );
};

export default page;
