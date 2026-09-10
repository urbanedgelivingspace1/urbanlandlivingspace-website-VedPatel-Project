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
  await page.getByRole("link", { name: /Media/ }).click();
  await page.getByRole("link", { name: "Upload & manage media" }).click();
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
  await page.getByRole("link", { name: "Review", exact: true }).click();
  await page.getByRole("link", { name: "Advanced Review ↗" }).click();
  await expect(page).toHaveURL(/\/admin\/verification\/[0-9a-f-]+/);
  await page.getByRole("button", { name: "Set up verification checks" }).click();
  await page.getByRole("button", { name: /View \d+ optional checks/ }).click();
  await expect(
    page.getByRole("heading", { name: "Property identity / parcel references" }),
  ).toBeVisible();

  const check = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "Property identity / parcel references" }) });
  await check.getByRole("button", { name: "Start check" }).click();
  await check.getByRole("button", { name: "Continue to proof →" }).click();
  await check.getByLabel("Available property documents").selectOption({ index: 1 });
  await check.getByRole("button", { name: "Link document as proof" }).click();
  await expect(check.getByRole("status")).toContainText("linked and marked as reviewed");
  await check.getByRole("button", { name: "Continue to review method →" }).click();
  await check.getByLabel("I reviewed the document").check();
  await check.getByRole("button", { name: "Continue to review outcome →" }).click();
  await check.getByLabel(/Something needs attention/).check();
  await check.getByRole("button", { name: "Continue to summary & save →" }).click();
  await check
    .getByLabel("Note explaining what needs attention (required)")
    .fill("Owner record was reviewed; official source confirmation remains outstanding.");
  await check.getByRole("button", { name: "Save review", exact: true }).click();
  await expect(check).toContainText("Complete — note attached");
  await expect(check.getByRole("status")).toContainText("completed successfully");

  await page.getByRole("link", { name: "Property" }).click();
  await expect(page.getByText("DRAFT").first()).toBeVisible();
  await page.getByRole("link", { name: "Review", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Publication readiness" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish property" })).toBeDisabled();
});

test("invalid transitions and unauthorized access remain blocked", async ({ page }) => {
  await signIn(page);
  await createAgriculturalDraft(page);
  await page.getByRole("link", { name: "Review", exact: true }).click();
  await page.getByRole("link", { name: "Advanced Review ↗" }).click();
  await page.getByRole("button", { name: "Set up verification checks" }).click();
  await page.getByRole("button", { name: /View \d+ optional checks/ }).click();
  const check = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "Property identity / parcel references" }) });
  await check.getByRole("button", { name: "Start check" }).click();
  await check.getByRole("button", { name: "Continue to proof →" }).click();
  await check.getByRole("button", { name: "Continue to review method →" }).click();
  await check.getByRole("button", { name: "Continue to review outcome →" }).click();
  await check.getByLabel(/Everything looks consistent/).check();
  await check.getByRole("button", { name: "Continue to summary & save →" }).click();
  await check.getByRole("button", { name: "Save review", exact: true }).click();
  await expect(check.getByRole("status")).toContainText(
    "requires confirmation against an official source",
  );

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
