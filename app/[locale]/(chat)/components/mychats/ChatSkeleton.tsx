import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="flex items-center space-x-4 my-5 p-4 w-full ">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 w-full">
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
