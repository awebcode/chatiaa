import React from "react";
import LeftSideClientWrapper from "../../components/LeftSide";
import PrefetchMyChats from "../../components/mychats/PrefetchChats";
import MainClientWrapper from "../../components/Main";
import PrefetchMessages from "../../components/messages/PrefetchMessages";
import EmptyChat from "../../components/Empty";

const page = ({ params }: { params: { chatId: string } }) => {
  return (
    <div>
      <div className="flexBetween gap-2 overflow-hidden">
        {/* Left side */}
        <div
          className={`h-screen md:h-[88vh] basis-[100%] ${
            params?.chatId ? "hidden" : "block"
          } md:block w-full md:basis-2/4 border `}
        >
          <LeftSideClientWrapper>
            <PrefetchMyChats />
          </LeftSideClientWrapper>
        </div>
        {/* Rightside */}
        <div
          className={`h-screen md:h-[88vh] border w-full ${
            params?.chatId ? "block basis-[100%] w-full" : "hidden"
          }  md:block`}
        >
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
