import type { MetadataRoute } from "next";

import { categoryLandingEditorialText } from "@/components/public/category-landing";
import { transactionLandingEditorialText } from "@/components/public/transaction-landing";
import { absoluteCanonical, approvedSameSitePath } from "@/lib/seo/canonical";
import { evaluateSeoPageQuality, isGuideCategoryIndexable } from "@/lib/seo/indexability";
import { staticIndexablePaths } from "@/lib/seo/sitemap";
import { isProductionIndexable } from "@/lib/seo/robots";
import { createPublicServerClient } from "@/server/supabase/public";
import {
  listPublicGuideCategories,
  listPublicGuides,
  listPublicSeoPages,
} from "@/server/queries/public-content";
import { loadFixedPublicSearch } from "@/server/queries/public-search";
import type { LandCategory, TransactionType } from "@/types/database";

const curatedCategoryRoutes: readonly Readonly<{ category: LandCategory; path: string }>[] = [
  { category: "AGRICULTURAL", path: "/agricultural-land" },
  { category: "NA", path: "/na-land" },
  { category: "INDUSTRIAL", path: "/industrial-land" },
];
const curatedTransactionRoutes: readonly Readonly<{
  transaction: TransactionType;
  path: string;
}>[] = [
  { transaction: "BUY", path: "/buy" },
  { transaction: "RENT", path: "/rent" },
  { transaction: "LEASE", path: "/lease" },
];

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isProductionIndexable()) return [];
  const client = createPublicServerClient();
  const [{ data: properties, error }, guides, guideCategories, seoPages] = await Promise.all([
    client
      .from("public_property_indexability")
      .select("canonical_path,updated_at")
      .order("updated_at", { ascending: false })
      .limit(10_000),
    listPublicGuides(),
    listPublicGuideCategories(),
    listPublicSeoPages(),
  ]);
  if (error) throw error;
  const locationEntries = await Promise.all(
    seoPages.map(async (page) => {
      const district = page.slug.includes("gandhinagar") ? "gandhinagar" : "ahmedabad";
      const inventory = await loadFixedPublicSearch(
        { district, category: page.category ?? undefined },
        48,
      );
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
        internalLinkCount: page.category ? 4 : 5,
        category: page.category,
      });
      return quality.indexable
        ? {
            url: absoluteCanonical(`/${page.slug}`),
            lastModified: page.publishedAt,
            changeFrequency: "weekly" as const,
            priority: page.category ? 0.7 : 0.8,
          }
        : null;
    }),
  );
  const categoryEntries = await Promise.all(
    curatedCategoryRoutes.map(async ({ category, path }) => {
      const inventory = await loadFixedPublicSearch({ category }, 48);
      const quality = evaluateSeoPageQuality({
        kind: "CATEGORY",
        published: true,
        noindex: false,
        title: path,
        seoTitle: path,
        seoDescription: path,
        intro: categoryLandingEditorialText(category),
        body: null,
        canonicalPath: path,
        activeInventoryCount: inventory.properties.length,
        internalLinkCount: 5,
        category,
      });
      return quality.indexable ? path : null;
    }),
  );
  const transactionEntries = await Promise.all(
    curatedTransactionRoutes.map(async ({ transaction, path }) => {
      const inventory = await loadFixedPublicSearch({ transaction }, 48);
      const quality = evaluateSeoPageQuality({
        kind: "TRANSACTION",
        published: true,
        noindex: false,
        title: path,
        seoTitle: path,
        seoDescription: path,
        intro: transactionLandingEditorialText(transaction),
        body: null,
        canonicalPath: path,
        activeInventoryCount: inventory.properties.length,
        internalLinkCount: 5,
      });
      return quality.indexable ? path : null;
    }),
  );
  const unique = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const path of staticIndexablePaths)
    unique.set(absoluteCanonical(path), {
      url: absoluteCanonical(path),
      changeFrequency: path === "/" ? "daily" : "weekly",
      priority: path === "/" ? 1 : 0.7,
    });
  for (const property of properties ?? [])
    if (property.canonical_path) {
      const path = approvedSameSitePath(property.canonical_path, property.canonical_path);
      unique.set(absoluteCanonical(path), {
        url: absoluteCanonical(path),
        lastModified: property.updated_at ?? undefined,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  for (const guide of guides)
    unique.set(absoluteCanonical(`/guides/${guide.slug}`), {
      url: absoluteCanonical(`/guides/${guide.slug}`),
      lastModified: guide.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  for (const category of guideCategories) {
    const categoryGuides = guides.filter((guide) => guide.categorySlug === category.slug);
    if (isGuideCategoryIndexable(category.description, categoryGuides)) {
      const path = `/guides/category/${category.slug}`;
      unique.set(absoluteCanonical(path), {
        url: absoluteCanonical(path),
        lastModified: categoryGuides[0]?.updatedAt,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }
  for (const path of [...categoryEntries, ...transactionEntries])
    if (path)
      unique.set(absoluteCanonical(path), {
        url: absoluteCanonical(path),
        changeFrequency: "weekly",
        priority: 0.7,
      });
  for (const entry of locationEntries) if (entry) unique.set(entry.url, entry);
  return [...unique.values()];
}
