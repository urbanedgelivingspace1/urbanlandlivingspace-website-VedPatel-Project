import AxeBuilder from "@axe-core/playwright";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

import type { Database } from "@/types/database.generated";

const marker = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const privateCanary = `PRIVATE_M16_EXACT_LOCATION_${marker}`;
const propertyIds: string[] = [];
let publishedPropertySlug = "";
let draftPropertySlug = "";
let draftGuideSlug = "";
let service: SupabaseClient<Database>;
let originalSeoBody = "";
let originalSeoStatus: Database["public"]["Enums"]["seo_page_status"] = "NOINDEX";
const promotedSeoId = "16000000-0000-4000-8000-000000000111";

async function insertOrThrow<T>(
  promise: PromiseLike<{ data: T; error: { message: string } | null }>,
): Promise<NonNullable<T>> {
  const result = await promise;
  if (result.error) throw new Error(result.error.message);
  if (result.data == null) throw new Error("Synthetic M16 database operation returned no data.");
  return result.data;
}

async function executeOrThrow(
  promise: PromiseLike<{ error: { message: string } | null }>,
): Promise<void> {
  const result = await promise;
  if (result.error) throw new Error(result.error.message);
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Synthetic M16 E2E environment is missing.");
  service = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const currentSeo = await insertOrThrow(
    service.from("seo_pages").select("body_markdown,status").eq("id", promotedSeoId).single(),
  );
  originalSeoBody = currentSeo.body_markdown ?? "";
  originalSeoStatus = currentSeo.status;
  const approvedBody = Array.from(
    { length: 1_010 },
    (_, index) => `ahmedabad-agricultural-context-${index}`,
  ).join(" ");
  await executeOrThrow(
    service
      .from("seo_pages")
      .update({
        status: "PUBLISHED",
        body_markdown: approvedBody,
        published_at: new Date().toISOString(),
      })
      .eq("id", promotedSeoId)
      .select("id")
      .single(),
  );

  const properties = await insertOrThrow(
    service
      .from("properties")
      .insert(
        Array.from({ length: 3 }, (_, index) => ({
          public_slug: `m16-public-agricultural-${marker}-${index + 1}`,
          land_category: "AGRICULTURAL" as const,
          primary_transaction_type: "BUY" as const,
          publication_status: "PUBLISHED" as const,
          availability_status: "AVAILABLE" as const,
          listing_title: `M16 published agricultural land ${index + 1}`,
          short_description: "Synthetic public M16 crawl and content fixture.",
          description:
            "A public-safe synthetic property used only by the guarded local test suite.",
          district_id: "00000000-0000-4000-8000-000000000003",
          display_area_value: index + 1,
          display_area_unit_id: "10000000-0000-4000-8000-000000000006",
          location_visibility: "HIDDEN" as const,
          seo_title: `M16 public agricultural property ${index + 1}`,
          seo_description: "Public-safe M16 property metadata without private coordinates.",
          canonical_path: `/properties/m16-public-agricultural-${marker}-${index + 1}`,
          published_at: new Date().toISOString(),
        })),
      )
      .select("id,public_slug"),
  );
  propertyIds.push(...properties.map(({ id }) => id));
  publishedPropertySlug = properties[0]?.public_slug ?? "";
  await executeOrThrow(
    service.from("property_agricultural").insert(
      properties.map(({ id }) => ({
        property_id: id,
        tenure_type: "RECORDED_CONTEXT",
        irrigation_status: "TO_BE_CONFIRMED",
      })),
    ),
  );
  await executeOrThrow(
    service.from("property_offers").insert(
      properties.map(({ id }) => ({
        property_id: id,
        transaction_type: "BUY" as const,
        price_mode: "PRICE_ON_REQUEST" as const,
        is_primary: true,
      })),
    ),
  );
  await executeOrThrow(
    service.from("property_locations").insert({
      property_id: properties[0]!.id,
      private_latitude: 23.022505,
      private_longitude: 72.571365,
      public_latitude: null,
      public_longitude: null,
      location_visibility: "HIDDEN",
      location_notes: privateCanary,
    }),
  );
  const draft = await insertOrThrow(
    service
      .from("properties")
      .insert({
        public_slug: `m16-private-property-${marker}`,
        land_category: "AGRICULTURAL",
        primary_transaction_type: "BUY",
        publication_status: "DRAFT",
        availability_status: "AVAILABLE",
        listing_title: `PRIVATE_M16_PROPERTY_TITLE_${marker}`,
        description: `PRIVATE_M16_PROPERTY_BODY_${marker}`,
        district_id: "00000000-0000-4000-8000-000000000003",
        display_area_value: 1,
        display_area_unit_id: "10000000-0000-4000-8000-000000000006",
        location_visibility: "HIDDEN",
      })
      .select("id,public_slug")
      .single(),
  );
  propertyIds.push(draft.id);
  draftPropertySlug = draft.public_slug ?? "";

  draftGuideSlug = `m16-private-guide-${marker}`;
  await insertOrThrow(
    service
      .from("guides")
      .insert({
        title: `M16 private draft guide ${marker}`,
        slug: draftGuideSlug,
        excerpt: `PRIVATE_M16_GUIDE_EXCERPT_${marker}`,
        body_markdown: `PRIVATE_M16_GUIDE_BODY_${marker}`,
        category_id: "16000000-0000-4000-8000-000000000001",
        status: "DRAFT",
        seo_title: `PRIVATE_M16_GUIDE_TITLE_${marker}`,
        seo_description: `PRIVATE_M16_GUIDE_DESCRIPTION_${marker}`,
        canonical_url: `/guides/${draftGuideSlug}`,
      })
      .select("id")
      .single(),
  );
});

