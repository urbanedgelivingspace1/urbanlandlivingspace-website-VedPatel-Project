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
  const inventory = await loadFixedPublicSearch({ category: "AGRICULTURAL" }, 48);
  const quality = evaluateSeoPageQuality({
    kind: "CATEGORY",
    published: true,
    noindex: false,
    title: "Agricultural Land",
    seoTitle: "Agricultural Land in Ahmedabad & Gandhinagar | UrbanEdge",
    seoDescription:
      "Explore curated agricultural land with access, water, area and current-use context across Ahmedabad and Gandhinagar.",
    intro: categoryLandingEditorialText("AGRICULTURAL"),
    body: null,
    canonicalPath: "/agricultural-land",
    activeInventoryCount: inventory.properties.length,
    internalLinkCount: 5,
    category: "AGRICULTURAL",
  });
  return buildPublicMetadata({
    title: "Agricultural Land in Ahmedabad & Gandhinagar | UrbanEdge",
    description:
      "Explore curated agricultural land with access, water, area and current-use context across Ahmedabad and Gandhinagar.",
    path: "/agricultural-land",
    robots: quality.indexable ? INDEX_FOLLOW : NOINDEX_FOLLOW,
  });
}
export default function Page() {
  return <CategoryLanding category="AGRICULTURAL" />;
}
