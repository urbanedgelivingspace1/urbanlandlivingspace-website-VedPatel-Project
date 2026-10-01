"use client";

import { supportedLocales, type Locale } from "@/lib/i18n/config";

import { useLanguage } from "./language-provider";

const shortLabels: Record<Locale, string> = {
  en: "EN",
  gu: "ગુજરાતી",
  hi: "हिन्दी",
};

export function LanguageSwitcher({ compact = false }: Readonly<{ compact?: boolean }>) {
  const { locale, setLocale, t } = useLanguage();
  return (
    <div className={compact ? "language-switcher is-compact" : "language-switcher"}>
      <span className="sr-only" id={compact ? "mobile-language-label" : "language-label"}>
        {t("language.label")}
      </span>
      {supportedLocales.map((item) => (
        <button
          type="button"
          key={item}
          lang={item}
          aria-pressed={locale === item}
          aria-label={`${t("language.label")}: ${t(`language.${item}`)}`}
          onClick={() => setLocale(item)}
        >
          {shortLabels[item]}
        </button>
      ))}
    </div>
  );
}
