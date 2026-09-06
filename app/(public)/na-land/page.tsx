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
  const inventory = await loadFixedPublicSearch({ category: "NA" }, 48);
  const quality = evaluateSeoPageQuality({
    kind: "CATEGORY",
    published: true,
    noindex: false,
    title: "NA Land",
    seoTitle: "NA Land in Ahmedabad & Gandhinagar | UrbanEdge",
    seoDescription:
      "Explore curated NA land with carefully scoped status, planning, access and utility context.",
    intro: categoryLandingEditorialText("NA"),
    body: null,
    canonicalPath: "/na-land",
    activeInventoryCount: inventory.properties.length,
    internalLinkCount: 5,
    category: "NA",
  });
  return buildPublicMetadata({
    title: "NA Land in Ahmedabad & Gandhinagar | UrbanEdge",
    description:
      "Explore curated NA land with carefully scoped status, planning, access and utility context.",
    path: "/na-land",
    robots: quality.indexable ? INDEX_FOLLOW : NOINDEX_FOLLOW,
  });
}
export default function Page() {
  return <CategoryLanding category="NA" />;
}
