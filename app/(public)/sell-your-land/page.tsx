import { randomUUID } from "node:crypto";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { SellerContactForm } from "@/components/public/seller-contact-form";
import { submitSellerLeadAction } from "@/app/(public)/intake-actions";
import { getPublicGeographyOptions } from "@/server/queries/public-reference-data";
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
  const geography = await getPublicGeographyOptions(client);
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
            Share your contact and land essentials in a single step. UrbanEdge reviews every inquiry
            privately—nothing is automatically listed or published.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="site-container conversion-layout">
          <aside>
            <p className="eyebrow">Direct Brokerage Support</p>
            <h2 className="section-title">A direct conversation, not an automated form.</h2>
            <p className="section-copy">
              UrbanEdge specializes in land brokerage across Gujarat. Once you submit this short
              form, our land advisory desk will review what you shared and contact you directly.
            </p>
            <div className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
              <p className="font-bold text-slate-900">Why owners choose UrbanEdge:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Private handling by the UrbanEdge team</li>
                <li>Practical pricing discussion and buyer matching</li>
                <li>Physical site visit and boundary assistance</li>
                <li>Complete documentation & deal closing support</li>
              </ul>
            </div>
          </aside>
          <SellerContactForm
            action={submitSellerLeadAction}
            idempotencyKey={randomUUID()}
            turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            districts={districts}
          />
        </div>
      </section>
    </main>
  );
}
