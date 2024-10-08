"use client";

import { SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { BsMoon } from "react-icons/bs";
import Cookie from "js-cookie";

const ThemeButton = () => {
  const { setTheme, theme, resolvedTheme } = useTheme();

  return (
    <>
      {theme && (
        <button
          aria-label="Toggle Dark Mode"
          type="button"
          className="flex items-center justify-center rounded-lg p-2 transition-colors "
          onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark");
            Cookie.set("theme", theme === "dark" ? "light" : "dark");
          }}
        >
          {theme === "dark" ? (
            <SunIcon className="h-5 w-5  !text-orange-600" />
          ) : (
            <BsMoon className="h-5 w-5 text-slate-800" />
          )}
        </button>
      )}
    </>
  );
};

export default ThemeButton;
