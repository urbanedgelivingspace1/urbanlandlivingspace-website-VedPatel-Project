export const supportedLocales = ["en", "gu", "hi"] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "en";
export const languageCookieName = "urbanedge-language";
export const languageStorageKey = "urbanedge-language";

export function isLocale(value: string | null | undefined): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function localeForFormatting(locale: Locale): string {
  return locale === "gu" ? "gu-IN" : locale === "hi" ? "hi-IN" : "en-IN";
}
