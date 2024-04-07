import LoaderComponent from "@/components/Loader";
import dynamic from "next/dynamic";
import React from "react";
const Profile = dynamic(() => import("../components/Profile"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});

const page = () => {
  return (
    <div>
      <Profile />
    </div>
  );
};

export default page;
