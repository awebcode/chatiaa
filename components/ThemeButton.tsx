"use client";

import { useTheme } from "next-themes";
import { BsMoon, BsSun } from "react-icons/bs";


const ThemeButton = () => {
  const {  setTheme,theme } = useTheme();

 

  return (
    <button
      aria-label="Toggle Dark Mode"
      type="button"
      className="flex items-center justify-center rounded-lg p-2 transition-colors "
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <BsSun className="h-5 w-5 text-orange-500" />
      ) : (
        <BsMoon className="h-5 w-5 text-slate-800" />
      )}
    </button>
  );
};

export default ThemeButton;
