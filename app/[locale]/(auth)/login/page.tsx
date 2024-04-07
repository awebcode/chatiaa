import React from "react";
import dynamic from "next/dynamic";
import LoaderComponent from "@/components/Loader";
const Login = dynamic(() => import("../components/Login"), {
  loading: () => <LoaderComponent />,
});

const page = () => {
  return (
    <div>
      <Login />
    </div>
  );
};

export default page;
