import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("public foundation renders without automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Land deserves a more considered search." }),
  ).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test("admin route is clearly a non-production placeholder", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Admin foundation" })).toBeVisible();
  await expect(
    page.getByText("not an authenticated admin dashboard", { exact: false }),
  ).toBeVisible();
});
