import React from "react";
import dynamic from "next/dynamic";
import LoaderComponent from "@/components/Loader";
const Register = dynamic(() => import("../components/Register"), {
  loading: () => <LoaderComponent />,
});

const page = () => {
  return (
    <div>
      <Register />
    </div>
  );
};

export default page;
