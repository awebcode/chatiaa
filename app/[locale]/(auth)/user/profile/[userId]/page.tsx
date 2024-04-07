import React from "react";
import dynamic from "next/dynamic";
import LoaderComponent from "@/components/Loader";

const UserProfile = dynamic(() => import("../../../components/UserProfile"), {
  loading: () => <LoaderComponent />,
});


const page = ({params}:{params:{userId:string}}) => {
  return (
    <div>
      <UserProfile userId={params.userId} />
    </div>
  );
};

export default page;
