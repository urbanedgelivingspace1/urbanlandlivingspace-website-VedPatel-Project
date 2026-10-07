import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";

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

async function createDraft(page: Page) {
  await page.goto("/admin/properties/new");
  await page.getByLabel("Property title (optional)").fill("Synthetic M7 media draft");
  await page.getByLabel("District").selectOption({ label: "Ahmedabad" });
  await page.getByLabel("Display area").fill("2.5");
  await page.locator('select[name="displayAreaUnitId"]').selectOption({ label: "Acre (ac)" });
  await page.getByRole("button", { name: "Create draft" }).click();
  await expect(page).toHaveURL(/\/admin\/properties\/[0-9a-f-]+$/);
}

test("active admin manages staged/public media and private evidence without publishing", async ({
  page,
}) => {
  await signIn(page);
  await createDraft(page);
  await page.getByRole("link", { name: /Media/ }).click();
  await page.getByRole("link", { name: "Upload & manage media" }).click();
  await expect(
    page.getByRole("heading", { name: "Property media and private storage" }),
  ).toBeVisible();

  const image = await sharp({
    create: { width: 1200, height: 800, channels: 3, background: "#9b865b" },
  })
    .jpeg()
    .withMetadata({ exif: { IFD0: { ImageDescription: "PRIVATE_E2E_GPS_CANARY" } } })
    .toBuffer();
  const imageForm = page.locator("form").filter({ hasText: "Upload gallery image" });
  await imageForm.locator('input[type="file"]').setInputFiles({
    name: "private-owner-name.jpg",
    mimeType: "image/jpeg",
    buffer: image,
  });
  await imageForm.getByPlaceholder(/Truthful alt text/).fill("Synthetic access road view");
  await imageForm.getByRole("button", { name: "Upload" }).click();
  await expect(imageForm.getByRole("status")).toContainText("private staging");
  await expect(page.getByText("READY").first()).toBeVisible();

  await page.getByRole("button", { name: "Approve / promote" }).click();
  await expect(page.getByText("APPROVED").first()).toBeVisible();
  await page.getByRole("button", { name: "Set cover" }).click();
  await expect(page.getByText("Cover", { exact: true })).toBeVisible();

  const externalForm = page
    .locator("form")
    .filter({ has: page.getByRole("button", { name: "Add URL" }) });
  await externalForm.getByLabel("HTTPS URL").fill("https://youtu.be/AbCdEf12345?utm_source=e2e");
  await externalForm.getByRole("button", { name: "Add URL" }).click();
  await expect(externalForm.getByRole("status")).toContainText("validated and added");
  await expect(page.getByText("STANDARD_VIDEO")).toBeVisible();

  const pdf = Buffer.from(
    "%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n2 0 obj << /Type /Page >> endobj\n%%EOF",
  );
  const privateForm = page.locator("form").filter({ hasText: "Upload private evidence" });
  await privateForm.locator('input[type="file"]').setInputFiles({
    name: "private-title-record.pdf",
    mimeType: "application/pdf",
    buffer: pdf,
  });
  await privateForm.getByRole("button", { name: "Upload" }).click();
  await expect(privateForm.getByRole("status")).toContainText("scanned clean");
  await expect(page.getByRole("link", { name: "Create temporary link" })).toHaveAttribute(
    "href",
    /\/api\/admin\/private-documents\/[0-9a-f-]+\/download/,
  );

  await page.getByRole("link", { name: "Back to property" }).click();
  await expect(page.getByText("DRAFT").first()).toBeVisible();
  await page.getByRole("link", { name: "Review", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Publication readiness" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish property" })).toBeDisabled();
});

test("anonymous users cannot reach the media manager", async ({ page }) => {
  await page.goto("/admin/properties/20000000-0000-4000-8000-000000000001/media");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByText("Upload gallery image")).toHaveCount(0);
  const privateDownload = await page.request.get(
    "/api/admin/private-documents/ffffffff-ffff-4fff-8fff-ffffffffffff/download",
  );
  expect(privateDownload.status()).toBe(403);
});
