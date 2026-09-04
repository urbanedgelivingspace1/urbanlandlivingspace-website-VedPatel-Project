import Link from "next/link";

import { BrandWordmark } from "@/components/foundation/brand-wordmark";
import type { PublicBusinessConfig } from "@/lib/config/public-business";
import { buildTelephoneUrl, buildWhatsAppUrl } from "@/lib/config/public-business";

export function SiteFooter({ config }: Readonly<{ config: PublicBusinessConfig }>) {
  const telephoneUrl = buildTelephoneUrl(config);
  const whatsAppUrl = buildWhatsAppUrl(config);
  return (
    <footer className="site-footer">
      <div className="site-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-18">
        <div className="max-w-sm">
          <BrandWordmark />
          <p className="mt-5 text-sm leading-7 text-slate-300">
            Curated land discovery and local brokerage guidance across Ahmedabad and Gandhinagar.
          </p>
          <p className="mt-4 text-xs leading-6 text-slate-400">
            A specialist land initiative from the UrbanEdge family.
          </p>
        </div>
        <FooterGroup title="Discover">
          <Link href="/properties">All land</Link>
          <Link href="/agricultural-land">Agricultural land</Link>
          <Link href="/na-land">NA land</Link>
          <Link href="/industrial-land">Industrial land</Link>
        </FooterGroup>
        <FooterGroup title="Transactions">
          <Link href="/buy">Buy</Link>
          <Link href="/rent">Rent</Link>
          <Link href="/lease">Lease</Link>
          <Link href="/sell-your-land" prefetch={false}>
            Sell your land
          </Link>
        </FooterGroup>
        <FooterGroup title="UrbanEdge">
          <Link href="/about" prefetch={false}>
            About
          </Link>
          <Link href="/contact" prefetch={false}>
            Contact
          </Link>
          <Link href="/guides" prefetch={false}>
            Land guides
          </Link>
          {telephoneUrl ? <a href={telephoneUrl}>Call UrbanEdge</a> : null}
          {whatsAppUrl ? <a href={whatsAppUrl}>WhatsApp</a> : null}
          {config.livingSpaceUrl ? (
            <a href={config.livingSpaceUrl} rel="noreferrer" target="_blank">
              UrbanEdge Living Space
            </a>
          ) : null}
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
