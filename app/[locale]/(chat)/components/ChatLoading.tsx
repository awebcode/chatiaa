"use client";
import { useEffect, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const ChatLoading = ({
  count,
  height,
  inline,
  radius,
}: {
  count: number;
  height: number;
  radius: number;
  inline: boolean;
}) => {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const currentTheme =
      typeof window !== "undefined" && window.localStorage.getItem("theme");
    if (currentTheme) {
      setTheme(currentTheme);
    }
  }, []);

  return (
    <>
      <SkeletonTheme
        baseColor={theme === "dark" ? "#1f2937" : "#e5e7eb"}
        highlightColor={theme === "dark" ? "#111827" : "#f3f4f6"}
      >
        <Skeleton
          height={height || 45}
          count={count}
          borderRadius={radius}
          inline={inline}
        />
      </SkeletonTheme>
    </>
  );
};

export default ChatLoading;
