import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getAllAdminUsers } from "@/apisActions/authActions";
import dynamic from "next/dynamic";
import { redirect } from "@/navigation";
import LoaderComponent from "@/components/Loader";
import { fetchUser } from "@/apisActions/serverActions";
const Users = dynamic(() => import("./Users"), {
  ssr: false,
  loading: () => <LoaderComponent text="Fetching..." />,
});
export default async function PrefetchUsers() {
  const user = await fetchUser();
  if (user && (user as any)?.role !== "admin") {
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
