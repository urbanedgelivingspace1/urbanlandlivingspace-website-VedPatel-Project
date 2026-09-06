import type { Metadata } from "next";
import { GuideIndex } from "@/components/public/guide-index";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { listPublicGuideCategories, listPublicGuides } from "@/server/queries/public-content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPublicMetadata({
  title: "Land Guides",
  description:
    "Practical land discovery, transaction and due-diligence guidance for Ahmedabad and Gandhinagar.",
  path: "/guides",
  robots: { index: true, follow: true },
});

export default async function Page() {
  const [guides, categories] = await Promise.all([listPublicGuides(), listPublicGuideCategories()]);
  return <GuideIndex guides={guides} categories={categories} />;
}
