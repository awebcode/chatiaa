import React from "react";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
// const Messages = dynamic(() => import("./Messages"), {
//   ssr: false,
//   loading: () => <LoaderComponent text="Fetching messages..."/>,
// });
import { allMessagesServerAction } from "@/apisActions/serverActions";
import dynamic from "next/dynamic";
import LoaderComponent from "@/components/Loader";
import Messages from "./Messages";
import { cookies } from "next/headers";
import { BiMessageSquareAdd } from "react-icons/bi";
import { inittialDummyMessages } from "@/config/dummyData/messages";
export default async function PrefetchMessages({ chatId }: { chatId: string }) {
  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["messages", chatId], //als0 give here the chat id
    queryFn: allMessagesServerAction as any,
    initialPageParam: 0,
    staleTime: 0,
    // initialData: (): any => {
    //   // const messages = selectedChat?.messages?.messages;
    //   if (inittialDummyMessages) {
    //     return {
    //       pageParams: [0],
    //       pages: [{ messages: inittialDummyMessages }],
    //     };
    //   } else {
    //     return undefined;
    //   }
    // }, //queryClient.getQueryData(['messages',chatId])
    // staleTime: 000 * 60,
  });
  return (
    // Neat! Serialization is now as easy as passing
    // HydrationBoundary is a Client Component, so hydration will happen there.
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Messages chatId={chatId} />
    </HydrationBoundary>
  );
}