test.afterAll(async () => {
  if (!service) return;
  await service
    .from("seo_pages")
    .update({ status: originalSeoStatus, body_markdown: originalSeoBody })
    .eq("id", promotedSeoId);
  await service.from("guides").delete().eq("slug", draftGuideSlug);
  if (propertyIds.length) {
    await service.from("property_locations").delete().in("property_id", propertyIds);
    await service.from("property_offers").delete().in("property_id", propertyIds);
    await service.from("property_agricultural").delete().in("property_id", propertyIds);
    await service.from("properties").delete().in("id", propertyIds);
  }
});

test("Ahmedabad and Gandhinagar district landings render useful server content", async ({
  page,
}) => {
  for (const city of ["ahmedabad", "gandhinagar"] as const) {
    await page.goto(`/locations/${city}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      city === "ahmedabad" ? "Ahmedabad" : "Gandhinagar",
    );
    await expect(page.getByRole("heading", { name: "Useful next steps" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Share your requirement/ })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://urbanedgelandspace.com/locations/${city}`,
    );
  }
});

test("all six approved location-category routes work and link to relevant discovery", async ({
  page,
}) => {
  const routes = [
    ["ahmedabad", "agricultural-land", "Agricultural Land in Ahmedabad"],
    ["ahmedabad", "na-land", "NA Land in Ahmedabad"],
    ["ahmedabad", "industrial-land", "Industrial Land in Ahmedabad"],
    ["gandhinagar", "agricultural-land", "Agricultural Land in Gandhinagar"],
    ["gandhinagar", "na-land", "NA Land in Gandhinagar"],
    ["gandhinagar", "industrial-land", "Industrial Land in Gandhinagar"],
  ] as const;
  for (const [city, category, heading] of routes) {
    await page.goto(`/locations/${city}/${category}`);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.getByRole("link", { name: /Refine this published search/ })).toHaveAttribute(
      "href",
      new RegExp(`district=${city}`),
    );
  }
});

test("guarded test deployments keep routes non-indexable", async ({ request }) => {
  const agricultural = await request.get("/agricultural-land");
  expect(await agricultural.text()).toContain('name="robots" content="noindex, nofollow"');
  const buy = await request.get("/buy");
  expect(await buy.text()).toContain('name="robots" content="noindex, nofollow"');
  const filtered = await request.get("/properties?category=na&district=ahmedabad");
  const filteredHtml = await filtered.text();
  expect(filteredHtml).toContain('name="robots" content="noindex, follow"');
  expect(filteredHtml).toContain("/properties?category=na&amp;district=ahmedabad");
});

test("property metadata and JSON-LD never expose hidden exact location", async ({ request }) => {
  const response = await request.get(`/properties/${publishedPropertySlug}`);
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain(`https://urbanedgelandspace.com/properties/${publishedPropertySlug}`);
  expect(html).toContain("https://schema.org/InStock");
  expect(html).not.toContain(privateCanary);
  expect(html).not.toContain("23.022505");
  expect(html).not.toContain("72.571365");
  expect((await request.get(`/properties/${draftPropertySlug}`)).status()).toBe(404);
});

test("guarded test deployments expose an empty sitemap", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  const xml = await response.text();
  expect(response.status()).toBe(200);
  expect(xml).toContain("<urlset");
  expect(xml).not.toContain("<url>");
});

test("published guide renders while draft guide and admin content remain inaccessible", async ({
  page,
  request,
}) => {
  await page.goto("/guides/practical-checklist-before-enquiring-about-land");
  await expect(page.getByRole("heading", { level: 1, name: /practical checklist/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Start with the intended use" })).toBeVisible();
  expect((await request.get(`/guides/${draftGuideSlug}`)).status()).toBe(404);
  const admin = await request.get("/admin/guides", { maxRedirects: 0 });
  expect([302, 303, 307, 308]).toContain(admin.status());
});

test("visible and structured breadcrumbs agree", async ({ page }) => {
  await page.goto("/locations/ahmedabad/agricultural-land");
  const visible = await page
    .getByRole("navigation", { name: "Breadcrumb" })
    .locator("li")
    .allTextContents();
  const structured = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((nodes) =>
      nodes
        .map((node) => JSON.parse(node.textContent ?? "{}"))
        .find((value) => value["@type"] === "BreadcrumbList"),
    );
  expect(structured.itemListElement.map((item: { name: string }) => item.name)).toEqual(
    visible.map((value) => value.trim()),
  );
});

test("mobile content remains overflow-safe and passes automated accessibility", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/locations/ahmedabad/agricultural-land");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations).toEqual([]);
});
