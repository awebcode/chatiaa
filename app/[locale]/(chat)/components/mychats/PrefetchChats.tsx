// import React from "react";
// import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
// const MyChats = dynamic(() => import("./MyChats"), {
//   ssr: false,
//   loading: () => <ChatSkeleton />,
// });
// import { getChatsServerAction } from "@/apisActions/serverActions";
// import dynamic from "next/dynamic";
// import LoaderComponent from "@/components/Loader";
// import { ChatSkeleton } from "./ChatSkeleton";
// import { inittialDummyChats } from "@/config/dummyData/chats";
// export default async function PrefetchMyChats() {
//   const queryClient = new QueryClient();

//   await queryClient.prefetchInfiniteQuery({
//     queryKey: ["chats", ""],
//     queryFn: getChatsServerAction as any,
//     initialPageParam: 0,
//     staleTime: 0,
//     // initialData: (): any => {
//     //   if (inittialDummyChats && inittialDummyChats.length > 0) {
//     //     return {
//     //       pageParams: [0],
//     //       pages: [{ chats: inittialDummyChats }],
//     //     };
//     //   } else {
//     //     return undefined;
//     //   }
//     // }, //queryClient.getQueryData(['messages',chatId])
//   });

//   return (
//     <HydrationBoundary state={dehydrate(queryClient)}>
//       <MyChats />
//     </HydrationBoundary>
//   );
// }
import React from 'react'

const PrefetchChats = () => {
  return (
    <div>PrefetchChats</div>
  )
}

export default PrefetchChats