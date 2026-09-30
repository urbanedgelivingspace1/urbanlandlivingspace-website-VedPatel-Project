import { randomUUID } from "node:crypto";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { OwnerSubmissionWizard } from "@/components/public/owner-submission-wizard";
import {
  getPublicAreaUnits,
  getPublicGeographyOptions,
} from "@/server/queries/public-reference-data";
import { createPublicServerClient } from "@/server/supabase/public";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { JsonLd } from "@/components/public/json-ld";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPublicMetadata({
  title: "Sell, Rent or Lease Your Land",
  description: "Privately submit Agricultural, NA or Industrial land to UrbanEdge for review.",
  path: "/sell-your-land",
  robots: { index: true, follow: true },
});

export default async function SellYourLandPage() {
  const client = createPublicServerClient();
  const [geography, units] = await Promise.all([
    getPublicGeographyOptions(client),
    getPublicAreaUnits(client),
  ]);
  const districts = [
    ...new Map(
      geography.map((row) => [
        row.district_id,
        { value: row.district_id, label: row.district_name },
      ]),
    ).values(),
  ];
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Sell your land" }];
  return (
    <main>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <section className="collection-hero">
        <div className="site-container py-12 sm:py-16">
          <Breadcrumbs items={breadcrumbs} />
          <p className="eyebrow mt-7 text-[var(--brand-gold)]">Private owner inquiry</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">
            Tell us about land you want to sell, rent or lease.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
            Share the details UrbanEdge needs to understand your opportunity. Your information and
            documents are reviewed privately—nothing is automatically listed or published.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="site-container conversion-layout">
          <aside>
            <p className="eyebrow">Private brokerage review</p>
            <h2 className="section-title">Your information stays private while we review it.</h2>
            <p className="section-copy">
              UrbanEdge specializes in Agricultural, NA and Industrial land across Ahmedabad and
              Gandhinagar. Our team reviews your submission before deciding the appropriate next
              step.
            </p>
            <div className="owner-trust-card">
              <p className="font-bold text-slate-900">Before you begin</p>
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
