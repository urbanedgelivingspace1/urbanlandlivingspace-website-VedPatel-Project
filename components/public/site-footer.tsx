import Link from "next/link";

import { BrandWordmark } from "@/components/foundation/brand-wordmark";
import type { PublicBusinessConfig } from "@/lib/config/public-business";
import {
  buildTelephoneUrl,
  buildWhatsAppUrl,
  OFFICIAL_PHONE_DISPLAY,
} from "@/lib/config/public-business";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/dictionaries";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

export function SiteFooter({
  config,
  locale,
}: Readonly<{ config: PublicBusinessConfig; locale: Locale }>) {
  const telephoneUrl = buildTelephoneUrl(config);
  const whatsAppUrl = buildWhatsAppUrl(config);
  return (
    <footer className="site-footer">
      <div className="site-container footer-grid py-14 lg:py-18">
        <div className="max-w-sm">
          <BrandWordmark />
          <p className="mt-5 text-sm leading-7 text-slate-300">
            {translate(locale, "footer.description")}
          </p>
          <p className="mt-4 text-xs leading-6 text-slate-400">
            {translate(locale, "footer.ecosystem")}
          </p>
        </div>
        <FooterGroup title={translate(locale, "footer.explore")}>
          <Link href="/properties">{translate(locale, "footer.exploreLand")}</Link>
          <Link href="/agricultural-land">{translate(locale, "nav.agricultural")}</Link>
          <Link href="/na-land">{translate(locale, "nav.na")}</Link>
          <Link href="/industrial-land">{translate(locale, "nav.industrial")}</Link>
        </FooterGroup>
        <FooterGroup title={translate(locale, "footer.company")}>
          <Link href="/about">{translate(locale, "nav.about")}</Link>
          <Link href="/contact">{translate(locale, "nav.contact")}</Link>
          <Link href="/guides">{translate(locale, "nav.guides")}</Link>
        </FooterGroup>
        <FooterGroup title={translate(locale, "footer.owners")}>
          <Link href="/sell-your-land">{translate(locale, "nav.sell")}</Link>
          <Link href="/sell-your-land">{translate(locale, "footer.rentOut")}</Link>
          <Link href="/sell-your-land">{translate(locale, "footer.leaseOut")}</Link>
        </FooterGroup>
        <FooterGroup title={translate(locale, "footer.contact")}>
          {telephoneUrl ? <a href={telephoneUrl}>{OFFICIAL_PHONE_DISPLAY}</a> : null}
          {whatsAppUrl ? (
            <a className="footer-whatsapp" href={whatsAppUrl} rel="noreferrer" target="_blank">
              <WhatsAppIcon className="size-4" /> WhatsApp
            </a>
          ) : null}
          {config.officeAddress ? <address>{config.officeAddress}</address> : null}
        </FooterGroup>
      </div>
      <div className="border-t border-white/10">
        <div className="site-container flex flex-col gap-3 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {translate(locale, "footer.copyright")}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy">{translate(locale, "footer.privacy")}</Link>
            <Link href="/terms">{translate(locale, "footer.terms")}</Link>
            <Link href="/disclaimer">{translate(locale, "footer.disclaimer")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <div className="footer-group">
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}
