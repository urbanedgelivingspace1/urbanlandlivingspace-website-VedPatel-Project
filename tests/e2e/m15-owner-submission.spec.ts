import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const ownerName = `M15 Owner ${unique}`;
const publicTitle = `M15 curated draft ${unique}`;
const ipSeed = Math.floor(Math.random() * 180) + 20;
let submissionId = "";

function service() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Synthetic M15 E2E database is unavailable.");
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

async function submitCategoryVariant(
  page: Page,
  category: "Agricultural land" | "Industrial land",
  owner: string,
  ip: string,
) {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": ip });
  await page.goto("/sell-your-land");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: category }).check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Name").fill(owner);
  await page.getByLabel("Mobile number").fill(`97${String(Date.now()).slice(-8)}`);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("District").selectOption({ label: "Ahmedabad" });
  await page.getByLabel("Taluka").fill("Dholka");
  await page.getByLabel("Village / locality").fill("Synthetic category village");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Area", { exact: true }).fill("2");
  await page.getByLabel("Original area unit").selectOption("10000000-0000-4000-8000-000000000006");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByLabel("Describe the land and what matters")
    .fill("Synthetic category-specific owner claim for private brokerage review.");
  if (category === "Agricultural land")
    await page.getByLabel("Tenure claim").fill("Owner says old tenure");
  else await page.getByLabel("Industrial context").fill("Owner says private industrial estate");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  for (const checkbox of await page.getByRole("checkbox").all()) await checkbox.check();
  await page.getByRole("button", { name: "Submit for private review" }).click();
  await expect(page).toHaveURL(/\/sell-your-land\/thank-you/);
  await expect(page.getByText(/UrbanEdge will review/i)).toBeVisible();
}

test("Agricultural and Industrial owner variants submit as private intake", async ({ page }) => {
  for (const [index, category] of ["Agricultural land", "Industrial land"].entries()) {
    const owner = `M15 ${category} ${unique}`;
    await submitCategoryVariant(
      page,
      category as "Agricultural land" | "Industrial land",
      owner,
      `198.${20 + index}.${ipSeed}.15`,
    );
    const party = await service().from("parties").select("id").eq("display_name", owner).single();
    if (!party.data) throw party.error;
    const submission = await service()
      .from("owner_submissions")
      .select("land_category,status,converted_property_id")
      .eq("party_id", party.data.id)
      .single();
    expect(submission.data).toMatchObject({
      land_category: category === "Agricultural land" ? "AGRICULTURAL" : "INDUSTRIAL",
      status: "NEW",
      converted_property_id: null,
    });
  }
});

test("Sell Your Land starts keyboard-first without mobile overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sell-your-land");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Continue" }).press("Enter");
  await expect(page.getByText("Step 2 of 10")).toBeVisible();
  await page.getByRole("radio", { name: "Agricultural land" }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("radio", { name: "Agricultural land" })).toBeChecked();
});

test("owner workflow remains private through explicit draft conversion", async ({ page }) => {
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `198.19.${Math.floor(Math.random() * 200)}.15`,
  });
  await page.goto("/sell-your-land");
  await expect(page.getByRole("heading", { name: /land you want to sell/i })).toBeVisible();
  await expect(page.getByText(/nothing is automatically listed or published/i)).toBeVisible();

  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: "NA land" }).check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Name").fill(ownerName);
  await page.getByLabel("Mobile number").fill(`98${String(Date.now()).slice(-8)}`);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("District").selectOption({ label: "Ahmedabad" });
  await page.getByLabel("Taluka").fill("Sanand");
  await page.getByLabel("Village / locality").fill("Synthetic M15 village");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Area", { exact: true }).fill("3");
  await page.getByLabel("Original area unit").selectOption("10000000-0000-4000-8000-000000000006");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByLabel("Describe the land and what matters")
    .fill("Synthetic owner claim for controlled private review only.");
  await page.getByLabel("NA status claim").fill("Owner says NA; requires verification");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Documents", { exact: true }).setInputFiles({
    name: "owner-evidence.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1EAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page.getByRole("button", { name: "Continue" }).click();
  for (const checkbox of await page.getByRole("checkbox").all()) await checkbox.check();
  await page.getByRole("button", { name: "Submit for private review" }).click();
  await expect(page).toHaveURL(/\/sell-your-land\/thank-you/);
  await expect(page.getByRole("heading", { name: /has not been published/i })).toBeVisible();

  const party = await service().from("parties").select("id").eq("display_name", ownerName).single();
  if (!party.data) throw party.error;
  const submission = await service()
    .from("owner_submissions")
    .select("id,status,converted_property_id")
    .eq("party_id", party.data.id)
    .single();
  if (!submission.data) throw submission.error;
  submissionId = submission.data.id;
  expect(submission.data).toMatchObject({ status: "NEW", converted_property_id: null });
  const privateDocument = await service()
    .from("private_documents")
    .select("id,storage_bucket,scan_status,visibility")
    .eq("owner_submission_id", submissionId)
    .single();
  if (!privateDocument.data) throw privateDocument.error;
  expect(privateDocument.data).toMatchObject({
    storage_bucket: "owner-submissions-private",
    scan_status: "CLEAN",
    visibility: "PRIVATE",
  });
  const unauthorizedDocument = await page.request.get(
    `/admin/submissions/${submissionId}/documents/${privateDocument.data.id}`,
    { maxRedirects: 0 },
  );
  expect(unauthorizedDocument.status()).toBe(307);

  await signIn(page);
  await page.goto(`/admin/submissions/${submissionId}`);
  await expect(page.getByText(ownerName)).toBeVisible();
  await expect(page.getByText(/Unverified input/i)).toBeVisible();
  await expect(page.getByText("owner-evidence.png")).toBeVisible();
  await expect(page.getByRole("link", { name: "Download (60s)" })).toBeVisible();

  await page.getByLabel("Next status").selectOption("CONTACTED");
  await page.getByLabel("Private note").fill("Owner contacted for controlled review");
  await page.getByRole("button", { name: "Record transition" }).click();
  await page.getByLabel("Next status").selectOption("UNDER_REVIEW");
  await page.getByRole("button", { name: "Record transition" }).click();
  await page.getByLabel("Next status").selectOption("APPROVED");
  await page.getByRole("button", { name: "Record transition" }).click();
  await page.getByRole("link", { name: "Convert to draft" }).click();
  await expect(page.getByText(/does not publish/i)).toBeVisible();
  await page.getByLabel("Curated listing title").fill(publicTitle);
  await page
    .getByLabel("Curated public description")
    .fill("Reviewed synthetic description for a private draft property.");
  await page.getByLabel(/I confirm that I reviewed/).check();
  await page.getByRole("button", { name: "Create draft property" }).click();
  await expect(page).toHaveURL(/\/admin\/properties\//);

  const converted = await service()
    .from("owner_submissions")
    .select("status,converted_property_id")
    .eq("id", submissionId)
    .single();
  expect(converted.data?.status).toBe("CONVERTED");
  const property = await service()
    .from("properties")
    .select("publication_status,published_at")
    .eq("id", converted.data?.converted_property_id)
    .single();
  expect(property.data).toEqual({ publication_status: "DRAFT", published_at: null });

  await page.goto(`/properties?q=${encodeURIComponent(publicTitle)}`);
  await expect(page.getByRole("link", { name: publicTitle, exact: true })).toHaveCount(0);
});
