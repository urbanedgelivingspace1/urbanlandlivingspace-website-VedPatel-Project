import { createClient, type SupabaseClient } from "@supabase/supabase-js";
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

async function rpc(result: PromiseLike<{ error: { message: string } | null }>) {
  const resolved = await result;
  if (resolved.error) throw new Error(resolved.error.message);
}

async function completeRequiredChecks(
  client: SupabaseClient<Database>,
  actorId: string,
  propertyId: string,
) {
  await rpc(
    client.rpc("initialize_property_verifications", {
      requested_actor_id: actorId,
      requested_property_id: propertyId,
    }),
  );
  const definitions = await client
    .from("verification_check_definitions")
    .select("id,code")
    .in("code", ["PROPERTY_IDENTITY_REVIEWED", "REVENUE_RECORDS_REVIEWED"]);
  if (definitions.error) throw definitions.error;
  const definitionByCode = new Map(definitions.data.map(({ code, id }) => [code, id]));
  const checks = await client
    .from("property_verifications")
    .select("id,check_definition_id")
    .eq("property_id", propertyId)
    .in("check_definition_id", [...definitionByCode.values()]);
  if (checks.error) throw checks.error;
  const checkByCode = new Map(
    [...definitionByCode].map(([code, definitionId]) => [
      code,
      checks.data.find((check) => check.check_definition_id === definitionId)?.id,
    ]),
  );
  const document = await client
    .from("private_documents")
    .select("id")
    .eq("property_id", propertyId)
    .eq("scan_status", "CLEAN")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (document.error) throw document.error;

  for (const configuration of [
    {
      code: "PROPERTY_IDENTITY_REVIEWED",
      evidenceType: "OWNER_DOCUMENT",
      sourceClass: "URBANEDGE_OPERATIONAL_POLICY",
      target: "PASSED_WITH_NOTE",
      notes: "Owner-provided evidence was reviewed for the bounded scope.",
      sourceVerified: false,
    },
    {
      code: "REVENUE_RECORDS_REVIEWED",
      evidenceType: "OFFICIAL_RECORD",
      sourceClass: "OFFICIAL_ADMINISTRATIVE_PRACTICE",
      target: "PASSED",
      notes: undefined,
      sourceVerified: true,
    },
  ] as const) {
    const verificationId = checkByCode.get(configuration.code);
    if (!verificationId) throw new Error(`Required ${configuration.code} check was not found.`);
    await rpc(
      client.rpc("transition_property_verification", {
        requested_actor_id: actorId,
        requested_verification_id: verificationId,
        requested_target: "IN_REVIEW",
        requested_payload: {},
      }),
    );
    const evidence = await client.rpc("link_verification_evidence", {
      requested_actor_id: actorId,
      requested_verification_id: verificationId,
      requested_payload: {
        privateDocumentId: document.data.id,
        evidenceType: configuration.evidenceType,
        sourceClass: configuration.sourceClass,
        evidenceReference: `SYNTHETIC-M9-${configuration.code}`,
      },
    });
    if (evidence.error) throw evidence.error;
    await rpc(
      client.rpc("advance_verification_evidence", {
        requested_actor_id: actorId,
        requested_evidence_id: evidence.data,
        requested_state: "REVIEWED",
      }),
    );
    if (configuration.sourceVerified) {
      await rpc(
        client.rpc("advance_verification_evidence", {
          requested_actor_id: actorId,
          requested_evidence_id: evidence.data,
          requested_state: "SOURCE_VERIFIED",
        }),
      );
    }
    await rpc(
      client.rpc("transition_property_verification", {
        requested_actor_id: actorId,
        requested_verification_id: verificationId,
        requested_target: configuration.target,
        requested_payload: {
          scopeStatement: `The required ${configuration.code} references were reviewed for this synthetic parcel.`,
          limitations: "Bounded record scope only; no title or legal guarantee.",
          notes: configuration.notes,
          recheckAt: "2099-01-01T00:00:00Z",
        },
      }),
    );
  }
}

