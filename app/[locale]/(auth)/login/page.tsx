import React from "react";
import dynamic from "next/dynamic";
import LoaderComponent from "@/components/Loader";
import { getServerSession } from "next-auth";
const Login = dynamic(() => import("../components/Login"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});

const page = async() => {
   const session = await getServerSession();
  return (
    <div>
      <Login session={session}/>
    </div>
  );
};

export default page;
