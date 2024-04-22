import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const locales = [
  "english",
  "bangla",
  "canada",
  "china",
  "france",
  "germany",
  "india",
  "japan",
  "russia",
] as const;
export const localePrefix = "always"; // Default
// and external paths, separated by locale.

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation(
  { locales, localePrefix }
);
