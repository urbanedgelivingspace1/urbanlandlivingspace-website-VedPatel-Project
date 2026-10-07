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
  const inventory = await loadFixedPublicSearch({ transaction: "BUY" }, 48);
  const quality = evaluateSeoPageQuality({
    kind: "TRANSACTION",
    published: true,
    noindex: false,
    title: "Land for Purchase",
    seoTitle: "Land for Purchase in Ahmedabad & Gandhinagar",
    seoDescription:
      "Browse published land for purchase with category, area, location and transaction context.",
    intro: transactionLandingEditorialText("BUY"),
    body: null,
    canonicalPath: "/buy",
    activeInventoryCount: inventory.properties.length,
    internalLinkCount: 5,
  });
  return buildPublicMetadata({
    title: "Land for Purchase in Ahmedabad & Gandhinagar",
    description:
      "Browse published land for purchase with category, area, location and transaction context.",
    path: "/buy",
    robots: quality.indexable ? INDEX_FOLLOW : NOINDEX_FOLLOW,
  });
}
export default function Page() {
  return <TransactionLanding transaction="BUY" />;
}
