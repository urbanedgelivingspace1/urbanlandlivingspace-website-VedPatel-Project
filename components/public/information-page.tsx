import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

import { Breadcrumbs } from "./breadcrumbs";
import { JsonLd } from "./json-ld";
import { SafeMarkdown } from "./safe-markdown";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";

export async function InformationPage({
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
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const breadcrumbs = [{ label: t("common.home"), href: "/" }, { label: title }];
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
            {updated ? (
              <p className="information-updated">
                {t("information.lastReviewed")}: {updated}
              </p>
            ) : null}
          </article>
          <aside className="guide-action-card">
            <p className="eyebrow">UrbanEdge Land Space</p>
            <h2>{t("information.help")}</h2>
            <Link className="button button-gold" href="/properties">
              {t("common.exploreLand")}
            </Link>
            <Link className="button button-outline" href="/contact">
              {t("nav.contact")}
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
