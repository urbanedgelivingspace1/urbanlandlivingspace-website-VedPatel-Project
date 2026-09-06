import { randomUUID } from "node:crypto";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { OwnerSubmissionWizard } from "@/components/public/owner-submission-wizard";
import {
  getPublicAreaUnits,
  getPublicGeographyOptions,
} from "@/server/queries/public-reference-data";
import { createPublicServerClient } from "@/server/supabase/public";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sell, Rent or Lease Your Land",
  description: "Privately submit Agricultural, NA or Industrial land to UrbanEdge for review.",
  alternates: { canonical: "/sell-your-land" },
};

export default async function SellYourLandPage() {
  const client = createPublicServerClient();
  const [geography, areaUnits] = await Promise.all([
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
  const units = areaUnits.map((unit) => ({
    value: unit.id,
    label: `${unit.display_name}${unit.symbol ? ` (${unit.symbol})` : ""}`,
  }));
  return (
    <main>
      <section className="collection-hero">
        <div className="site-container py-12 sm:py-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Sell your land" }]} />
          <p className="eyebrow mt-7 text-[var(--brand-gold)]">Private owner submission</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">
            Tell us about land you want to sell, rent or lease.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
            Share the useful essentials without creating an account. UrbanEdge reviews every
            submission privately—nothing is automatically listed or published.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="site-container conversion-layout">
          <aside>
            <p className="eyebrow">Controlled review</p>
            <h2 className="section-title">A private first step, not a live listing.</h2>
            <p className="section-copy">
              Your contact details, coordinates, commercial minimum and supporting documents stay in
              the private review workflow. Any future property record starts as a draft and has
              separate verification and publication gates.
            </p>
          </aside>
          <OwnerSubmissionWizard
            idempotencyKey={randomUUID()}
            turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            districts={districts}
            units={units}
          />
        </div>
      </section>
    </main>
  );
}
