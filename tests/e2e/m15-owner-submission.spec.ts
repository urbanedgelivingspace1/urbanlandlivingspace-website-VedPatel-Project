import { createClient } from "@supabase/supabase-js";
import { expect, test, type Browser, type Page } from "@playwright/test";
import sharp from "sharp";

test.describe.configure({ mode: "serial" });

const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const sellerName = `M20 Seller ${unique}`;
const sellerEmail = `seller-${unique}@example.invalid`;
const sellerPhone = `98${String(Date.now()).slice(-8)}`;
const firstTitle = `M20 seller parcel ${unique}`;
const firstSlug = `m20-seller-parcel-${Date.now()}`;
let sellerLeadId = "";
let sellerPartyId = "";

function service() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Synthetic M20 E2E database is unavailable.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function anonymous() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Synthetic M20 anonymous database is unavailable.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function signIn(page: Page) {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Synthetic E2E admin was not initialized.");
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

async function submitSellerContact(page: Page) {
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `198.19.${Math.floor(Math.random() * 200)}.20`,
  });
  await page.goto("/sell-your-land");
  await expect(page.getByRole("heading", { name: /land you want to sell/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toHaveCount(0);
  await page.getByLabel("Full Name").fill(sellerName);
  await page.getByLabel("Mobile Number").fill(sellerPhone);
  await page.getByLabel("Email Address").fill(sellerEmail);
  await page.getByLabel("Intent").selectOption("LEASE");
  await page.getByLabel("Land type (optional)").selectOption("NA");
  await page.getByLabel("Location (optional)").selectOption({ label: "Ahmedabad" });
  await page.getByLabel("Village / Locality / Landmark").fill("Sanand GIDC");
  await page
    .getByLabel("Message (optional)")
    .fill("Two nearby parcels are available for a private brokerage discussion.");
  await page.getByLabel(/I agree that UrbanEdge may contact me/).check();
  await page.getByRole("button", { name: "Contact Me" }).click();
  await expect(page.getByRole("heading", { name: "We received your request" })).toBeVisible();

  const party = await service()
    .from("parties")
    .select("id")
    .eq("display_name", sellerName)
    .single();
  if (!party.data) throw party.error;
  sellerPartyId = party.data.id;
  const lead = await service()
    .from("leads")
    .select("id,inquiry_type,preferred_transaction,land_category,locality_text,status")
    .eq("party_id", sellerPartyId)
    .eq("inquiry_type", "SELLER_LEAD")
    .single();
  if (!lead.data) throw lead.error;
  sellerLeadId = lead.data.id;
  expect(lead.data).toMatchObject({
    inquiry_type: "SELLER_LEAD",
    preferred_transaction: "LEASE",
    land_category: "NA",
    locality_text: "Sanand GIDC",
    status: "NEW",
  });
  expect(
    (
      await service()
        .from("owner_submissions")
        .select("id", { count: "exact", head: true })
        .eq("party_id", sellerPartyId)
    ).count,
  ).toBe(0);
  expect(
    (
      await service()
        .from("property_source_links")
        .select("id", { count: "exact", head: true })
        .eq("source_type", "SELLER_LEAD")
        .eq("source_reference", sellerLeadId)
    ).count,
  ).toBe(0);
}

async function assertPrivateDocumentBoundary(
  browser: Browser,
  propertyId: string,
  documentId: string,
) {
  const anonymousRows = await anonymous()
    .from("private_documents")
    .select("id,object_path")
    .eq("property_id", propertyId);
  expect(anonymousRows.data === null || anonymousRows.data.length === 0).toBe(true);
  expect(anonymousRows.error).not.toBeNull();
  const publicContext = await browser.newContext();
  const response = await publicContext.request.get(
    `http://127.0.0.1:3000/api/admin/private-documents/${documentId}/download`,
    { maxRedirects: 0 },
  );
  expect(response.status()).toBe(403);
  await publicContext.close();
}

test("Sell Your Land is one short, mobile-safe seller contact form", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sell-your-land");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await expect(page.getByRole("button", { name: "Contact Me" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toHaveCount(0);
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  await expect(page.locator('[name="surveyNumber"]')).toHaveCount(0);
});

test("seller lead creates multiple drafts, stores private documents, and explicitly publishes", async ({
  browser,
  page,
}) => {
  test.setTimeout(180_000);
  await submitSellerContact(page);
  await signIn(page);
  await page.goto(`/admin/leads/${sellerLeadId}`);
  await expect(page.getByRole("heading", { name: sellerName })).toBeVisible();
  await expect(page.getByRole("link", { name: /Call/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "WhatsApp" })).toBeVisible();
  await expect(page.getByText(/No property listing has been created/)).toBeVisible();

  await page.getByRole("link", { name: /Create Property from Lead/ }).click();
  await expect(page).toHaveURL(/\/admin\/properties\/new\?/);
  await expect(page.getByLabel("Primary party (optional)")).toHaveValue(sellerPartyId);
  await expect(page.getByLabel("Land category")).toHaveValue("NA");
  await expect(page.getByLabel("Primary transaction")).toHaveValue("LEASE");
  await expect(page.getByLabel("District")).toHaveValue("00000000-0000-4000-8000-000000000003");
  await expect(page.getByLabel("Public landmark")).toHaveValue("Sanand GIDC");
  await expect(page.getByLabel("Source type")).toHaveValue("SELLER_LEAD");
  await expect(page.getByLabel("Source reference")).toHaveValue(sellerLeadId);
  await expect(page.getByLabel("Property title (optional)")).toHaveValue("");

  await page.getByLabel("Property title (optional)").fill(firstTitle);
  await page.getByLabel("Public slug (optional; generated from title when blank)").fill(firstSlug);
  await page
    .getByLabel("Short description")
    .fill("A seller-supplied NA parcel prepared for a controlled marketing listing.");
  await page
    .getByLabel("Description", { exact: true })
    .fill("A seller-supplied parcel recorded for brokerage marketing without legal guarantees.");
  await page.getByLabel("Public-safe address").fill("Sanand, Ahmedabad district");
  await page.getByLabel("Display area").fill("2");
  await page.locator('select[name="displayAreaUnitId"]').selectOption({ label: "Acre (ac)" });
  await page.locator('select[name="locationVisibility"]').selectOption("HIDDEN");
  await page.getByRole("button", { name: "Save Draft" }).click();
  await expect(page).toHaveURL(/\/admin\/properties\/[0-9a-f-]+\?saved=1$/);
  const firstPropertyId = new URL(page.url()).pathname.split("/").at(-1) as string;
  expect(
    (
      await service()
        .from("properties")
        .select("publication_status,published_at")
        .eq("id", firstPropertyId)
        .single()
    ).data,
  ).toEqual({ publication_status: "DRAFT", published_at: null });
  expect(
    (await anonymous().from("public_property_listings").select("id").eq("id", firstPropertyId))
      .data,
  ).toEqual([]);

  await page.getByRole("link", { name: /Documents/ }).click();
  const privatePdf = Buffer.from(
    "%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n2 0 obj << /Type /Page >> endobj\n%%EOF",
  );
  const privatePng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1EAAAAASUVORK5CYII=",
    "base64",
  );
  await page.getByLabel(/Select Files/).setInputFiles([
    { name: "seller-land-record.pdf", mimeType: "application/pdf", buffer: privatePdf },
    { name: "seller-boundary-map.png", mimeType: "image/png", buffer: privatePng },
  ]);
  await expect(page.getByText("2 files ready")).toBeVisible();
  await page.getByRole("button", { name: "Upload files" }).click();
  await expect(page.getByRole("status")).toContainText("2 files stored");
  const documents = await service()
    .from("private_documents")
    .select("id,object_path,visibility")
    .eq("property_id", firstPropertyId)
    .like("object_path", `properties/${firstPropertyId}/documents/%`);
  expect(documents.error).toBeNull();
  expect(documents.data).toHaveLength(2);
  expect(documents.data?.every((row) => row.visibility === "PRIVATE")).toBe(true);
  expect(
    (
      await service()
        .from("verification_evidence")
        .select("id", { count: "exact", head: true })
        .in("private_document_id", documents.data?.map((row) => row.id) ?? [])
    ).count,
  ).toBe(0);
  await assertPrivateDocumentBoundary(browser, firstPropertyId, documents.data![0]!.id);

  await page.goto(`/admin/properties/${firstPropertyId}/media`);
  const image = await sharp({
    create: { width: 1200, height: 800, channels: 3, background: "#8f7958" },
  })
    .jpeg()
    .toBuffer();
  const imageForm = page.locator("form").filter({ hasText: "Upload gallery image" });
  await imageForm.locator('input[type="file"]').setInputFiles({
    name: "seller-parcel-cover.jpg",
    mimeType: "image/jpeg",
    buffer: image,
  });
  await imageForm.getByPlaceholder(/Truthful alt text/).fill("Seller parcel frontage");
  await imageForm.getByRole("button", { name: "Upload" }).click();
  await expect(imageForm.getByRole("status")).toContainText("private staging");
  await page.getByRole("button", { name: "Approve / promote" }).click();
  await page.getByRole("button", { name: "Set cover" }).click();
  await page.getByRole("link", { name: /Save & Next/ }).click();
  await expect(page.getByRole("heading", { name: "Ready to publish" })).toBeVisible();
  expect(
    (
      await service()
        .from("property_verifications")
        .select("id", { count: "exact", head: true })
        .eq("property_id", firstPropertyId)
    ).count,
  ).toBe(0);
  await page.getByRole("link", { name: /Continue to Publish/ }).click();
  await page.getByLabel(/I’ve reviewed this listing/).check();
  await page.getByRole("button", { name: "Publish Property" }).click();
  await expect(
    page.getByRole("heading", { name: "Property published successfully" }),
  ).toBeVisible();
  await page.goto(`/properties/${firstSlug}`);
  await expect(page.getByRole("heading", { name: firstTitle })).toBeVisible();

  await page.goto(`/admin/leads/${sellerLeadId}`);
  await expect(page.getByRole("link", { name: new RegExp(firstTitle) })).toBeVisible();
  await page.getByRole("link", { name: /Create Property from Lead/ }).click();
  await page.getByLabel("Property title (optional)").fill(`M20 second parcel ${unique}`);
  await page.getByLabel("Display area").fill("1.5");
  await page.locator('select[name="displayAreaUnitId"]').selectOption({ label: "Acre (ac)" });
  await page.getByRole("button", { name: "Save Draft" }).click();
  await expect(page).toHaveURL(/\/admin\/properties\/[0-9a-f-]+\?saved=1$/);
  const sellerLinks = await service()
    .from("property_source_links")
    .select("property_id")
    .eq("source_type", "SELLER_LEAD")
    .eq("source_reference", sellerLeadId);
  expect(sellerLinks.error).toBeNull();
  expect(sellerLinks.data).toHaveLength(2);
});
