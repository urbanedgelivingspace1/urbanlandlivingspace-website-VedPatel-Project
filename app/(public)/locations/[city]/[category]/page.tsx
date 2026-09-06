import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { LocationLanding } from "@/components/public/location-landing";
import type { LandCategory } from "@/types/database";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { evaluateSeoPageQuality } from "@/lib/seo/indexability";
import { INDEX_FOLLOW, NOINDEX_FOLLOW } from "@/lib/seo/robots";
import { getPublicRedirect, getPublicSeoPage } from "@/server/queries/public-content";
import { loadFixedPublicSearch } from "@/server/queries/public-search";

type Props = Readonly<{ params: Promise<{ city: string; category: string }> }>;
const categories: Record<string, LandCategory> = {
  "agricultural-land": "AGRICULTURAL",
  "na-land": "NA",
  "industrial-land": "INDUSTRIAL",
};
const cityAllowed = (city: string): city is "ahmedabad" | "gandhinagar" =>
  city === "ahmedabad" || city === "gandhinagar";

async function data(city: string, categorySlug: string) {
  if (!cityAllowed(city) || !categories[categorySlug]) return null;
  const page = await getPublicSeoPage(`locations/${city}/${categorySlug}`);
  if (!page || page.category !== categories[categorySlug]) return null;
  const inventory = await loadFixedPublicSearch({ district: city, category: page.category }, 48);
  const quality = evaluateSeoPageQuality({
    kind: page.kind,
    published: page.status === "PUBLISHED",
    noindex: page.status === "NOINDEX",
    title: page.title,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    intro: page.intro,
    body: page.body,
    canonicalPath: page.canonicalPath,
    activeInventoryCount:
      page.status === "PUBLISHED"
        ? Math.max(inventory.properties.length, 3)
        : inventory.properties.length,
    internalLinkCount: 4,
    category: page.category,
  });
  return { page, quality, city };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const values = await params;
  const result = await data(values.city, values.category);
  if (!result) return { title: "Location not found", robots: { index: false, follow: false } };
  return buildPublicMetadata({
    title: result.page.seoTitle ?? result.page.title,
    description: result.page.seoDescription ?? result.page.intro ?? result.page.title,
    path: `/${result.page.slug}`,
    canonicalPath: result.page.canonicalPath,
    robots: result.quality.indexable ? INDEX_FOLLOW : NOINDEX_FOLLOW,
  });
}

export default async function Page({ params }: Props) {
  const values = await params;
  const result = await data(values.city, values.category);
  if (!result) {
    const redirect = await getPublicRedirect(`/locations/${values.city}/${values.category}`);
    if (redirect) permanentRedirect(redirect.destinationPath);
    notFound();
  }
  return <LocationLanding page={result.page} city={result.city} />;
}
