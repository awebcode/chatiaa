import React from "react";
import LeftSideClientWrapper from "../components/LeftSide";
// import EmptyChat from "../components/Empty";
// import MainClientWrapper from "../components/Main";
import PrefetchMyChats from "../components/mychats/PrefetchChats";
import PrefetchMessages from "../components/messages/PrefetchMessages";
import MainClientWrapper from "../components/Main";

import dynamic from "next/dynamic";
import LoaderComponent from "@/components/Loader";
import { ChatSkeleton } from "../components/mychats/ChatSkeleton";
import EmptyChat from "../components/Empty";
// import MyChats from "../components/mychats/MyChats";
import { redirect } from "@/navigation";
import { fetchUser, wait } from "@/apisActions/serverActions";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { setInterval } from "timers/promises";
// import PrefetchMessages from "../components/messages/PrefetchMessages";
// import Messages from "../components/messages/Messages";
const Messages = dynamic(() => import("../components/messages/Messages"), {
  ssr: false,
  loading: () => <LoaderComponent text="Fetching messages..." />,
});
// const LeftSideClientWrapper = dynamic(() => import("../components/LeftSide"), {
//   loading: () => <ChatSkeleton />,
// });

// const PrefetchMyChats = dynamic(() => import("../components/mychats/PrefetchChats"), {
//   ssr: false,
//   loading: () => <LoaderComponent text="Fetching Chats..." />,
// });

// const MainClientWrapper = dynamic(() => import("../components/Main"), {
//   loading: () => <LoaderComponent text="Fetching Messages..." />,
// });
// const PrefetchMessages = dynamic(
//   () => import("../components/messages/PrefetchMessages"),
//   {
//     loading: () => <LoaderComponent text="Fetching Messages..." />,
//   }
// );
// Now you can use these components as usual, but they will be loaded lazily.

const page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const selectedChatInCookie = cookies().get("selectedChat")?.value;
  const user = await fetchUser();
  if (!user?.email) return redirect("/");
  console.log({ selectedChatInCookie });
  return (
    <>
      <div className="flexBetween gap-1 md:gap-2 overflow-hidden">
        {/* Left side */}
        <div
          className={`h-[93vh] md:h-[92vh] basis-[100%]  w-full md:basis-3/6 border  ${
            searchParams?.chatId ? "hidden md:block" : "block"
          }`}
        >
          <LeftSideClientWrapper chatId={searchParams?.chatId as string}>
            <PrefetchMyChats />
            {/* <MyChats /> */}
          </LeftSideClientWrapper>
        </div>
        {/* Rightside */}
        <div
          className={`relative h-screen  ${
            searchParams?.chatId && selectedChatInCookie ? "block" : "hidden"
          } md:block  md:h-[92vh] border w-full `}
         
        >
          {searchParams?.chatId && selectedChatInCookie ? (
            <MainClientWrapper>
              <PrefetchMessages chatId={searchParams?.chatId as string} />
              {/* Client side rendering more than faster */}
              {/* <Messages chatId={searchParams?.chatId as string} /> */}
            </MainClientWrapper>
          ) : (
            // <Messages chatId={searchParams?.chatId as string} />
            <EmptyChat />
          )}
          {/* <EmptyChat /> */}
        </div>
      </div>
    </>
  );
};

export default page;
