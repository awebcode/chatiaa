import React from 'react'
import { ChatSkeleton } from './ChatSkeleton';

const SkeletonContainer = () => {
  return (
    <div>
      {" "}
      <ChatSkeleton />
      <ChatSkeleton />
      <ChatSkeleton />
      <ChatSkeleton />
      <ChatSkeleton />
      <ChatSkeleton />
      <ChatSkeleton />
      <ChatSkeleton />
    </div>
  );
}

export default SkeletonContainer