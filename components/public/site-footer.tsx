import Link from "next/link";

import { BrandWordmark } from "@/components/foundation/brand-wordmark";
import type { PublicBusinessConfig } from "@/lib/config/public-business";
import {
  buildTelephoneUrl,
  buildWhatsAppUrl,
  OFFICIAL_OFFICE_MAP_URL,
  OFFICIAL_PHONE_DISPLAY,
} from "@/lib/config/public-business";

export function SiteFooter({ config }: Readonly<{ config: PublicBusinessConfig }>) {
  const telephoneUrl = buildTelephoneUrl(config);
  const whatsAppUrl = buildWhatsAppUrl(config);
  return (
    <footer className="site-footer">
      <div className="site-container footer-grid py-14 lg:py-18">
        <div className="max-w-sm">
          <BrandWordmark />
          <p className="mt-5 text-sm leading-7 text-slate-300">
            Specialist land advisory and brokerage for Ahmedabad &amp; Gandhinagar.
          </p>
          <p className="mt-4 text-xs leading-6 text-slate-400">
            Part of the UrbanEdge real-estate ecosystem alongside UrbanEdge Living Space.
          </p>
        </div>
        <FooterGroup title="Explore">
          <Link href="/properties">Explore land</Link>
          <Link href="/agricultural-land">Agricultural land</Link>
          <Link href="/na-land">NA land</Link>
          <Link href="/industrial-land">Industrial land</Link>
        </FooterGroup>
        <FooterGroup title="Company">
          <Link href="/about" prefetch={false}>
            About
          </Link>
          <Link href="/contact" prefetch={false}>
            Contact
          </Link>
          <Link href="/guides" prefetch={false}>
            Guides
          </Link>
        </FooterGroup>
        <FooterGroup title="Owners">
          <Link href="/sell-your-land" prefetch={false}>
            Sell your land
          </Link>
          <Link href="/sell-your-land" prefetch={false}>
            Rent out your land
          </Link>
          <Link href="/sell-your-land" prefetch={false}>
            Lease your land
          </Link>
        </FooterGroup>
        <FooterGroup title="Contact">
          {telephoneUrl ? <a href={telephoneUrl}>{OFFICIAL_PHONE_DISPLAY}</a> : null}
          {whatsAppUrl ? <a href={whatsAppUrl}>WhatsApp</a> : null}
          {config.officeAddress ? <address>{config.officeAddress}</address> : null}
          <a href={OFFICIAL_OFFICE_MAP_URL} rel="noreferrer" target="_blank">
            Open in Google Maps
          </a>
        </FooterGroup>
      </div>
      <div className="border-t border-white/10">
        <div className="site-container flex flex-col gap-3 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} UrbanEdge Land Space.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" prefetch={false}>
              Privacy
            </Link>
            <Link href="/terms" prefetch={false}>
              Terms
            </Link>
            <Link href="/disclaimer" prefetch={false}>
              Disclaimer
            </Link>
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
