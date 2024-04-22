import React from "react";
import dynamic from "next/dynamic"; // Assuming you're using Next.js
import LoaderComponent from "@/components/Loader";

const PrefetchUsers = dynamic(() => import("./PrefetchUsers"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});

const page = () => {
  return (
    <div>
      <PrefetchUsers />
    </div>
  );
};

export default page;
