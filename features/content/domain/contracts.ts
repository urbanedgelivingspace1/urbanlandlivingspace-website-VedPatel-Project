import type { LandCategory } from "@/types/database";

export type PublicGuide = Readonly<{
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  publishedAt: string;
  updatedAt: string;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalPath: string | null;
  hero: Readonly<{ objectPath: string; altText: string; width: number; height: number }> | null;
}>;

export type PublicGuideCategory = Readonly<{
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}>;

export type PublicSeoPage = Readonly<{
  id: string;
  kind: "DISTRICT" | "DISTRICT_CATEGORY";
  slug: string;
  districtId: string;
  category: LandCategory | null;
  title: string;
  intro: string | null;
  body: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalPath: string | null;
  publishedAt: string;
  status: "PUBLISHED" | "NOINDEX";
}>;
