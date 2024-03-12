import React from "react";
import dynamic from "next/dynamic";
const Register = dynamic(() => import("../components/Register"));

const page = () => {
  return (
    <div>
      <Register />
    </div>
  );
};

export default page;
