import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

import { Breadcrumbs } from "./breadcrumbs";
import { JsonLd } from "./json-ld";
import { SafeMarkdown } from "./safe-markdown";

export function InformationPage({
  eyebrow,
  title,
  intro,
  body,
  updated,
}: Readonly<{
  eyebrow: string;
  title: string;
  intro: string;
  body: string;
  updated?: string;
}>) {
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: title }];
  return (
    <main>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <section className="collection-hero">
        <div className="site-container py-12 sm:py-16">
          <Breadcrumbs items={breadcrumbs} />
          <p className="eyebrow mt-7 text-[var(--brand-gold)]">{eyebrow}</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">{intro}</p>
        </div>
      </section>
      <section className="section section-light">
        <div className="site-container information-layout">
          <article className="editorial-card">
            <SafeMarkdown value={body} />
            {updated ? <p className="information-updated">Last reviewed: {updated}</p> : null}
          </article>
          <aside className="guide-action-card">
            <p className="eyebrow">UrbanEdge Land Space</p>
            <h2>Need help with a specific land search?</h2>
            <Link className="button button-gold" href="/properties">
              Explore land
            </Link>
            <Link className="button button-outline" href="/contact" prefetch={false}>
              Contact UrbanEdge
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
