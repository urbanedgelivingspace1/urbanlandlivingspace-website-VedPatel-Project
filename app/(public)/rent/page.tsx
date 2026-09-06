import type { Metadata } from "next";
import {
  TransactionLanding,
  transactionLandingEditorialText,
} from "@/components/public/transaction-landing";
import { evaluateSeoPageQuality } from "@/lib/seo/indexability";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { INDEX_FOLLOW, NOINDEX_FOLLOW } from "@/lib/seo/robots";
import { loadFixedPublicSearch } from "@/server/queries/public-search";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const inventory = await loadFixedPublicSearch({ transaction: "RENT" }, 48);
  const quality = evaluateSeoPageQuality({
    kind: "TRANSACTION",
    published: true,
    noindex: false,
    title: "Land for Rent",
    seoTitle: "Land for Rent in Ahmedabad & Gandhinagar | UrbanEdge",
    seoDescription:
      "Browse published rental land with practical area, location, use and commercial context.",
    intro: transactionLandingEditorialText("RENT"),
    body: null,
    canonicalPath: "/rent",
    activeInventoryCount: inventory.properties.length,
    internalLinkCount: 5,
  });
  return buildPublicMetadata({
    title: "Land for Rent in Ahmedabad & Gandhinagar | UrbanEdge",
    description:
      "Browse published rental land with practical area, location, use and commercial context.",
    path: "/rent",
    robots: quality.indexable ? INDEX_FOLLOW : NOINDEX_FOLLOW,
  });
}
export default function Page() {
  return <TransactionLanding transaction="RENT" />;
}
