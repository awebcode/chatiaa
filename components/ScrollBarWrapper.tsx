"use client"

import React, { ReactNode } from 'react'
import type { Scrollbar as BaseScrollbar } from "smooth-scrollbar/scrollbar";
import { useRef } from "react";
import { Scrollbar } from "smooth-scrollbar-react";

const ScrollBarWrapper = ({ children }: { children :ReactNode}) => {
  const scrollbar = useRef<BaseScrollbar | null>(null);

  return (
    <Scrollbar
      ref={scrollbar as any}
      plugins={{
        overscroll: {
          effect: "bounce",
        } as any,
      }}
      alwaysShowTracks
      thumbMinSize={2}
      className="p-0 md:container   pb-20 mx-auto flex flex-wrap items-center justify-center h-screen"
    >
      {children}
    </Scrollbar>
  );
};

export default ScrollBarWrapper