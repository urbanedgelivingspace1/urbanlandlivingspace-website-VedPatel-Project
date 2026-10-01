import { randomUUID } from "node:crypto";
import type { Metadata } from "next";

import { submitBuyerRequirementAction } from "@/app/(public)/intake-actions";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { BuyerRequirementForm } from "@/components/public/intake-forms";
import { parseRequirementPrefill } from "@/features/intake/domain/prefill";
import type { SearchParamsInput } from "@/features/search/domain/search-query";
import { loadPublicFormOptions } from "@/server/queries/public-page-data";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Tell UrbanEdge Your Land Requirement",
  description: "Share a structured Agricultural, NA or Industrial land requirement with UrbanEdge.",
  alternates: { canonical: "/requirements" },
  robots: { index: false, follow: true },
};

export default async function RequirementsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<SearchParamsInput> }>) {
  const [{ geography, units }, locale] = await Promise.all([
    loadPublicFormOptions(),
    getRequestLocale(),
  ]);
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const prefill = parseRequirementPrefill(await searchParams, geography, units);
  const districts = [
    ...new Map(
      geography.map((row) => [
        row.district_id,
        { value: row.district_id, label: row.district_name },
      ]),
    ).values(),
  ];
  const subdistricts = [
    ...new Map(
      geography
        .filter((row) => row.subdistrict_id && row.subdistrict_name)
        .map((row) => [
          row.subdistrict_id as string,
          {
            value: row.subdistrict_id as string,
            label: `${row.district_name} — ${row.subdistrict_name}`,
          },
        ]),
    ).values(),
  ];
  const places = [
    ...new Map(
      geography
        .filter((row) => row.place_id && row.place_name)
        .map((row) => [
          row.place_id as string,
          {
            value: row.place_id as string,
            label: `${row.subdistrict_name ?? row.district_name} — ${row.place_name}`,
          },
        ]),
    ).values(),
  ];
  const formAction = submitBuyerRequirementAction.bind(null, {
    sourceContext: prefill.sourceContext,
  });
  return (
    <main>
      <section className="collection-hero">
        <div className="site-container py-12 sm:py-16">
          <Breadcrumbs
            items={[
              { label: t("common.home"), href: "/" },
              { label: t("requirements.breadcrumb") },
            ]}
          />
          <p className="eyebrow mt-7 text-[var(--brand-gold)]">{t("requirements.eyebrow")}</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">{t("requirements.title")}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
            {t("requirements.intro")}
          </p>
        </div>
      </section>
      <section className="section">
        <div className="site-container conversion-layout">
          <div>
            <p className="eyebrow">{t("requirements.focused")}</p>
            <h2 className="section-title">{t("requirements.focusedTitle")}</h2>
            <p className="section-copy">
              UrbanEdge will review the requirement before treating it as qualified or matching
              properties. Submitting this form does not reserve land or create an account.
            </p>
          </div>
          <BuyerRequirementForm
            action={formAction}
            idempotencyKey={randomUUID()}
            turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            prefill={prefill}
            districts={districts}
            subdistricts={subdistricts}
            places={places}
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
