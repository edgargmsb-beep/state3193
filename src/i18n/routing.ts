import { defineRouting } from "next-intl/routing";

export const locales = ["pt", "en", "ar", "ru", "de", "es"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
});

export const rtlLocales: Locale[] = ["ar"];
