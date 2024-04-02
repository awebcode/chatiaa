import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getAllAdminUsers } from "@/functions/authActions";
import dynamic from "next/dynamic";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "@/navigation";
const Users = dynamic(() => import("./Users"), { ssr: false });
export default async function PrefetchUsers() {
   const data = await getServerSession(authOptions);
  if (data && data.user && (data.user as any)?.role!=="admin") {
    redirect("/");
  }
  // if (!data?.user) {
  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["fetch-server-user"], //messages
    queryFn: getAllAdminUsers as any,
    initialPageParam: 1,
  });

  return (
    // Neat! Serialization is now as easy as passing props.
    // HydrationBoundary is a Client Component, so hydration will happen there.
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Users />
    </HydrationBoundary>
  );
}
