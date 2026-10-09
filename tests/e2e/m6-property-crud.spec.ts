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
  await page.getByLabel("Property title (optional)").fill(`Synthetic E2E ${category}`);
  await page.getByLabel("District").selectOption({ label: "Ahmedabad" });
  await page.getByLabel("Area", { exact: true }).fill(category === "AGRICULTURAL" ? "2.5" : "500");
  await page.locator('select[name="displayAreaUnitId"]').selectOption({ label: "Acre (ac)" });
  if (category === "NA") {
    await page.locator("details > summary").filter({ hasText: "NA Details" }).click();
    await page.getByLabel("NA status").fill("CHECK_PENDING");
  }
}

for (const category of ["AGRICULTURAL", "NA", "INDUSTRIAL"] as const) {
  test(`active admin creates a ${category} draft`, async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/properties/new");
    await fillDraftCore(page, category);
    await page.getByRole("button", { name: "Save & Next →" }).click();
    await expect(page).toHaveURL(/\/admin\/properties\/[0-9a-f-]+\/media$/);
    await expect(page.getByText(/^UE-LS-\d{6}$/).first()).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Property publishing workflow" }),
    ).toContainText("Photos & Documents");
    await page.getByRole("link", { name: "Keep as Draft" }).click();
    await expect(page.getByText("DRAFT").first()).toBeVisible();
  });
}

test("admin edits price, area, and Google Maps location without publishing", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/properties/new");
  await fillDraftCore(page, "AGRICULTURAL");
  await page.getByRole("button", { name: "Save Draft" }).click();
  await page.getByRole("link", { name: "Edit", exact: true }).click();
  await page.getByLabel("Area", { exact: true }).fill("4.75");
  await page.getByLabel("Price mode").selectOption("EXACT_TOTAL");
  await page.getByLabel("Exact amount (INR)").fill("3500000");
  await page
    .getByLabel("Google Maps Embed")
    .fill("https://www.google.com/maps/embed?pb=synthetic-m6-map");
  await page.getByRole("button", { name: "Save Draft" }).click();
  await expect(page).toHaveURL(/saved=1/);
  await expect(page.getByRole("status")).toContainText("Changes saved successfully");
  await expect(page.getByLabel("Area", { exact: true })).toHaveValue("4.75");

  await page.getByRole("button", { name: "Save & Next →" }).click();
  await expect(page).toHaveURL(/\/media\?saved=1$/);
  await page.getByRole("link", { name: /Save & Next/ }).click();
  await expect(page).toHaveURL(/\/preview$/);
  await expect(page.getByRole("heading", { name: "Preview" })).toBeVisible();
  await page.getByRole("link", { name: /Continue to Publish/ }).click();
  await expect(page).toHaveURL(/\/publish$/);
  await expect(page.getByRole("heading", { name: "Publish", exact: true })).toBeVisible();
});

test("validation errors retain valid draft input", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/properties/new");
  await page.getByLabel("Property title (optional)").fill("Retained synthetic title");
  await page.getByLabel("District").selectOption({ label: "Ahmedabad" });
  await page.getByLabel("Area", { exact: true }).fill("-1");
  await page.locator('select[name="displayAreaUnitId"]').selectOption({ label: "Acre (ac)" });
  await page.getByRole("button", { name: "Save & Next →" }).click();
  await expect(page.getByRole("status")).toContainText("retained");
  await expect(page.getByLabel("Property title (optional)")).toHaveValue(
    "Retained synthetic title",
  );
  await expect(page).toHaveURL(/\/admin\/properties\/new/);
});

test("anonymous users cannot reach property mutation forms", async ({ page }) => {
  await page.goto("/admin/properties/new");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("button", { name: "Save Draft" })).toHaveCount(0);
});
