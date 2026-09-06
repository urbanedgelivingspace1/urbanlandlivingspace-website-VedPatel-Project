import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { LocationLanding } from "@/components/public/location-landing";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { evaluateSeoPageQuality } from "@/lib/seo/indexability";
import { INDEX_FOLLOW, NOINDEX_FOLLOW } from "@/lib/seo/robots";
import { getPublicRedirect, getPublicSeoPage } from "@/server/queries/public-content";
import { loadFixedPublicSearch } from "@/server/queries/public-search";

type Props = Readonly<{ params: Promise<{ city: string }> }>;
const cityAllowed = (city: string): city is "ahmedabad" | "gandhinagar" =>
  city === "ahmedabad" || city === "gandhinagar";

async function data(city: string) {
  if (!cityAllowed(city)) return null;
  const page = await getPublicSeoPage(`locations/${city}`);
  if (!page) return null;
  const inventory = await loadFixedPublicSearch({ district: city }, 48);
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
    internalLinkCount: 5,
  });
  return { page, quality, city };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await data((await params).city);
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
  const city = (await params).city;
  const result = await data(city);
  if (!result) {
    const redirect = await getPublicRedirect(`/locations/${city}`);
    if (redirect) permanentRedirect(redirect.destinationPath);
    notFound();
  }
  return <LocationLanding page={result.page} city={result.city as "ahmedabad" | "gandhinagar"} />;
}
