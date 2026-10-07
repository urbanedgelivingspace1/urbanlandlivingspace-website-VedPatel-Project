import AxeBuilder from "@axe-core/playwright";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";

import type { Database } from "@/types/database.generated";

type Fixture = Readonly<{ id: string; slug: string; title: string }>;

let agricultural: Fixture;
let naLand: Fixture;
let industrial: Fixture;
let unpublishedSlug: string;
const privateLatitudeCanary = "23.022505";
const privateLongitudeCanary = "72.571365";
const privateNoteCanary = "PRIVATE_M10_LOCATION_NOTE_CANARY";

function environment() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.E2E_ADMIN_EMAIL;
  if (!url || !serviceKey || !email) throw new Error("Synthetic M10 E2E environment is missing.");
  return { url, serviceKey, email };
}

async function serviceContext() {
  const { url, serviceKey, email } = environment();
  const client = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const users = await client.auth.admin.listUsers();
  if (users.error) throw users.error;
  const actor = users.data.users.find((user) => user.email === email);
  if (!actor) throw new Error("Synthetic M10 actor was not found.");
  return { client, actorId: actor.id };
}

async function insertOrThrow<T>(
  promise: PromiseLike<{ data: T; error: { message: string } | null }>,
) {
  const result = await promise;
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

async function createPublicFixtures(client: SupabaseClient<Database>, actorId: string) {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const districtId = "00000000-0000-4000-8000-000000000003";
  const acreId = "10000000-0000-4000-8000-000000000006";
  const publishedAt = new Date().toISOString();
  const properties = await insertOrThrow(
    client
      .from("properties")
      .insert([
        {
          public_slug: `synthetic-m10-agricultural-${unique}`,
          land_category: "AGRICULTURAL",
          primary_transaction_type: "BUY",
          publication_status: "PUBLISHED",
          availability_status: "AVAILABLE",
          listing_title: `Synthetic Sanand agricultural opportunity ${unique}`,
          short_description: "Synthetic published agricultural land used only for M10 E2E.",
          description: "A synthetic agricultural property with approved public facts and media.",
          district_id: districtId,
          public_address: "Sanand area, Ahmedabad district",
          display_area_value: 2.5,
          display_area_unit_id: acreId,
          featured: true,
          location_visibility: "APPROXIMATE",
          canonical_path: `/properties/synthetic-m10-agricultural-${unique}`,
          published_at: publishedAt,
          published_by: actorId,
          created_by: actorId,
          updated_by: actorId,
        },
        {
          public_slug: `synthetic-m10-na-${unique}`,
          land_category: "NA",
          primary_transaction_type: "RENT",
          publication_status: "PUBLISHED",
          availability_status: "AVAILABLE",
          listing_title: `Synthetic Ahmedabad NA land ${unique}`,
          short_description: "Synthetic published NA land used only for M10 E2E.",
          description: "A synthetic NA property with deliberately hidden map information.",
          district_id: districtId,
          display_area_value: 1.25,
          display_area_unit_id: acreId,
          featured: false,
          location_visibility: "HIDDEN",
          published_at: publishedAt,
          published_by: actorId,
          created_by: actorId,
          updated_by: actorId,
        },
        {
          public_slug: `synthetic-m10-industrial-${unique}`,
          land_category: "INDUSTRIAL",
          primary_transaction_type: "LEASE",
          publication_status: "PUBLISHED",
          availability_status: "LEASED",
          listing_title: `Synthetic industrial land reference ${unique}`,
          short_description: "Synthetic closed industrial listing used only for M10 E2E.",
          description: "A retained synthetic industrial property page in a closed state.",
          district_id: districtId,
          public_address: "Ahmedabad industrial area",
          display_area_value: 4,
          display_area_unit_id: acreId,
          featured: false,
          location_visibility: "EXACT",
          published_at: publishedAt,
          published_by: actorId,
          created_by: actorId,
          updated_by: actorId,
        },
        {
          public_slug: `synthetic-m10-unpublished-${unique}`,
          land_category: "AGRICULTURAL",
          primary_transaction_type: "BUY",
          publication_status: "DRAFT",
          availability_status: "AVAILABLE",
          listing_title: "PRIVATE_M10_DRAFT_TITLE_CANARY",
          description: "PRIVATE_M10_DRAFT_DESCRIPTION_CANARY",
          district_id: districtId,
          display_area_value: 1,
          display_area_unit_id: acreId,
          featured: false,
          location_visibility: "HIDDEN",
          created_by: actorId,
          updated_by: actorId,
        },
      ])
      .select("id,public_slug,listing_title,publication_status"),
  );
  if (!properties) throw new Error("M10 properties were not created.");
  const fixtureFor = (category: "AGRICULTURAL" | "NA" | "INDUSTRIAL") => {
    const row = properties.find(
      (property) =>
        property.publication_status === "PUBLISHED" &&
        property.public_slug?.includes(category.toLowerCase()),
    );
    if (!row?.public_slug || !row.listing_title) throw new Error(`Missing ${category} fixture.`);
    return { id: row.id, slug: row.public_slug, title: row.listing_title };
  };
  agricultural = fixtureFor("AGRICULTURAL");
  naLand = fixtureFor("NA");
  industrial = fixtureFor("INDUSTRIAL");
  unpublishedSlug = properties.find((property) => property.publication_status === "DRAFT")
    ?.public_slug as string;

  await insertOrThrow(
    client.from("property_locations").insert([
      {
        property_id: agricultural.id,
        private_latitude: Number(privateLatitudeCanary),
        private_longitude: Number(privateLongitudeCanary),
        public_latitude: 22.99,
        public_longitude: 72.38,
        location_visibility: "APPROXIMATE",
        public_accuracy_m: 2_000,
        location_notes: privateNoteCanary,
      },
      {
        property_id: naLand.id,
        private_latitude: 23.08,
        private_longitude: 72.62,
        public_latitude: null,
        public_longitude: null,
        location_visibility: "HIDDEN",
        location_notes: "PRIVATE_M10_HIDDEN_NOTE_CANARY",
      },
      {
        property_id: industrial.id,
        private_latitude: 22.95,
        private_longitude: 72.5,
        public_latitude: 22.95,
        public_longitude: 72.5,
        location_visibility: "EXACT",
      },
    ]),
  );
  await insertOrThrow(
    client.from("property_offers").insert([
      {
        property_id: agricultural.id,
        transaction_type: "BUY",
        price_mode: "EXACT_TOTAL",
        currency_code: "INR",
        price_amount: 12_500_000,
        is_negotiable: true,
        is_primary: true,
      },
      {
        property_id: naLand.id,
        transaction_type: "RENT",
        price_mode: "PRICE_ON_REQUEST",
        currency_code: "INR",
        is_negotiable: false,
        is_primary: true,
      },
      {
        property_id: industrial.id,
        transaction_type: "LEASE",
        price_mode: "PRICE_RANGE",
        currency_code: "INR",
        price_min: 8_000_000,
        price_max: 10_000_000,
        is_negotiable: false,
        is_primary: true,
      },
    ]),
  );
  await insertOrThrow(
    client.from("property_agricultural").insert({
      property_id: agricultural.id,
      tenure_type: "RECORDED_TENURE",
      irrigation_status: "BOREWELL_AVAILABLE",
      fencing_status: "PARTIAL",
      topography: "LEVEL",
      road_touch: true,
      road_width_m: 9,
      created_by: actorId,
      updated_by: actorId,
    }),
  );
  await insertOrThrow(
    client.from("property_na").insert({
      property_id: naLand.id,
      na_status: "RECORDED_NA_STATUS",
      na_purpose: "COMMERCIAL",
      road_width_m: 12,
      frontage_m: 30,
      water_status: "AVAILABLE",
      created_by: actorId,
      updated_by: actorId,
    }),
  );
  await insertOrThrow(
    client.from("property_industrial").insert({
      property_id: industrial.id,
      industrial_subtype: "PRIVATE_INDUSTRIAL",
      industrial_tenure: "LEASE_CONTEXT",
      permitted_industrial_use: "LIGHT_MANUFACTURING",
      truck_loading_access: "AVAILABLE",
      power_status: "AVAILABLE",
      sanctioned_load_kw: 150,
      created_by: actorId,
      updated_by: actorId,
    }),
  );

  const image = await sharp({
    create: { width: 1400, height: 900, channels: 3, background: "#8da06a" },
  })
    .webp({ quality: 82 })
    .toBuffer();
  for (const [index, color] of ["cover", "second"].entries()) {
    const mediaId = crypto.randomUUID();
    const objectPath = `properties/${agricultural.id}/media/${mediaId}.webp`;
    const uploaded = await client.storage.from("property-media-public").upload(objectPath, image, {
      contentType: "image/webp",
      upsert: false,
    });
    if (uploaded.error) throw uploaded.error;
    await insertOrThrow(
      client.from("media_assets").insert({
        id: mediaId,
        property_id: agricultural.id,
        media_type: "IMAGE",
        storage_bucket: "property-media-public",
        object_path: objectPath,
        mime_type: "image/webp",
        file_size_bytes: image.byteLength,
        width_px: 1400,
        height_px: 900,
        alt_text: `Synthetic agricultural ${color} view`,
        visibility: "PUBLIC",
        is_cover: index === 0,
        sort_order: (index + 1) * 10,
        source_type: "SUPABASE_UPLOAD",
        checksum_sha256: `${index + 1}`.repeat(64),
        processing_status: "APPROVED",
        approved_at: publishedAt,
        created_by: actorId,
        updated_by: actorId,
      }),
    );
  }
  await insertOrThrow(
    client.from("media_assets").insert({
      id: "98000000-0000-4000-8000-000000000010",
      property_id: agricultural.id,
      media_type: "BROCHURE",
      external_url: "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz_12345/view",
      external_provider: "GOOGLE_DRIVE",
      external_media_id: "1AbCdEfGhIjKlMnOpQrStUvWxYz_12345",
      visibility: "PUBLIC",
      is_cover: false,
      sort_order: 30,
      source_type: "GOOGLE_DRIVE",
      processing_status: "APPROVED",
      approved_at: publishedAt,
      created_by: actorId,
      updated_by: actorId,
    }),
  );
}

async function expectNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  const { client, actorId } = await serviceContext();
  await createPublicFixtures(client, actorId);
});