test("M9 publishes and unpublishes only a complete public-safe property", async ({ page }) => {
  test.setTimeout(120_000);
  await signIn(page);
  await page.goto("/admin/properties/new");
  const unique = Date.now();
  const title = `Synthetic M9 public property ${unique}`;
  await page.getByLabel("Property title (optional)").fill(title);
  await page
    .getByLabel("Public slug (optional; generated from title when blank)")
    .fill(`synthetic-m9-public-${unique}`);
  await page
    .getByLabel("Short description")
    .fill("A complete public summary for the controlled M9 publication scenario.");
  await page
    .getByLabel("Description", { exact: true })
    .fill("A complete public description for controlled publication without legal guarantees.");
  await page.getByLabel("District").selectOption({ label: "Ahmedabad" });
  await page.getByLabel("Public-safe address").fill("Synthetic public area, Ahmedabad district");
  await page.getByLabel("Display area").fill("2.5");
  await page.locator('select[name="displayAreaUnitId"]').selectOption({ label: "Acre (ac)" });
  await page.locator('select[name="locationVisibility"]').selectOption("HIDDEN");
  await page.getByLabel("Private latitude").fill("23.022505");
  await page.getByLabel("Private longitude").fill("72.571365");
  await page.getByLabel("Private location notes").fill("PRIVATE_M9_E2E_LOCATION_CANARY");
  await page.getByLabel("Tenure type").fill("Recorded tenure");
  await page.getByLabel("Irrigation status").fill("Recorded irrigation context");
  await page.getByLabel("Road touch observed").check();
  await page.getByLabel("Source type").fill("SYNTHETIC_E2E");
  await page.getByLabel("Source name").fill("M9 controlled fixture");
  await page.getByRole("button", { name: "Create draft" }).click();
  await expect(page).toHaveURL(/\/admin\/properties\/[0-9a-f-]+$/);
  const propertyId = page.url().split("/").at(-1) as string;

  await page.getByRole("link", { name: "Review", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Publication readiness" })).toBeVisible();
  await expect(
    page.getByText("Choose one approved public cover image with alt text."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish property" })).toBeDisabled();

  await page.getByRole("link", { name: "Public preview" }).click();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByText("PRIVATE_M9_E2E_LOCATION_CANARY")).toHaveCount(0);
  await page.getByRole("link", { name: "Back to publication readiness" }).click();
  await page.getByRole("link", { name: /Media/ }).click();
  await page.getByRole("link", { name: "Upload & manage media" }).click();
  const image = await sharp({
    create: { width: 1200, height: 800, channels: 3, background: "#8d724d" },
  })
    .jpeg()
    .toBuffer();
  const imageForm = page.locator("form").filter({ hasText: "Upload gallery image" });
  await imageForm.locator('input[type="file"]').setInputFiles({
    name: "synthetic-m9-cover.jpg",
    mimeType: "image/jpeg",
    buffer: image,
  });
  await imageForm.getByPlaceholder(/Truthful alt text/).fill("Synthetic agricultural frontage");
  await imageForm.getByRole("button", { name: "Upload" }).click();
  await expect(imageForm.getByRole("status")).toContainText("private staging");
  await page.getByRole("button", { name: "Approve / promote" }).click();
  await page.getByRole("button", { name: "Set cover" }).click();

  const documentForm = page.locator("form").filter({ hasText: "Upload private evidence" });
  await documentForm.locator('input[type="file"]').setInputFiles({
    name: "private-m9-record.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from(
      "%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n2 0 obj << /Type /Page >> endobj\n%%EOF",
    ),
  });
  await documentForm.getByRole("button", { name: "Upload" }).click();
  await expect(documentForm.getByRole("status")).toContainText("scanned clean");

  const { client, actorId } = await serviceContext();
  await completeRequiredChecks(client, actorId, propertyId);
  await page.goto(`/admin/properties/${propertyId}?tab=review`);
  await expect(page.getByText("NO BLOCKERS")).toBeVisible();
  await expect(page.getByText(/does not block standard marketing publication/)).toBeVisible();
  await page
    .getByLabel(
      /I reviewed every readiness group and understand publication is not a legal guarantee/,
    )
    .check();
  await page.getByRole("button", { name: "Publish property" }).click();
  await expect(page.getByText("PUBLISHED").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Unpublish property" })).toBeVisible();

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
    location_visibility: "HIDDEN",
    public_latitude: null,
    public_longitude: null,
  });
  expect(JSON.stringify(published.data)).not.toContain("PRIVATE_M9");

  await page.getByRole("link", { name: "Activity" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Mark Property Sold" }).click();
  await expect(page.getByText("SOLD", { exact: true }).first()).toBeVisible();
  const sold = await anonymous
    .from("public_property_listings")
    .select("availability_status")
    .eq("id", propertyId)
    .single();
  expect(sold.data?.availability_status).toBe("SOLD");

  await page.getByRole("link", { name: "Review", exact: true }).click();
  await page.getByLabel("Reason for unpublishing").fill("Synthetic M9 E2E removal check");
  await page.getByRole("button", { name: "Unpublish property" }).click();
  await expect(page.getByText("UNPUBLISHED").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish property" })).toBeVisible();
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
