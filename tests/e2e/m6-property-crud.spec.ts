import { expect, test, type Page } from "@playwright/test";

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

async function fillDraftCore(page: Page, category: "AGRICULTURAL" | "NA" | "INDUSTRIAL") {
  await page.getByLabel("Land category").selectOption(category);
  await page.getByLabel("Listing title (optional for draft)").fill(`Synthetic E2E ${category}`);
  await page.getByLabel("District").selectOption({ label: "Ahmedabad" });
  await page.getByLabel("Display area").fill(category === "AGRICULTURAL" ? "2.5" : "500");
  await page.locator('select[name="displayAreaUnitId"]').selectOption({ label: "Acre (ac)" });
  if (category === "NA") await page.getByLabel("NA status").fill("CHECK_PENDING");
}

for (const category of ["AGRICULTURAL", "NA", "INDUSTRIAL"] as const) {
  test(`active admin creates a ${category} draft`, async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/properties/new");
    await fillDraftCore(page, category);
    await page.getByRole("button", { name: "Create draft" }).click();
    await expect(page).toHaveURL(/\/admin\/properties\/[0-9a-f-]+$/);
    await expect(page.getByText(/^UE-LS-\d{6}$/).first()).toBeVisible();
    await expect(page.getByText("DRAFT").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Publication readiness" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Publish property" })).toBeDisabled();
  });
}

test("admin edits price, area, and public-safe location without publishing", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/properties/new");
  await fillDraftCore(page, "AGRICULTURAL");
  await page.getByRole("button", { name: "Create draft" }).click();
  await page.getByRole("link", { name: "Edit draft" }).click();
  await page.getByLabel("Display area").fill("4.75");
  await page.getByLabel("Price mode").selectOption("EXACT_TOTAL");
  await page.getByLabel("Exact amount (INR)").fill("3500000");
  await page.locator('select[name="locationVisibility"]').selectOption("APPROXIMATE");
  await page.getByLabel("Public-safe latitude").fill("23.050000");
  await page.getByLabel("Public-safe longitude").fill("72.550000");
  await page.getByLabel("Public accuracy (metres)").fill("500");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page).toHaveURL(/saved=1/);
  await expect(page.getByRole("status")).toContainText("Draft saved");
  await expect(page.getByText("4.75 Acre (ac)")).toBeVisible();
  await expect(page.getByText("DRAFT").first()).toBeVisible();
});

test("validation errors retain valid draft input", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/properties/new");
  await page.getByLabel("Listing title (optional for draft)").fill("Retained synthetic title");
  await page.getByLabel("District").selectOption({ label: "Ahmedabad" });
  await page.getByLabel("Display area").fill("-1");
  await page.locator('select[name="displayAreaUnitId"]').selectOption({ label: "Acre (ac)" });
  await page.getByRole("button", { name: "Create draft" }).click();
  await expect(page.getByRole("status")).toContainText("retained");
  await expect(page.getByLabel("Listing title (optional for draft)")).toHaveValue(
    "Retained synthetic title",
  );
  await expect(page).toHaveURL(/\/admin\/properties\/new/);
});

test("anonymous users cannot reach property mutation forms", async ({ page }) => {
  await page.goto("/admin/properties/new");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("button", { name: "Create draft" })).toHaveCount(0);
});
