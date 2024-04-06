import React from "react";
import LeftSideClientWrapper from "../components/LeftSide";
import EmptyChat from "../components/Empty";
import MainClientWrapper from "../components/Main";
import PrefetchMyChats from "../components/mychats/PrefetchChats";
import PrefetchMessages from "../components/messages/PrefetchMessages";
const page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  return (
    <>
      <div className="flexBetween gap-2 overflow-hidden">
        {/* Left side */}
        <div
          className={`h-[91vh] md:h-[88vh] basis-[100%] ${
            searchParams?.chatId ? "hidden" : "block"
          } md:block w-full md:basis-2/4 border `}
        >
          <LeftSideClientWrapper>
            <PrefetchMyChats />
          </LeftSideClientWrapper>
        </div>
        {/* Rightside */}
        <div
          className={`h-[91vh] md:h-[88vh] border w-full ${
            searchParams?.chatId ? "block basis-[100%] w-full" : "hidden"
          }  md:block`}
        >
          {searchParams?.chatId ? (
            <MainClientWrapper>
              <PrefetchMessages chatId={searchParams?.chatId as string} />
            </MainClientWrapper>
          ) : (
            <EmptyChat />
          )}
        </div>
      </div>
    </>
  );
};

export default page;
