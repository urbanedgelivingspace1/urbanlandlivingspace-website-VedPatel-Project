import "server-only";

import { cache } from "react";

import type {
  PublicGuide,
  PublicGuideCategory,
  PublicSeoPage,
} from "@/features/content/domain/contracts";
import { createPublicServerClient } from "@/server/supabase/public";

const guideFields =
  "id,title,slug,excerpt,body_markdown,category_id,category_name,category_slug,published_at,updated_at,seo_title,seo_description,canonical_url,hero_object_path,hero_alt_text,hero_width_px,hero_height_px" as const;

function projectGuide(row: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body_markdown: string;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  published_at: string | null;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  hero_object_path: string | null;
  hero_alt_text: string | null;
  hero_width_px: number | null;
  hero_height_px: number | null;
}): PublicGuide {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body_markdown,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categorySlug: row.category_slug,
    publishedAt: row.published_at as string,
    updatedAt: row.updated_at,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    canonicalPath: row.canonical_url,
    hero:
      row.hero_object_path && row.hero_alt_text && row.hero_width_px && row.hero_height_px
        ? {
            objectPath: row.hero_object_path,
            altText: row.hero_alt_text,
            width: row.hero_width_px,
            height: row.hero_height_px,
          }
        : null,
  };
}

export async function listPublicGuides(categorySlug?: string): Promise<readonly PublicGuide[]> {
  const client = createPublicServerClient();
  let query = client
    .from("public_guides")
    .select(guideFields)
    .order("published_at", { ascending: false })
    .limit(100);
  if (categorySlug) query = query.eq("category_slug", categorySlug);
  const { data, error } = await query;
  if (error) throw error;
  return data.map(projectGuide);
}

export const getPublicGuide = cache(async (slug: string): Promise<PublicGuide | null> => {
  const client = createPublicServerClient();
  const { data, error } = await client
    .from("public_guides")
    .select(guideFields)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? projectGuide(data) : null;
});

export async function listPublicGuideCategories(): Promise<readonly PublicGuideCategory[]> {
  const client = createPublicServerClient();
  const { data, error } = await client
    .from("public_guide_categories")
    .select("id,name,slug,description,sort_order")
    .order("sort_order")
    .limit(50);
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: row.sort_order,
  }));
}

export const getPublicSeoPage = cache(async (slug: string): Promise<PublicSeoPage | null> => {
  const client = createPublicServerClient();
  const { data, error } = await client
    .from("public_seo_pages")
    .select(
      "id,page_type,slug,district_id,land_category,title,intro_text,body_markdown,seo_title,seo_description,canonical_url,published_at,status",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (
    !data ||
    !data.district_id ||
    (data.page_type !== "DISTRICT" && data.page_type !== "DISTRICT_CATEGORY")
  )
    return null;
  return {
    id: data.id,
    kind: data.page_type,
    slug: data.slug,
    districtId: data.district_id,
    category: data.land_category,
    title: data.title,
    intro: data.intro_text,
    body: data.body_markdown,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    canonicalPath: data.canonical_url,
    publishedAt: data.published_at as string,
    status: data.status as PublicSeoPage["status"],
  };
});

export async function listPublicSeoPages(): Promise<readonly PublicSeoPage[]> {
  const client = createPublicServerClient();
  const { data, error } = await client
    .from("public_seo_pages")
    .select(
      "id,page_type,slug,district_id,land_category,title,intro_text,body_markdown,seo_title,seo_description,canonical_url,published_at,status",
    )
    .order("slug")
    .limit(50);
  if (error) throw error;
  return data
    .filter(
      (row) =>
        row.district_id && (row.page_type === "DISTRICT" || row.page_type === "DISTRICT_CATEGORY"),
    )
    .map((row) => ({
      id: row.id,
      kind: row.page_type as PublicSeoPage["kind"],
      slug: row.slug,
      districtId: row.district_id as string,
      category: row.land_category,
      title: row.title,
      intro: row.intro_text,
      body: row.body_markdown,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      canonicalPath: row.canonical_url,
      publishedAt: row.published_at as string,
      status: row.status as PublicSeoPage["status"],
    }));
}

export async function getPublicRedirect(
  sourcePath: string,
): Promise<Readonly<{ destinationPath: string; statusCode: 301 | 308 }> | null> {
  const client = createPublicServerClient();
  const { data, error } = await client
    .from("public_seo_redirects")
    .select("destination_path,status_code")
    .eq("source_path", sourcePath)
    .maybeSingle();
  if (error) throw error;
  return data
    ? { destinationPath: data.destination_path, statusCode: data.status_code as 301 | 308 }
    : null;
}
