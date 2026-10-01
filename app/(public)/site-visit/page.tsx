import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { submitSiteVisitRequestAction } from "@/app/(public)/intake-actions";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { SiteVisitRequestForm } from "@/components/public/intake-forms";
import { isClosedPublicAvailability } from "@/lib/formatting/property-values";
import { loadPublicProperty } from "@/server/queries/public-page-data";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";

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
  const [property, locale] = await Promise.all([loadPublicProperty(slug), getRequestLocale()]);
  if (!property || isClosedPublicAvailability(property.availability)) notFound();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const formAction = submitSiteVisitRequestAction.bind(null, { propertySlug: property.slug });
  const minimumDate = minimumVisitDate();
  return (
    <main>
      <section className="collection-hero">
        <div className="site-container py-12 sm:py-16">
          <Breadcrumbs
            items={[
              { label: t("common.home"), href: "/" },
              { label: property.title, href: `/properties/${property.slug}` },
              { label: t("visit.breadcrumb") },
            ]}
          />
          <p className="eyebrow mt-7 text-[var(--brand-gold)]">{t("visit.breadcrumb")}</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">
            {t("visit.title")} {property.propertyCode}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">{t("visit.intro")}</p>
        </div>
      </section>
      <section className="section">
        <div className="site-container conversion-layout">
          <div>
            <p className="eyebrow">{t("visit.context")}</p>
            <h2 className="section-title">{property.title}</h2>
            <p className="section-copy">
              {property.location.label || t("common.locationUnavailable")}
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
