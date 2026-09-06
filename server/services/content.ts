import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { GuideInput, SeoPageInput } from "@/features/content/domain/validation";
import {
  markdownWordCount,
  evaluateSeoPageQuality,
  normalizedContentSimilarity,
} from "@/lib/seo/indexability";
import { requireActiveAdmin } from "@/server/auth/authorization";
import { createPrivilegedServerClient } from "@/server/supabase/privileged";
import type { Database } from "@/types/database.generated";

type Db = SupabaseClient<Database>;
const client = () => createPrivilegedServerClient() as unknown as Db;

export type AdminGuide = Database["public"]["Tables"]["guides"]["Row"] &
  Readonly<{ category_name?: string | null }>;
export type AdminSeoPage = Database["public"]["Tables"]["seo_pages"]["Row"];

export async function listAdminGuides() {
  await requireActiveAdmin();
  const { data, error } = await client()
    .from("guides")
    .select("*,guide_categories(name)")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data;
}

export async function getAdminGuide(id: string) {
  await requireActiveAdmin();
  const { data, error } = await client().from("guides").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function listAdminGuideCategories() {
  await requireActiveAdmin();
  const { data, error } = await client()
    .from("guide_categories")
    .select("id,name,slug")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function saveGuide(id: string | null, input: GuideInput) {
  const admin = await requireActiveAdmin();
  const db = client();
  const existing = id
    ? await db.from("guides").select("slug,status,published_at").eq("id", id).maybeSingle()
    : null;
  if (existing?.error) throw existing.error;
  if (id && existing?.data?.published_at && existing.data.slug !== input.slug) {
    const { error } = await db.rpc("migrate_published_guide_slug", {
      requested_actor_id: admin.userId,
      requested_guide_id: id,
      requested_new_slug: input.slug,
    });
    if (error) throw error;
  }
  const record = {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt || null,
    body_markdown: input.bodyMarkdown,
    category_id: input.categoryId || null,
    seo_title: input.seoTitle || null,
    seo_description: input.seoDescription || null,
    canonical_url: `/guides/${input.slug}`,
    hero_storage_bucket: input.heroObjectPath ? "guide-media-public" : null,
    hero_object_path: input.heroObjectPath || null,
    hero_alt_text: input.heroAltText || null,
    hero_width_px: input.heroWidth ?? null,
    hero_height_px: input.heroHeight ?? null,
    updated_by: admin.userId,
  };
  if (id) {
    const { error } = await db.from("guides").update(record).eq("id", id);
    if (error) throw error;
    return id;
  }
  const { data, error } = await db
    .from("guides")
    .insert({ ...record, status: "DRAFT", created_by: admin.userId })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function setGuideStatus(id: string, next: "REVIEW" | "PUBLISHED" | "UNPUBLISHED") {
  const admin = await requireActiveAdmin();
  const db = client();
  const { data: guide, error } = await db
    .from("guides")
    .select("title,slug,excerpt,body_markdown,seo_title,seo_description,status")
    .eq("id", id)
    .single();
  if (error) throw error;
  if (next === "PUBLISHED") {
    if (guide.status !== "REVIEW") throw new Error("Move the guide to review before publishing.");
    if (
      markdownWordCount(guide.body_markdown) < 150 ||
      !guide.excerpt ||
      !guide.seo_title ||
      !guide.seo_description
    )
      throw new Error(
        "Published guides require useful body content, excerpt and complete SEO fields.",
      );
  }
  const now = new Date().toISOString();
  const changes =
    next === "REVIEW"
      ? { status: next, reviewed_at: now, reviewed_by: admin.userId, updated_by: admin.userId }
      : next === "PUBLISHED"
        ? { status: next, published_at: now, published_by: admin.userId, updated_by: admin.userId }
        : { status: next, updated_by: admin.userId };
  const { error: updateError } = await db.from("guides").update(changes).eq("id", id);
  if (updateError) throw updateError;
}

export async function listAdminSeoPages() {
  await requireActiveAdmin();
  const { data, error } = await client()
    .from("seo_pages")
    .select("*")
    .is("archived_at", null)
    .order("slug")
    .limit(50);
  if (error) throw error;
  return data;
}

export async function getAdminSeoPage(id: string) {
  await requireActiveAdmin();
  const { data, error } = await client().from("seo_pages").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveSeoPage(id: string, input: SeoPageInput) {
  const admin = await requireActiveAdmin();
  const { error } = await client()
    .from("seo_pages")
    .update({
      title: input.title,
      intro_text: input.introText,
      body_markdown: input.bodyMarkdown,
      seo_title: input.seoTitle,
      seo_description: input.seoDescription,
      updated_by: admin.userId,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function setSeoPageStatus(id: string, status: "REVIEW" | "PUBLISHED" | "NOINDEX") {
  const admin = await requireActiveAdmin();
  const changes =
    status === "PUBLISHED"
      ? {
          status,
          published_at: new Date().toISOString(),
          published_by: admin.userId,
          updated_by: admin.userId,
        }
      : { status, updated_by: admin.userId };
  const { error } = await client().from("seo_pages").update(changes).eq("id", id);
  if (error) throw error;
}

export async function listSeoRedirects() {
  await requireActiveAdmin();
  const { data, error } = await client()
    .from("seo_redirects")
    .select("id,source_path,destination_path,status_code,entity_type,is_active,updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data;
}

export async function recordSeoRedirect(
  sourcePath: string,
  destinationPath: string,
  entityType: "PROPERTY" | "GUIDE" | "SEO_PAGE" | "ROUTE",
  entityId?: string,
) {
  const admin = await requireActiveAdmin();
  const { error } = await client().rpc("record_seo_redirect", {
    requested_actor_id: admin.userId,
    requested_source_path: sourcePath,
    requested_destination_path: destinationPath,
    requested_entity_type: entityType,
    requested_entity_id: entityId ?? undefined,
  });
  if (error) throw error;
}

export async function seoPageAdminQuality(
  page: AdminSeoPage,
  activeInventoryCount: number,
  siblings: readonly AdminSeoPage[],
  preservePublishedApproval = page.status === "PUBLISHED",
) {
  const quality = evaluateSeoPageQuality({
    kind: page.page_type as "DISTRICT" | "DISTRICT_CATEGORY",
    published: page.status === "PUBLISHED",
    noindex: page.status === "NOINDEX",
    title: page.title,
    seoTitle: page.seo_title,
    seoDescription: page.seo_description,
    intro: page.intro_text,
    body: page.body_markdown,
    canonicalPath: page.canonical_url,
    activeInventoryCount: preservePublishedApproval
      ? Math.max(activeInventoryCount, 3)
      : activeInventoryCount,
    internalLinkCount: page.land_category ? 4 : 5,
    category: page.land_category,
  });
  const duplicate = siblings.some(
    (sibling) =>
      sibling.id !== page.id &&
      normalizedContentSimilarity(page.body_markdown ?? "", sibling.body_markdown ?? "") >= 0.7,
  );
  return { ...quality, duplicateWarning: duplicate };
}
