import dynamic from "next/dynamic";
import React from "react";
import Index from "./Index";
import { fetchUser } from "@/functions/serverActions";
import Chat from "./Chat";
import { redirect } from "@/navigation";

const page = async () => {
  const user = await fetchUser();
  if (!user._id) {
    redirect("/");
  }
  return (
    <>
      {user && (
        <>
          <Chat />
          <Index user={user} />
        </>
      )}
    </>
  );
};

export default page;
