import React from "react";
import dynamic from "next/dynamic";
import LoaderComponent from "@/components/Loader";
import { getServerSession } from "next-auth";
const Register = dynamic(() => import("../components/Register"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});

const page = async() => {
   const session = await getServerSession();
  return (
    <div>
      <Register  session={session}/>
    </div>
  );
};

export default page;
