import Link from "next/link";

import { BrandWordmark } from "./brand-wordmark";

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-[var(--brand-navy-ink)] px-5 py-4 shadow-lg shadow-slate-950/10 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
        <Link aria-label="UrbanEdge Land Space home" href="/">
          <BrandWordmark />
        </Link>
        <p className="hidden text-sm text-slate-300 sm:block">Ahmedabad · Gandhinagar</p>
      </div>
    </header>
  );
}
