"use server";

import { cookies } from "next/headers";

import { isLocale, languageCookieName } from "@/lib/i18n/config";

export async function persistLanguagePreference(value: string): Promise<void> {
  if (!isLocale(value)) return;

  (await cookies()).set(languageCookieName, value, {
    path: "/",
    maxAge: 31_536_000,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
