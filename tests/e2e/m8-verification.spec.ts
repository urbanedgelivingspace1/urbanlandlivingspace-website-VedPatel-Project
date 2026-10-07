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

test("removed verification admin routes return not found", async ({ page }) => {
  await signIn(page);
  const propertyId = "20000000-0000-4000-8000-000000000001";

  for (const route of [
    "/admin/verification",
    "/admin/verification/queue",
    `/admin/verification/${propertyId}`,
    `/admin/properties/${propertyId}/verification`,
  ]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  }
});

test("historical verification evidence remains private", async () => {
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
});
