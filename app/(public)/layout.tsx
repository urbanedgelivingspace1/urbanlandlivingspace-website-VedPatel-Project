import type { ReactNode } from "react";
import Script from "next/script";

import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { LanguageProvider } from "@/components/public/language-provider";
import { getRequestLocale } from "@/lib/i18n/server";
import { loadPublicBusinessConfig } from "@/server/queries/public-page-data";

type PublicLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const [config, locale] = await Promise.all([loadPublicBusinessConfig(), getRequestLocale()]);
  return (
    <LanguageProvider initialLocale={locale}>
      <div className="public-site min-h-screen bg-[var(--surface-muted)]">
        <SiteHeader config={config} />
        {children}
        <SiteFooter config={config} locale={locale} />
        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="afterInteractive"
          />
        ) : null}
      </div>
    </LanguageProvider>
  );
}
