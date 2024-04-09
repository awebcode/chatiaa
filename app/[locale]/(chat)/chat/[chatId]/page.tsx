import React from "react";
// import LeftSideClientWrapper from "../../components/LeftSide";
// import PrefetchMyChats from "../../components/mychats/PrefetchChats";
// import MainClientWrapper from "../../components/Main";
// import PrefetchMessages from "../../components/messages/PrefetchMessages";
// import EmptyChat from "../../components/Empty";
import dynamic from "next/dynamic";
import LoaderComponent from "@/components/Loader";
import { ChatSkeleton } from "../../components/mychats/ChatSkeleton";
const PrefetchMyChats = dynamic(() => import("../../components/mychats/PrefetchChats"), {
  loading: () => <ChatSkeleton/>,
});

const LeftSideClientWrapper = dynamic(() => import("../../components/LeftSide"), {
  loading: () => <ChatSkeleton/>,
});
// const PrefetchMyChats = dynamic(() => import("../../components/mychats/PrefetchChats"), {
//   loading: () => <LoaderComponent 
  // text="Fetching..."/>,
// });
const MainClientWrapper = dynamic(() => import("../../components/Main"), {
  loading: () => <LoaderComponent text="Fetching messages..." />,
});
const PrefetchMessages = dynamic(
  () => import("../../components/messages/PrefetchMessages"),
  {
    loading: () => <LoaderComponent text="Fetching messages..."/>,
  }
);
const EmptyChat = dynamic(() => import("../../components/Empty"), {
  loading: () => <LoaderComponent text="Fetching..." />,
});

// Now you can use these components as usual, but they will be loaded lazily.

const page = ({ params }: { params: { chatId: string } }) => {
  return (
    <div>
      {/* {!params?.chatId && <Navbar />} */}
      <div className="flexBetween gap-2 overflow-hidden">
        {/* Left side */}
        <div
          className={`h-screen ${
            !params?.chatId ? "md:h-[88vh]" : "h-screen"
          } basis-[100%] ${
            params?.chatId ? "hidden" : "block"
          } md:block w-full md:basis-2/4 border `}
        >
          <LeftSideClientWrapper chatId={params?.chatId as string}>
            <PrefetchMyChats />
          </LeftSideClientWrapper>
        </div>
        {/* Rightside */}
        <div className={`h-screen w-full`}>
          {params?.chatId ? (
            <MainClientWrapper>
              <PrefetchMessages chatId={params?.chatId as string} />
            </MainClientWrapper>
          ) : (
            <EmptyChat />
          )}
        </div>
      </div>
    </div>
  );
};

export default page;
