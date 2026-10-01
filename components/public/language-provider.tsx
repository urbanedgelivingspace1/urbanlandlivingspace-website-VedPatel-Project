"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  defaultLocale,
  languageCookieName,
  languageStorageKey,
  type Locale,
} from "@/lib/i18n/config";
import { dictionaries, type TranslationKey } from "@/lib/i18n/dictionaries";

type LanguageContextValue = Readonly<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}>;

const LanguageContext = createContext<LanguageContextValue>({
  locale: defaultLocale,
  setLocale: () => undefined,
  t: (key) => dictionaries[defaultLocale][key],
});

export function LanguageProvider({
  initialLocale,
  children,
}: Readonly<{ initialLocale: Locale; children: React.ReactNode }>) {
  const router = useRouter();
  const [locale, setCurrentLocale] = useState(initialLocale);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale(nextLocale) {
        setCurrentLocale(nextLocale);
        window.localStorage.setItem(languageStorageKey, nextLocale);
        document.cookie = `${languageCookieName}=${nextLocale};path=/;max-age=31536000;samesite=lax`;
        document.documentElement.lang = nextLocale;
        document.documentElement.dataset.language = nextLocale;
        router.refresh();
      },
      t: (key) => dictionaries[locale]?.[key] ?? dictionaries[defaultLocale][key],
    }),
    [locale, router],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