test("visitor receives the homepage in initial HTML and browses each category", async ({
  page,
  request,
}) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain("Find the right land in");
  expect(html).toContain(agricultural.title);

  for (const [path, title] of [
    ["/agricultural-land", agricultural.title],
    ["/na-land", naLand.title],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  }
  await page.goto("/industrial-land");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(industrial.title, { exact: true })).toHaveCount(0);

  await page.goto("/properties");
  await expect(page.getByText(agricultural.title, { exact: true })).toBeVisible();
  await expect(page.getByText(naLand.title, { exact: true })).toBeVisible();
  await expect(page.getByText(industrial.title, { exact: true })).toHaveCount(0);
  await page.goto("/properties?availability=leased");
  await expect(page.getByText(industrial.title, { exact: true })).toBeVisible();
});

test("published detail renders media, correct price/area, and approximate public location", async ({
  page,
}) => {
  const visibleResponses: string[] = [];
  page.on("response", async (response) => {
    const type = response.headers()["content-type"] ?? "";
    if (/text|json|javascript/.test(type)) {
      visibleResponses.push(await response.text().catch(() => ""));
    }
  });
  await page.goto(`/properties/${agricultural.slug}`);
  await expect(page.getByRole("heading", { level: 1, name: agricultural.title })).toBeVisible();
  const gallery = page.getByRole("region", { name: "Property image gallery" });
  await expect(gallery.getByAltText("Synthetic agricultural cover view")).toBeVisible();
  await expect(page.getByText("2.5 ac", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/1,25,00,000/).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Approximate location" })).toBeVisible();
  await expect(page.getByText("Interactive map provider is not configured.")).toBeVisible();
  await gallery.getByRole("button", { name: "Show property image 2" }).click();
  await expect(gallery.getByAltText("Synthetic agricultural second view")).toBeVisible();
  await expect(page.getByRole("link", { name: /Download Brochure/ })).toHaveAttribute(
    "href",
    "https://drive.google.com/uc?export=download&id=1AbCdEfGhIjKlMnOpQrStUvWxYz_12345",
  );

  const browserVisible = `${await page.content()} ${visibleResponses.join(" ")}`;
  expect(browserVisible).not.toContain(privateLatitudeCanary);
  expect(browserVisible).not.toContain(privateLongitudeCanary);
  expect(browserVisible).not.toContain(privateNoteCanary);
  expect(browserVisible).not.toContain("private_documents");
  expect(browserVisible).not.toContain("audit_logs");
});

test("hidden and closed pages remain honest while unpublished and invalid slugs are indistinguishable", async ({
  page,
}) => {
  await page.goto(`/properties/${naLand.slug}`);
  await expect(
    page.getByText("No pin or coordinate is published for this property."),
  ).toBeVisible();
  expect(await page.content()).not.toContain("PRIVATE_M10_HIDDEN_NOTE_CANARY");

  await page.goto(`/properties/${industrial.slug}`);
  await expect(page.getByText("Leased", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Find similar land" }).first()).toBeVisible();
  await expect(page.getByText("Enquire now")).toHaveCount(0);

  for (const slug of [unpublishedSlug, "unknown-private-property-slug"]) {
    const response = await page.goto(`/properties/${slug}`);
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "This land page is not available." }),
    ).toBeVisible();
    expect(await page.content()).not.toContain("PRIVATE_M10_DRAFT");
  }
});

test("public pages work across required widths with keyboard-operable navigation", async ({
  page,
}) => {
  for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1728]) {
    await page.setViewportSize({ width, height: width < 768 ? 760 : 900 });
    await page.goto(`/properties/${agricultural.slug}`);
    await expectNoHorizontalOverflow(page);
    const sticky = page.locator(".mobile-sticky-actions");
    if (width < 1024) await expect(sticky).toBeVisible();
    else await expect(sticky).toBeHidden();
  }

  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Open navigation menu" });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toHaveCount(0);
});

test("homepage and property detail have no serious automated accessibility violations", async ({
  page,
}) => {
  for (const path of ["/", `/properties/${agricultural.slug}`]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter(({ impact }) => impact === "serious" || impact === "critical"),
    ).toEqual([]);
  }
});
