import { expect, test, type Page } from "@playwright/test";

async function expectNoDocumentOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
}

for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 820, height: 1180 },
  { width: 1024, height: 768 },
  { width: 1180, height: 820 },
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
] as const) {
  test(`home layout fits ${viewport.width}px without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoDocumentOverflow(page);

    const compactNavigation = page.getByRole("button", { name: "Open navigation menu" });
    const desktopNavigation = page.getByRole("navigation", { name: "Primary navigation" });
    if (viewport.width < 1152) {
      await expect(compactNavigation).toBeVisible();
      await expect(desktopNavigation).toBeHidden();
    } else {
      await expect(compactNavigation).toBeHidden();
      await expect(desktopNavigation).toBeVisible();
    }
  });
}

test("site container width remains monotonic across the 640px breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 639, height: 800 });
  await page.goto("/");
  const before = await page
    .locator(".site-container")
    .first()
    .evaluate((node) => node.clientWidth);

  await page.setViewportSize({ width: 640, height: 800 });
  const after = await page
    .locator(".site-container")
    .first()
    .evaluate((node) => node.clientWidth);

  expect(after).toBeGreaterThanOrEqual(before);
});

test("mobile navigation stays within the viewport and traps keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "Open navigation menu" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Menu" });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((node) => node.getBoundingClientRect().width)).toBeLessThanOrEqual(
    390,
  );

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

for (const width of [390, 768, 1024, 1180, 1366] as const) {
  test(`property search workspace fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/properties");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoDocumentOverflow(page);
  });
}
