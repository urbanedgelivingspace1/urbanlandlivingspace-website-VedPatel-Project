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
  const inventory = await loadFixedPublicSearch({ transaction: "LEASE" }, 48);
  const quality = evaluateSeoPageQuality({
    kind: "TRANSACTION",
    published: true,
    noindex: false,
    title: "Land for Lease",
    seoTitle: "Land for Lease in Ahmedabad & Gandhinagar",
    seoDescription:
      "Browse published land offered on lease with category, area, infrastructure and location context.",
    intro: transactionLandingEditorialText("LEASE"),
    body: null,
    canonicalPath: "/lease",
    activeInventoryCount: inventory.properties.length,
    internalLinkCount: 5,
  });
  return buildPublicMetadata({
    title: "Land for Lease in Ahmedabad & Gandhinagar",
    description:
      "Browse published land offered on lease with category, area, infrastructure and location context.",
    path: "/lease",
    robots: quality.indexable ? INDEX_FOLLOW : NOINDEX_FOLLOW,
  });
}
export default function Page() {
  return <TransactionLanding transaction="LEASE" />;
}
