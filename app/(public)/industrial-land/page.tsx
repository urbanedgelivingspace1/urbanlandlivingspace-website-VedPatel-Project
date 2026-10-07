import type { Metadata } from "next";
import {
  CategoryLanding,
  categoryLandingEditorialText,
} from "@/components/public/category-landing";
import { evaluateSeoPageQuality } from "@/lib/seo/indexability";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { INDEX_FOLLOW, NOINDEX_FOLLOW } from "@/lib/seo/robots";
import { loadFixedPublicSearch } from "@/server/queries/public-search";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const inventory = await loadFixedPublicSearch({ category: "INDUSTRIAL" }, 48);
  const quality = evaluateSeoPageQuality({
    kind: "CATEGORY",
    published: true,
    noindex: false,
    title: "Industrial Land",
    seoTitle: "Industrial Land in Ahmedabad & Gandhinagar",
    seoDescription:
      "Explore industrial land with estate, authority, infrastructure and connectivity context.",
    intro: categoryLandingEditorialText("INDUSTRIAL"),
    body: null,
    canonicalPath: "/industrial-land",
    activeInventoryCount: inventory.properties.length,
    internalLinkCount: 5,
    category: "INDUSTRIAL",
  });
  return buildPublicMetadata({
    title: "Industrial Land in Ahmedabad & Gandhinagar",
    description:
      "Explore industrial land with estate, authority, infrastructure and connectivity context.",
    path: "/industrial-land",
    robots: quality.indexable ? INDEX_FOLLOW : NOINDEX_FOLLOW,
  });
}
export default function Page() {
  return <CategoryLanding category="INDUSTRIAL" />;
}
