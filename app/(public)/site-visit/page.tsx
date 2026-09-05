import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { submitSiteVisitRequestAction } from "@/app/(public)/intake-actions";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { SiteVisitRequestForm } from "@/components/public/intake-forms";
import { isClosedPublicAvailability } from "@/lib/formatting/property-values";
import { loadPublicProperty } from "@/server/queries/public-page-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Request a Land Site Visit",
  description:
    "Ask UrbanEdge to coordinate a preferred visit time for an active published property.",
  robots: { index: false, follow: true },
};

function minimumVisitDate(): string {
  return new Date(Date.now() + 86_400_000).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}

export default async function SiteVisitPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const value = (await searchParams).property;
  const slug = typeof value === "string" ? value : value?.[0];
  if (!slug) notFound();
  const property = await loadPublicProperty(slug);
  if (!property || isClosedPublicAvailability(property.availability)) notFound();
  const formAction = submitSiteVisitRequestAction.bind(null, { propertySlug: property.slug });
  const minimumDate = minimumVisitDate();
  return (
    <main>
      <section className="collection-hero">
        <div className="site-container py-12 sm:py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: property.title, href: `/properties/${property.slug}` },
              { label: "Request site visit" },
            ]}
          />
          <p className="eyebrow mt-7 text-[var(--brand-gold)]">Request site visit</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">
            Ask to visit {property.propertyCode}.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
            Choose a preferred window. This records a request only; UrbanEdge must confirm access
            and availability manually.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="site-container conversion-layout">
          <div>
            <p className="eyebrow">Property context</p>
            <h2 className="section-title">{property.title}</h2>
            <p className="section-copy">
              {property.location.label || "Location details available through UrbanEdge"}
            </p>
          </div>
          <SiteVisitRequestForm
            action={formAction}
            idempotencyKey={randomUUID()}
            turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            minimumDate={minimumDate}
          />
        </div>
      </section>
    </main>
  );
}
