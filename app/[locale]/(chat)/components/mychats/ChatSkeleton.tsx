import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="flex items-center space-x-4 my-5 p-4 w-full ">
      <Skeleton className="h-10 w-12 md:h-12 md:w-14 rounded-full" />
      <div className="space-y-2 w-full">
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
