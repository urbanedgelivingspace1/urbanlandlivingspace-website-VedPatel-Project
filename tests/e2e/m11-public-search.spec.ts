import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

import type { Database } from "@/types/database.generated";

let exactPropertyCode = "";
let firstTitle = "";
const searchMarker = `M11 Bounded ${Date.now()}`;
const privateCanary = `PRIVATE_M11_E2E_${Date.now()}`;

async function seedSearchFixtures() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Synthetic M11 E2E environment is missing.");
  const client = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const sourceId = crypto.randomUUID();
  const source = await client.from("source_references").insert({
    id: sourceId,
    authority_name: "Synthetic M11 E2E",
    source_system: "SYNTHETIC",
    document_or_service_name: "Synthetic area source",
    source_classification: "URBANEDGE_OBSERVED",
  });
  if (source.error) throw source.error;
  const fixtures = Array.from({ length: 13 }, (_, index) => ({
    public_slug: `m11-search-${Date.now()}-${index}`,
    land_category:
      index % 3 === 0
        ? ("AGRICULTURAL" as const)
        : index % 3 === 1
          ? ("NA" as const)
          : ("INDUSTRIAL" as const),
    primary_transaction_type: index % 2 === 0 ? ("BUY" as const) : ("LEASE" as const),
    publication_status: "PUBLISHED" as const,
    availability_status: index === 12 ? ("UNDER_NEGOTIATION" as const) : ("AVAILABLE" as const),
    listing_title: `${searchMarker} property ${String(index + 1).padStart(2, "0")}`,
    short_description: "Synthetic published M11 browser fixture",
    district_id:
      index % 2 === 0
        ? "00000000-0000-4000-8000-000000000003"
        : "00000000-0000-4000-8000-000000000004",
    display_area_value: 1000 + index * 100,
    display_area_unit_id: "10000000-0000-4000-8000-000000000001",
    normalized_area_sqm: 1000 + index * 100,
    area_normalization_status: "AUTHORITATIVE" as const,
    area_source_reference_id: sourceId,
    featured: index === 0,
    location_visibility: "HIDDEN" as const,
    published_at: new Date(Date.now() - index * 60_000).toISOString(),
  }));
  const inserted = await client
    .from("properties")
    .insert(fixtures)
    .select("id,property_code,listing_title,land_category");
  if (inserted.error) throw inserted.error;
  firstTitle = inserted.data[0]?.listing_title ?? "";
  exactPropertyCode = inserted.data[0]?.property_code ?? "";
  const offers = await client.from("property_offers").insert(
    inserted.data.map((property, index) => ({
      property_id: property.id,
      transaction_type: index % 2 === 0 ? ("BUY" as const) : ("LEASE" as const),
      price_mode: "EXACT_TOTAL" as const,
      price_amount: 5_000_000 + index * 1_000_000,
      is_primary: true,
    })),
  );
  if (offers.error) throw offers.error;
  const agricultural = inserted.data
    .filter((property) => property.land_category === "AGRICULTURAL")
    .map((property) => ({
      property_id: property.id,
      tenure_type: "OLD_TENURE",
      irrigation_status: "CANAL",
    }));
  const agriculturalResult = await client.from("property_agricultural").insert(agricultural);
  if (agriculturalResult.error) throw agriculturalResult.error;
  const naResult = await client.from("property_na").insert(
    inserted.data
      .filter((property) => property.land_category === "NA")
      .map((property) => ({
        property_id: property.id,
        na_status: "APPROVED",
        na_purpose: "WAREHOUSE",
      })),
  );
  if (naResult.error) throw naResult.error;
  const industrialResult = await client.from("property_industrial").insert(
    inserted.data
      .filter((property) => property.land_category === "INDUSTRIAL")
      .map((property) => ({
        property_id: property.id,
        industrial_subtype: "LOGISTICS",
        power_status: "AVAILABLE",
      })),
  );
  if (industrialResult.error) throw industrialResult.error;
  const draft = await client.from("properties").insert({
    public_slug: `m11-private-${Date.now()}`,
    land_category: "AGRICULTURAL",
    primary_transaction_type: "BUY",
    publication_status: "DRAFT",
    availability_status: "AVAILABLE",
    listing_title: privateCanary,
    short_description: privateCanary,
    district_id: "00000000-0000-4000-8000-000000000003",
    display_area_value: 1,
    display_area_unit_id: "10000000-0000-4000-8000-000000000006",
    location_visibility: "HIDDEN",
  });
  if (draft.error) throw draft.error;
}

