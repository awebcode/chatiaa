"use client";

import { SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { BsMoon } from "react-icons/bs";


const ThemeButton = () => {
  const {  setTheme,theme,resolvedTheme } = useTheme();

console.log({theme:theme==="dark"})
  return (
    <button
      aria-label="Toggle Dark Mode"
      type="button"
      className="flex items-center justify-center rounded-lg p-2 transition-colors "
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        // <SunIcon className="h-5 w-5 text-orange-600" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-5 w-5 text-orange-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16V4"
          />
        </svg>
      ) : (
        <BsMoon className="h-5 w-5 text-slate-800" />
      )}
    </button>
  );
};

export default ThemeButton;
