import React from "react";
import CallPage from "../CallInit";

const page = ({ params }: { params: { roomId: string } }) => {
  return (
    <div>
      <CallPage roomId={params.roomId} />
    </div>
  );
};

export default page;
