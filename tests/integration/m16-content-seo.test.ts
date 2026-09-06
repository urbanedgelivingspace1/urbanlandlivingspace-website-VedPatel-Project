import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { evaluateSeoPageQuality } from "@/lib/seo/indexability";
import type { Database as GeneratedDatabase } from "@/types/database.generated";
import type { Database } from "@/types/database";

vi.mock("server-only", () => ({}));

let service: SupabaseClient<GeneratedDatabase>;
let anonymous: SupabaseClient<Database>;
const publishedGuideId = crypto.randomUUID();
const draftGuideId = crypto.randomUUID();
const marker = Date.now();
const approvedLocationId = "16000000-0000-4000-8000-000000000111";
let originalBody = "";

beforeAll(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !serviceKey || !anonKey)
    throw new Error("Local M16 integration environment is missing.");
  service = createClient<GeneratedDatabase>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  anonymous = createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const existing = await service
    .from("seo_pages")
    .select("body_markdown")
    .eq("id", approvedLocationId)
    .single();
  if (existing.error) throw existing.error;
  originalBody = existing.data.body_markdown ?? "";
  const inserted = await service.from("guides").insert([
    {
      id: publishedGuideId,
      title: `M16 published guide ${marker}`,
      slug: `m16-published-guide-${marker}`,
      excerpt: "A synthetic published guide used only by the guarded local integration suite.",
      body_markdown: Array.from({ length: 160 }, (_, index) => `published${index}`).join(" "),
      category_id: "16000000-0000-4000-8000-000000000001",
      status: "PUBLISHED",
      reviewed_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      seo_title: `M16 published guide ${marker} | UrbanEdge`,
      seo_description: "Synthetic public guide projection coverage for the guarded local suite.",
      canonical_url: `/guides/m16-published-guide-${marker}`,
    },
    {
      id: draftGuideId,
      title: `M16 private draft ${marker}`,
      slug: `m16-private-draft-${marker}`,
      excerpt: "PRIVATE_M16_DRAFT_CANARY",
      body_markdown: "PRIVATE_M16_DRAFT_BODY_CANARY",
      category_id: "16000000-0000-4000-8000-000000000001",
      status: "DRAFT",
      seo_title: "PRIVATE_M16_DRAFT_TITLE_CANARY",
      seo_description: "PRIVATE_M16_DRAFT_DESCRIPTION_CANARY",
      canonical_url: `/guides/m16-private-draft-${marker}`,
    },
  ]);
  if (inserted.error) throw inserted.error;
});

afterAll(async () => {
  if (!service) return;
  await service
    .from("seo_pages")
    .update({ status: "NOINDEX", body_markdown: originalBody })
    .eq("id", approvedLocationId);
  await service.from("guides").delete().in("id", [publishedGuideId, draftGuideId]);
});

describe.sequential("M16 content and SEO integration", () => {
  it("projects published guides but never draft content or editorial identities", async () => {
    const { data, error } = await anonymous
      .from("public_guides")
      .select("*")
      .in("id", [publishedGuideId, draftGuideId]);
    if (error) throw error;
    expect(data).toHaveLength(1);
    expect(data[0]?.id).toBe(publishedGuideId);
    expect(JSON.stringify(data)).not.toContain("PRIVATE_M16");
    expect(data[0]).not.toHaveProperty("author_admin_id");
    expect(data[0]).not.toHaveProperty("published_by");
    expect(data[0]).not.toHaveProperty("reviewed_by");
  });

  it("keeps an editor-selected NOINDEX page publicly useful without sitemap eligibility", async () => {
    const { data, error } = await anonymous
      .from("public_seo_pages")
      .select("slug,status,title")
      .eq("id", approvedLocationId)
      .single();
    if (error) throw error;
    expect(data).toMatchObject({
      slug: "locations/ahmedabad/agricultural-land",
      status: "NOINDEX",
      title: "Agricultural Land in Ahmedabad",
    });
  });

  it("connects editorial approval to a public route and deterministic indexability", async () => {
    const body = Array.from({ length: 1_010 }, (_, index) => `ahmedabad-agriculture-${index}`).join(
      " ",
    );
    const promoted = await service
      .from("seo_pages")
      .update({ status: "PUBLISHED", body_markdown: body, published_at: new Date().toISOString() })
      .eq("id", approvedLocationId);
    if (promoted.error) throw promoted.error;
    const publicRow = await anonymous
      .from("public_seo_pages")
      .select(
        "page_type,slug,status,title,intro_text,body_markdown,seo_title,seo_description,canonical_url",
      )
      .eq("id", approvedLocationId)
      .single();
    if (publicRow.error) throw publicRow.error;
    const quality = evaluateSeoPageQuality({
      kind: publicRow.data.page_type as "DISTRICT_CATEGORY",
      published: publicRow.data.status === "PUBLISHED",
      noindex: publicRow.data.status === "NOINDEX",
      title: publicRow.data.title,
      intro: publicRow.data.intro_text,
      body: publicRow.data.body_markdown,
      seoTitle: publicRow.data.seo_title,
      seoDescription: publicRow.data.seo_description,
      canonicalPath: publicRow.data.canonical_url,
      activeInventoryCount: 0,
      internalLinkCount: 4,
      category: "AGRICULTURAL",
    });
    expect(publicRow.data.slug).toBe("locations/ahmedabad/agricultural-land");
    expect(quality.indexable).toBe(true);
    expect(quality.wordCount).toBeGreaterThanOrEqual(1_000);
  });

  it("denies anonymous redirect mutation and exposes only the safe active projection", async () => {
    const rpc = await anonymous.rpc("record_seo_redirect" as never, {} as never);
    expect(rpc.error).not.toBeNull();
    const { data, error } = await anonymous.from("public_seo_redirects").select("*");
    if (error) throw error;
    expect(
      data.every(
        (row) => Object.keys(row).sort().join(",") === "destination_path,source_path,status_code",
      ),
    ).toBe(true);
  });
});