test.describe.configure({ mode: "serial" });
test.beforeAll(seedSearchFixtures);

test("home search, keyword results and exact Property ID share the canonical route", async ({
  page,
}) => {
  await page.goto("/");
  const form = page.locator(".discovery-panel .search-entry-form");
  await form.getByPlaceholder("Location, landmark or Property ID").fill(searchMarker);
  await form.getByRole("button", { name: "Search land" }).click();
  await expect(page).toHaveURL(/\/properties\?q=M11\+Bounded/);
  await expect(page.getByText(firstTitle, { exact: true })).toBeVisible();
  const desktopFilters = page.locator(".search-workspace > .search-filter-rail");
  await desktopFilters.getByLabel("Keyword or Property ID").fill(exactPropertyCode);
  await desktopFilters.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(new RegExp(`propertyId=${exactPropertyCode}`));
  await expect(page.locator(".property-card")).toHaveCount(1);
});

test("filters use URL state, category facets, removable chips and deterministic sort", async ({
  page,
}) => {
  await page.goto(`/properties?q=${encodeURIComponent(searchMarker)}&category=agricultural`);
  await expect(page.getByRole("link", { name: /Category: AGRICULTURAL/ })).toBeVisible();
  await expect(
    page.locator(".search-workspace > .search-filter-rail").getByLabel("Tenure"),
  ).toBeVisible();
  await page.locator(".search-sort select").selectOption("price-desc");
  await page.locator(".search-sort").getByRole("button", { name: "Sort" }).click();
  await expect(page).toHaveURL(/sort=price-desc/);
  await page.getByRole("link", { name: /Category: AGRICULTURAL/ }).click();
  await expect(page).not.toHaveURL(/category=/);
});

test("numbered pagination preserves filters and out-of-range pages are true 404s", async ({
  page,
  request,
}) => {
  await page.goto(`/properties?q=${encodeURIComponent(searchMarker)}`);
  await expect(page.locator(".property-card")).toHaveCount(12);
  await page.getByRole("link", { name: "2", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator(".property-card")).toHaveCount(1);
  expect(
    (await request.get(`/properties?q=${encodeURIComponent(searchMarker)}&page=100`)).status(),
  ).toBe(404);
});

test("zero results recover safely and unpublished content never appears", async ({ page }) => {
  await page.goto(`/properties?q=${privateCanary}`);
  await expect(page.getByRole("heading", { name: /No published land matches/ })).toBeVisible();
  await expect(page.locator(".property-card").getByText(privateCanary)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Share a requirement" })).toHaveAttribute(
    "href",
    "/requirements",
  );
});

test("canonical normalization, fast search redirect and filtered SEO are stable", async ({
  page,
  request,
}) => {
  await page.goto("/properties?page=1&sort=recommended&unknown=drop");
  await expect(page).toHaveURL(/\/properties$/);
  await page.goto(`/search?q=${encodeURIComponent(searchMarker)}`);
  await expect(page).toHaveURL(/\/properties\?q=/);
  const response = await request.get(`/properties?category=na`);
  const html = await response.text();
  expect(html).toContain('name="robots" content="noindex, follow"');
  expect(html).toContain("/properties?category=na");
});

test("mobile filter sheet is keyboard-dismissable, accessible and overflow-safe", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/properties");
  await page.getByRole("button", { name: "Filters" }).click();
  await expect(page.getByRole("dialog", { name: "Property filters" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  const violations = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
  expect(violations.violations).toEqual([]);
});
