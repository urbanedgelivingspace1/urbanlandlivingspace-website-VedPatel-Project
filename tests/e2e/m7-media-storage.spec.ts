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
  await page.getByRole("button", { name: "Save & Next →" }).click();
  await expect(page).toHaveURL(/\/admin\/properties\/[0-9a-f-]+\/media$/);
}

test("active admin uploads a photo batch and connects a Drive brochure without publishing", async ({
  page,
}) => {
  await signIn(page);
  await createDraft(page);
  await expect(page.getByRole("heading", { name: "Photos & Brochure" })).toBeVisible();
  await expect(page.getByText(/Private Documents/)).toHaveCount(0);
  await expect(page.getByText("Add Documents")).toHaveCount(0);
  await expect(page.getByText("Document Category")).toHaveCount(0);
  await expect(page.getByText(/Drop documents here/)).toHaveCount(0);

  const image = await sharp({
    create: { width: 1200, height: 800, channels: 3, background: "#9b865b" },
  })
    .jpeg()
    .withMetadata({ exif: { IFD0: { ImageDescription: "PRIVATE_E2E_GPS_CANARY" } } })
    .toBuffer();
  const secondImage = await sharp({
    create: { width: 1200, height: 800, channels: 3, background: "#806f54" },
  })
    .jpeg()
    .toBuffer();
  const imageForm = page.locator("form").filter({ hasText: "Drag photos here" });
  await imageForm.locator('input[type="file"]').setInputFiles([
    { name: "front-view.jpg", mimeType: "image/jpeg", buffer: image },
    { name: "failed-photo.png", mimeType: "image/png", buffer: Buffer.from("not an image") },
    { name: "road-view.jpg", mimeType: "image/jpeg", buffer: secondImage },
  ]);
  await expect(imageForm.getByText("3 photos selected")).toBeVisible();
  await imageForm.getByRole("button", { name: "Upload 3 Photos" }).click();
  await expect(imageForm.getByRole("status")).toContainText("2 of 3 photos were added");
  await expect(imageForm.getByRole("status")).toContainText("failed-photo.png");
  await expect(page.getByText("Photo 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Photo 2", { exact: true })).toBeVisible();
  await expect(page.getByText("✓ Current Cover")).toBeVisible();

  await page.getByRole("button", { name: "Use Photo 2 as Cover" }).click();
  await expect(page.getByText("✓ Current Cover")).toBeVisible();

  const brochureForm = page.locator("form").filter({ hasText: "Google Drive brochure link" });
  await brochureForm
    .getByLabel("Google Drive brochure link")
    .fill("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz_12345/view?usp=sharing");
  await brochureForm.getByRole("button", { name: "Save Brochure" }).click();
  await expect(page.getByText("✓ Brochure connected")).toBeVisible();
  await expect(page.getByRole("link", { name: "Test / Download Brochure" })).toHaveAttribute(
    "href",
    "https://drive.usercontent.google.com/download?export=download&confirm=t&id=1AbCdEfGhIjKlMnOpQrStUvWxYz_12345",
  );
  await expect(page.getByText(/Private evidence|External media|Approve \/ promote/)).toHaveCount(0);

  await page.getByRole("link", { name: /Save & Next/ }).click();
  await expect(page).toHaveURL(/\/preview$/);
  await page.getByRole("link", { name: /← Photos & Documents/ }).click();
  await expect(page).toHaveURL(/\/media$/);
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
