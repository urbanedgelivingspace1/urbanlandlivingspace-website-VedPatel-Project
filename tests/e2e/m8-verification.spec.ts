import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";

import type { Database } from "@/types/database.generated";

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

async function createAgriculturalDraft(page: Page) {
  await page.goto("/admin/properties/new");
  await page.getByLabel("Listing title (optional for draft)").fill("Synthetic M8 verification");
  await page.getByLabel("District").selectOption({ label: "Ahmedabad" });
  await page.getByLabel("Display area").fill("2.5");
  await page.locator('select[name="displayAreaUnitId"]').selectOption({ label: "Acre (ac)" });
  await page.getByRole("button", { name: "Create draft" }).click();
  await expect(page).toHaveURL(/\/admin\/properties\/[0-9a-f-]+$/);
}

test("admin completes a scoped evidence workflow while publication stays blocked", async ({
  page,
}) => {
  await signIn(page);
  await createAgriculturalDraft(page);
  await page.getByRole("link", { name: "Manage media" }).click();
  const pdf = Buffer.from(
    "%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n2 0 obj << /Type /Page >> endobj\n%%EOF",
  );
  const upload = page.locator("form").filter({ hasText: "Upload private evidence" });
  await upload.locator('input[type="file"]').setInputFiles({
    name: "synthetic-identity.pdf",
    mimeType: "application/pdf",
    buffer: pdf,
  });
  await upload.getByRole("button", { name: "Upload" }).click();
  await expect(upload.getByRole("status")).toContainText("scanned clean");
  await page.getByRole("link", { name: "Back to property" }).click();
  await page.getByRole("main").getByRole("link", { name: "Verification" }).click();
  await expect(page).toHaveURL(/\/admin\/verification\/[0-9a-f-]+/);
  await page.getByRole("button", { name: "Initialize checks" }).click();
  await expect(
    page.getByRole("heading", { name: "Property identity / parcel references" }),
  ).toBeVisible();

  const check = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "Property identity / parcel references" }) });
  await check.getByRole("button", { name: "Apply guarded transition" }).click();
  await expect(check.getByText("IN REVIEW", { exact: true })).toBeVisible();

  await check.getByRole("combobox", { name: "Private document" }).selectOption({ index: 1 });
  await check.locator('select[name="evidenceType"]').selectOption("OWNER_DOCUMENT");
  await check.locator('select[name="sourceClass"]').selectOption("URBANEDGE_OPERATIONAL_POLICY");
  await check.getByRole("button", { name: "Link as received" }).click();
  await expect(check.getByText(/OWNER DOCUMENT · RECEIVED/)).toBeVisible();
  await check.getByRole("button", { name: "Advance to REVIEWED" }).click();
  await expect(check.getByText(/OWNER DOCUMENT · REVIEWED/)).toBeVisible();

  await check.locator('select[name="target"]').selectOption("PASSED_WITH_NOTE");
  await check
    .getByPlaceholder(/What records, parcel, use/)
    .fill("Survey number and parcel identity were compared for the named synthetic property.");
  await check
    .getByPlaceholder("Explicit limitations")
    .fill("Identity correspondence only; no title, boundary, or permission conclusion.");
  await check
    .getByPlaceholder("Internal notes / exception context")
    .fill("Owner-provided document was reviewed but was not source-verified.");
  await check.getByLabel("Recheck date").fill("2099-01-01T00:00");
  await check.getByRole("button", { name: "Apply guarded transition" }).click();
  await expect(check.getByText("PASSED WITH NOTE", { exact: true })).toBeVisible();
  await expect(
    check.getByText(/lawyer-approved public-copy policy is intentionally absent/),
  ).toBeVisible();

  await check.getByPlaceholder(/Specific mismatch/).fill("Owner record is not source-verified.");
  await check
    .getByPlaceholder("Limitation created by this exception")
    .fill("Official source confirmation remains outstanding.");
  await check.getByRole("button", { name: "Record exception" }).click();
  await expect(check.getByText("Owner record is not source-verified.")).toBeVisible();

  await page.getByRole("link", { name: "Property" }).click();
  await expect(page.getByText("DRAFT").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish unavailable until M9" })).toBeDisabled();
});

test("invalid transitions and unauthorized access remain blocked", async ({ page }) => {
  await signIn(page);
  await createAgriculturalDraft(page);
  await page.getByRole("main").getByRole("link", { name: "Verification" }).click();
  await page.getByRole("button", { name: "Initialize checks" }).click();
  const check = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "Property identity / parcel references" }) });
  await check.locator('select[name="target"]').selectOption("IN_REVIEW");
  await check.getByRole("button", { name: "Apply guarded transition" }).click();
  await check.locator('select[name="target"]').selectOption("PASSED");
  await check
    .getByPlaceholder(/What records, parcel, use/)
    .fill("Attempted pass without any eligible evidence for the scoped property identity check.");
  await check.getByRole("button", { name: "Apply guarded transition" }).click();
  await expect(check.getByRole("status").last()).toContainText("eligible evidence");

  await page.context().clearCookies();
  await page.goto("/admin/verification/queue");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Verification queue" })).toHaveCount(0);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Local anonymous Supabase environment is missing.");
  const anonymous = createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const evidence = await anonymous
    .from("verification_evidence")
    .select("id,evidence_notes_internal");
  expect(evidence.data).toBeNull();
  expect(evidence.error).not.toBeNull();
  expect(JSON.stringify(evidence)).not.toContain("synthetic-identity.pdf");
});
