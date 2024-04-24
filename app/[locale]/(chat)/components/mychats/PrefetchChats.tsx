import React from "react";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
const MyChats = dynamic(() => import("./MyChats"), {
  ssr: false,
  loading: () => <ChatSkeleton />,
});
import { getChatsServerAction } from "@/functions/serverActions";
import dynamic from "next/dynamic";
import LoaderComponent from "@/components/Loader";
import { ChatSkeleton } from "./ChatSkeleton";
export default async function PrefetchMyChats() {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["chats", ""],
    queryFn: getChatsServerAction as any,
    initialPageParam: 0,
    staleTime: 1000,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyChats />
    </HydrationBoundary>
  );
}
