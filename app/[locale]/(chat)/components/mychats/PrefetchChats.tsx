import React from "react";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
const MyChats = dynamic(() => import("./MyChats"), {
  ssr: false,
});
import { getChatsServerAction } from "@/functions/serverActions";
import dynamic from "next/dynamic";
export default async function PrefetchMyChats() {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["chats", ""],
    queryFn: getChatsServerAction as any,
    initialPageParam: 0,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyChats />
    </HydrationBoundary>
  );
}
