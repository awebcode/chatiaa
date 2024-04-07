import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMessageState } from "@/context/MessageContext";
import { getFilesInChat } from "@/functions/chatActions";
import { SlActionRedo } from "react-icons/sl";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import Card from "./Card";
import { IMessage } from "@/context/reducers/interfaces";
const InfiniteScroll = dynamic(() => import("react-infinite-scroll-component"));
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import FullScreenPreview from "./FullScreen";
import LoaderComponent from "@/components/Loader";
export default function FilesSheet({ total }: { total: number }) {
  const { selectedChat } = useMessageState();
  const [filter, setFilter] = useState("all");
  const debouncedFilter = useDebounce(filter, 600);
  const { data, isFetching, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: [selectedChat?.chatId, debouncedFilter],

    queryFn: getFilesInChat as any,

    getNextPageParam: (lastPage: any) => {
      const { prevOffset, total, limit } = lastPage;
      // Calculate the next offset based on the limit
      const nextOffset = prevOffset + limit;

      // Check if there are more items to fetch
      if (nextOffset >= total) {
        return;
      }

      return nextOffset;
    },
    initialPageParam: 0,
  });

  const files = data?.pages.flatMap((page) => page?.files);
  const filterItems = [
    { name: "all", total: data?.pages[0]?.total },
    { name: "image", total: data?.pages[0]?.totalImages },
    { name: "video", total: data?.pages[0]?.totalVideos },
    { name: "audio", total: data?.pages[0]?.totalAudios },
    { name: "application", total: data?.pages[0]?.totalDocuments },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <span className="text-blue-600 flex  cursor-pointer  text-xs">
            <SlActionRedo className="text-blue-600 " />
            view total ({data?.pages[0]?.total})
          </span>
        </SheetTrigger>
        <SheetContent side={"left"} className="min-w-screen h-screen">
          <SheetHeader>
            <SheetTitle>View chat medias</SheetTitle>
            <SheetDescription>
              View media of this chat you can save and modify all of media in this chat
            </SheetDescription>
          </SheetHeader>
          <div>
            <Carousel className="w-full max-w-sm p-4 ml-10">
              <CarouselContent className="">
                {filterItems.map((v, index) => (
                  <CarouselItem
                    onClick={() => setFilter(v.name)}
                    key={index}
                    className="md:basis-1/2 lg:basis-1/3 m-1"
                  >
                    <Button
                      size={"lg"}
                      className={`${
                        filter === v.name ? "bg-blue-600 hover:bg-blue-700 mx-4" : ""
                      }`}
                    >
                      {v.name === "all"
                        ? `All files (${v.total})`
                        : v.name + "s " + `(${v?.total})`}
                    </Button>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
            {/* Infinite scrolling */}
            <div id="GroupSearchTarget" style={{ height: "60vh", overflowY: "scroll" }}>
              <InfiniteScroll
                dataLength={files ? files?.length : 0}
                next={() => {
                  fetchNextPage();
                }}
                hasMore={hasNextPage}
                loader={<LoaderComponent/>}
                endMessage={
                  <p className="text-green-400">
                    <b>all files here!</b>
                  </p>
                }
                style={{ height: "100%" }}
                scrollableTarget="GroupSearchTarget"
              >
                <div className="grid grid-cols-2 gap-3 my-4">
                  {files && files?.length > 0
                    ? files?.map((file: IMessage, index: number) => {
                        return (
                          <Card
                            message={file}
                            key={index + Date.now() + Math.random() * 20}
                          />
                        );
                      })
                    : !isLoading &&
                      !isFetching && (
                        <h1 className="text-sm md:text-xl m-4 text-center">
                          No Files Found!
                        </h1>
                      )}

                  <h1>{isFetching ? "isFetching" : ""}</h1>
                </div>
              </InfiniteScroll>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
