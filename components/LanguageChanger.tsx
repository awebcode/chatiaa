"use client";

import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "@/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useTransition } from "react";

export default function LanguageChanger() {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const handleChange = (lang: string) => {
    startTransition(() => {
      router.replace(pathname, {
        locale: lang,
      });
    });
  };

  const locales = [
    { name: "english", flag: "/flags/usa.png" },
    { name: "bangla", flag: "/flags/bn.png" },
    { name: "canada", flag: "/flags/canada.png" },
    { name: "china", flag: "/flags/china.png" },
    { name: "france", flag: "/flags/france.png" },
    { name: "germany", flag: "/flags/germany.png" },
    { name: "india", flag: "/flags/ind.png" },
    { name: "japan", flag: "/flags/japan.png" },
    { name: "russia", flag: "/flags/russia.png" },
  ];

  return (
    <div className="relative inline-block">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={`   px-1 md:px-8 py-1 md:py-2 capitalize  bg-transparent rounded-md border-none outline-none focus:border-none cursor-pointer`}
        >
          <Image
            className="inline-block ml-2 h-5 w-7"
            src={locales.find((current) => current.name === locale)?.flag as any}
            alt={locales.find((current) => current.name === locale)?.name as any}
            loading="lazy"
            height={16}
            width={16}
          />{" "}
          <span className="text-xs md:text-sm  text-gray-400">{locale}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-50 absolute p-2 min-w-40 top-0 -right-32 dark:border dark:border-gray-700  shadow-md rounded-md overflow-hidden ">
          {locales.map((item, i) => (
            <div
              key={item.name}
              onClick={() => handleChange(item.name)}
              className={cn(
                `z-50 dark:bg-black dark:text-whitecapitalize text-[10px] md:text-sm flex gap-2 p-3 md:p-4 cursor-pointer
`,
                {
                  "bg-purple-500 rounded dark:bg-purple-500 ": locale === item.name,
                }
              )}
            >
              <Image
                className="inline-block ml-2 h-5 w-7"
                src={item.flag}
                alt={`${item.name} flag`}
                loading="lazy"
                height={16}
                width={16}
              />
              {item.name}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
