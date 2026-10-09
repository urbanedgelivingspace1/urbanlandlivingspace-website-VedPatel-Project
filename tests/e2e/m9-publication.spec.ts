import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";

import type { Database } from "@/types/database.generated";

function environment() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!url || !anonKey || !serviceKey || !email || !password) {
    throw new Error("Synthetic M9 E2E environment was not initialized.");
  }
  return { url, anonKey, serviceKey, email, password };
}

async function signIn(page: Page) {
  const { email, password } = environment();
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

async function serviceContext() {
  const { url, serviceKey, email } = environment();
  const client = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const users = await client.auth.admin.listUsers();
  if (users.error) throw users.error;
  const actor = users.data.users.find((user) => user.email === email);
  if (!actor) throw new Error("Synthetic M9 admin actor was not found.");
  return { client, actorId: actor.id };
}

test("M9 publishes and unpublishes only a complete public-safe property", async ({ page }) => {
  test.setTimeout(120_000);
  await signIn(page);
  await page.goto("/admin/properties/new");
  const unique = Date.now();
  const title = `Synthetic M9 public property ${unique}`;
  await page.getByLabel("Property title (optional)").fill(title);
  await page
    .getByLabel("Website address (generated automatically when blank)")
    .fill(`synthetic-m9-public-${unique}`);
  await page
    .getByLabel("Short description")
    .fill("A complete public summary for the controlled M9 publication scenario.");
  await page
    .getByLabel("Description", { exact: true })
    .fill("A complete public description for controlled publication without legal guarantees.");
  await page.getByLabel("District").selectOption({ label: "Ahmedabad" });
  await page.getByLabel("Location Title").fill("Synthetic public area, Ahmedabad district");
  await page
    .getByLabel("Google Maps Embed")
    .fill("https://www.google.com/maps/embed?pb=synthetic-m9-map");
  await page.getByLabel("Area", { exact: true }).fill("2.5");
  await page.locator('select[name="displayAreaUnitId"]').selectOption({ label: "Acre (ac)" });
  await page.locator("details > summary").filter({ hasText: "Agricultural Details" }).click();
  await page.getByLabel("Tenure type").fill("Recorded tenure");
  await page.getByLabel("Irrigation status").fill("Recorded irrigation context");
  await page.getByLabel("Road touch observed").check();
  await page.locator("details > summary").filter({ hasText: "Source Details" }).click();
  await page.getByLabel("Source type").fill("SYNTHETIC_E2E");
  await page.getByLabel("Source name").fill("M9 controlled fixture");
  await page.getByRole("button", { name: "Save & Next →" }).click();
  await expect(page).toHaveURL(/\/admin\/properties\/[0-9a-f-]+\/media$/);
  const propertyId = page.url().split("/").at(-2) as string;

  await page.getByRole("link", { name: /Save & Next/ }).click();
  await expect(
    page.getByText("Choose one approved public cover image with alt text."),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.getByRole("link", { name: /Continue to Publish/ }).click();
  await expect(page.getByRole("button", { name: "Publish Property" })).toBeDisabled();
  await page.getByRole("link", { name: /← Preview/ }).click();
  await page.getByRole("link", { name: /← Photos & Documents/ }).click();
  const image = await sharp({
    create: { width: 1200, height: 800, channels: 3, background: "#8d724d" },
  })
    .jpeg()
    .toBuffer();
  const imageForm = page.locator("form").filter({ hasText: "Drag photos here" });
  await imageForm.locator('input[type="file"]').setInputFiles({
    name: "synthetic-m9-cover.jpg",
    mimeType: "image/jpeg",
    buffer: image,
  });
  await imageForm.getByRole("button", { name: "Upload 1 Photo" }).click();
  await expect(imageForm.getByRole("status")).toContainText("1 photo added");
  await expect(page.getByText("✓ Current Cover")).toBeVisible();

  const { client, actorId } = await serviceContext();
  await page.getByRole("link", { name: /Save & Next/ }).click();
  await expect(page.getByRole("heading", { name: "Ready to publish" })).toBeVisible();
  await page.getByRole("link", { name: /Continue to Publish/ }).click();
  await page.getByLabel(/I’ve reviewed this listing/).check();
  await page.getByRole("button", { name: "Publish Property" }).click();
  await expect(
    page.getByRole("heading", { name: "Property published successfully" }),
  ).toBeVisible();

  const anonymous = createClient<Database>(environment().url, environment().anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const published = await anonymous
    .from("public_property_listings")
    .select(
      "id,listing_title,availability_status,location_visibility,public_latitude,public_longitude",
    )
    .eq("id", propertyId)
    .single();
  expect(published.error).toBeNull();
  expect(published.data).toMatchObject({
    id: propertyId,
    listing_title: title,
    availability_status: "AVAILABLE",
    location_visibility: "APPROXIMATE",
    public_latitude: null,
    public_longitude: null,
  });
  expect(JSON.stringify(published.data)).not.toContain("PRIVATE_M9");

  await page.goto(`/admin/properties/${propertyId}?tab=activity`);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Mark Property Sold" }).click();
  await expect(page.getByText("SOLD", { exact: true }).first()).toBeVisible();
  const sold = await anonymous
    .from("public_property_listings")
    .select("availability_status")
    .eq("id", propertyId)
    .single();
  expect(sold.data?.availability_status).toBe("SOLD");

  await page.goto(`/admin/properties/${propertyId}`);
  await page.getByText("Publishing options").click();
  await page.getByLabel("Reason for unpublishing").fill("Synthetic M9 E2E removal check");
  await page.getByRole("button", { name: "Unpublish" }).click();
  await expect(page.getByText("UNPUBLISHED").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish Property" })).toBeVisible();
  const unpublished = await anonymous
    .from("public_property_listings")
    .select("id")
    .eq("id", propertyId);
  expect(unpublished.data).toEqual([]);

  const expected = await client
    .from("properties")
    .select("updated_at")
    .eq("id", propertyId)
    .single();
  if (expected.error) throw expected.error;
  const anonymousPublish = await anonymous.rpc("publish_property", {
    requested_actor_id: actorId,
    requested_property_id: propertyId,
    requested_expected_updated_at: expected.data.updated_at,
  });
  expect(anonymousPublish.data).toBeNull();
  expect(anonymousPublish.error).not.toBeNull();

  const nonAdminEmail = process.env.E2E_NON_ADMIN_EMAIL;
  if (!nonAdminEmail) throw new Error("Synthetic non-admin was not initialized.");
  const nonAdmin = createClient<Database>(environment().url, environment().anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const signedIn = await nonAdmin.auth.signInWithPassword({
    email: nonAdminEmail,
    password: environment().password,
  });
  if (signedIn.error || !signedIn.data.user) throw signedIn.error;
  const nonAdminPublish = await nonAdmin.rpc("publish_property", {
    requested_actor_id: signedIn.data.user.id,
    requested_property_id: propertyId,
    requested_expected_updated_at: expected.data.updated_at,
  });
  expect(nonAdminPublish.data).toBeNull();
  expect(nonAdminPublish.error).not.toBeNull();
});
