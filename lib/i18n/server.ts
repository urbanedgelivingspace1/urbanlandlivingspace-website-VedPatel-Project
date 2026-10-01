import "server-only";

import { cookies } from "next/headers";

import { defaultLocale, isLocale, languageCookieName, type Locale } from "./config";

export async function getRequestLocale(): Promise<Locale> {
  const value = (await cookies()).get(languageCookieName)?.value;
  return isLocale(value) ? value : defaultLocale;
}
