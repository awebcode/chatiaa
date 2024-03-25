import React from "react";
import UserProfile from "../../../components/UserProfile";

const page = ({params}:{params:{userId:string}}) => {
  return (
    <div>
      <UserProfile userId={params.userId} />
    </div>
  );
};

export default page;
