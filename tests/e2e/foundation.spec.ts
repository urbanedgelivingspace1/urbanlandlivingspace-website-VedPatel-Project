import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("public foundation renders without automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Land opportunities, curated by UrbanEdge." }),
  ).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test("anonymous admin request is redirected to sign in", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Admin sign in" })).toBeVisible();
  await expect(page.getByLabel("Password")).toHaveAttribute("type", "password");
});

test("public route never renders the admin navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Admin" })).toHaveCount(0);
});

test("active admin can sign in, load the dashboard and sign out", async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Synthetic E2E admin was not initialized.");

  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in securely" }).click();

  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Synthetic E2E Admin")).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileNavigation = page.getByText("Admin navigation", { exact: true });
  await expect(mobileNavigation).toBeVisible();
  await mobileNavigation.click();
  await expect(page.getByRole("link", { name: "Dashboard" }).last()).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login\?reason=signed_out/);
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login/);
});

for (const [label, emailVariable] of [
  ["authenticated non-admin", "E2E_NON_ADMIN_EMAIL"],
  ["inactive admin", "E2E_INACTIVE_ADMIN_EMAIL"],
] as const) {
  test(`${label} is rejected and its session is cleared`, async ({ page }) => {
    const email = process.env[emailVariable];
    const password = process.env.E2E_ADMIN_PASSWORD;
    if (!email || !password) throw new Error("Synthetic unauthorized actor was not initialized.");

    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in securely" }).click();

    await expect(page).toHaveURL(/\/admin\/login\?reason=not_active_admin/);
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole("navigation", { name: "Admin" })).toHaveCount(0);
  });
}

test("invalid credentials receive a generic error", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("nobody@example.invalid");
  await page.getByLabel("Password").fill("Synthetic-invalid-only");
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(page).toHaveURL(/reason=invalid_credentials/);
  await expect(page.getByRole("status")).toContainText("could not be verified");
});
