import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const MessageLoader = () => {
  return (
    <div className="flex items-center space-4 my-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-[250px]" />
        <Skeleton className="  h-4 w-[200px]" />
      </div>
      {/* <Skeleton className="h-6 w-6 rounded-full" /> */}
    </div>
  );
};

export default MessageLoader;
