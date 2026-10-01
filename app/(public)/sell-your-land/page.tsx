import { randomUUID } from "node:crypto";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { OwnerSubmissionWizard } from "@/components/public/owner-submission-wizard";
import { loadPublicFormOptions } from "@/server/queries/public-page-data";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { JsonLd } from "@/components/public/json-ld";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPublicMetadata({
  title: "Sell, Rent or Lease Your Land",
  description: "Privately submit Agricultural, NA or Industrial land to UrbanEdge for review.",
  path: "/sell-your-land",
  robots: { index: true, follow: true },
});

export default async function SellYourLandPage() {
  const [{ geography, units }, locale] = await Promise.all([
    loadPublicFormOptions(),
    getRequestLocale(),
  ]);
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const districts = [
    ...new Map(
      geography.map((row) => [
        row.district_id,
        { value: row.district_id, label: row.district_name },
      ]),
    ).values(),
  ];
  const breadcrumbs = [{ label: t("common.home"), href: "/" }, { label: t("sell.breadcrumb") }];
  return (
    <main>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <section className="collection-hero">
        <div className="site-container py-12 sm:py-16">
          <Breadcrumbs items={breadcrumbs} />
          <p className="eyebrow mt-7 text-[var(--brand-gold)]">{t("sell.eyebrow")}</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">{t("sell.title")}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">{t("sell.intro")}</p>
        </div>
      </section>
      <section className="section">
        <div className="site-container conversion-layout">
          <aside>
            <p className="eyebrow">{t("sell.privateReview")}</p>
            <h2 className="section-title">{t("sell.privateTitle")}</h2>
            <p className="section-copy">{t("sell.privateBody")}</p>
            <div className="owner-trust-card">
              <p className="font-bold text-slate-900">{t("sell.before")}</p>
              <ul>
                <li>Your submission is reviewed privately by UrbanEdge.</li>
                <li>Submitting does not automatically publish or accept the property.</li>
                <li>
                  UrbanEdge may contact you to clarify details or request supporting information.
                </li>
                <li>You choose how precisely your land location may be shared publicly.</li>
                <li>
                  Documents remain part of the private review process, not public listing media.
                </li>
              </ul>
            </div>
          </aside>
          <OwnerSubmissionWizard
            idempotencyKey={randomUUID()}
            turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            districts={districts}
            units={units.map((unit) => ({
              value: unit.id,
              label: `${unit.display_name}${unit.symbol ? ` (${unit.symbol})` : ""}`,
            }))}
          />
        </div>
      </section>
    </main>
  );
}
