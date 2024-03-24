import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { useMessageState } from "@/context/MessageContext";
import { getFilesInChat } from "@/server/controllers/ChatController";
import { TabsTrigger } from "@radix-ui/react-tabs";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import dynamic from "next/dynamic";
import React, { useState } from "react";
const InfiniteScroll = dynamic(() => import("react-infinite-scroll-component"));
const Media = () => {
  const { selectedChat } = useMessageState();
  const [filter, setFilter] = useState("all");
  const debouncedFilter = useDebounce(filter, 600);
  const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
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
  return (
    <div>
      <Tabs defaultValue="all" onValueChange={(v)=>setFilter(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 overflow-x-auto">
          <TabsTrigger value="all">all files</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>

          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
        </TabsList>
         <TabsContent value="all">
            

         </TabsContent>
      </Tabs>
    </div>
  );
};

export default Media;
