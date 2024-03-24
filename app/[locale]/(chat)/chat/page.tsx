import dynamic from "next/dynamic";
import React from "react";
import Index from "./Index";
const Chat = dynamic(() => import("./Chat"));

const page = () => {
  return (
    <>
      <Chat/>
      <Index />
    </>
  );
};

export default page;
