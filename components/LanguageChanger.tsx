"use client";

import { useRouter, usePathname } from "@/navigation";
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
  const handleChange = (e: any) => {
    const lang = e.target.value;
    startTransition(() => {
      router.replace(pathname, {
        locale: lang,
      });
    });
  };

  const locales = [
    { name: "english", flag: "/flags/bn.png" },
    { name: "bangla", flag: "/flags/usa.png" },
    { name: "canada", flag: "/flags/canada.png" },
    { name: "china", flag: "/flags/china.png" },
    { name: "france", flag: "/flags/france.png" },
    { name: "germany", flag: "/flags/germany.png" },
    { name: "india", flag: "/flags/ind.png" },
    { name: "japan", flag: "/flags/japan.png" },
    { name: "russia", flag: "/flags/russia.png" },
  ];

  return (
    <select
      value={locale}
      onChange={handleChange}
      className={`text-[10px] md:text-sm px-1 md:px-8 py-1 md:py-2 capitalize   md:ring-2 ring-violet-500  bg-transparent rounded-md border-none outline-none focus:border-none`}
    >
      {locales.map((item, i) => (
        <option
          key={item.name}
          className={`${
            theme === "dark" ? "bg-white text-black" :locale===item.name?"bg-blue-500": "bg-black text-white "
          } m-2   capitalize text-[10px] md:text-sm flex gap-2 p-3 md:p-4 `}
          value={item.name}
        >
          <Image
            className="inline-block ml-2 h-5 w-5"
            src={item.flag}
            alt={`${item.name} flag`}
            height={20}
            width={20}
            // loading="lazy"
          />

          {item.name}
        </option>
      ))}
    </select>
  );
}
