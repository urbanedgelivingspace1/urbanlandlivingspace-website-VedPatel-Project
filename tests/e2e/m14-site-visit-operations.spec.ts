import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";

import type { Database } from "@/types/database.generated";

test.describe.configure({ mode: "serial" });

const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const mobile = `98${String(Date.now()).slice(-8)}`;
let property: { id: string; slug: string; code: string };
let leadId: string;
let visitId: string;

function service() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Synthetic M14 E2E database is unavailable.");
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

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

test.beforeAll(async () => {
  const result = await service()
    .from("properties")
    .insert({
      public_slug: `m14-public-${unique}`,
      land_category: "AGRICULTURAL",
      primary_transaction_type: "BUY",
      publication_status: "PUBLISHED",
      availability_status: "AVAILABLE",
      listing_title: `M14 operations land ${unique}`,
      short_description: "Synthetic M14 browser workflow fixture.",
      district_id: "00000000-0000-4000-8000-000000000003",
      display_area_value: 2,
      display_area_unit_id: "10000000-0000-4000-8000-000000000006",
      location_visibility: "HIDDEN",
      published_at: new Date().toISOString(),
    })
    .select("id,public_slug,property_code")
    .single();
  if (!result.data?.public_slug) throw result.error;
  property = {
    id: result.data.id,
    slug: result.data.public_slug,
    code: result.data.property_code,
  };
});

test("M13 request flows through contact, proposal, confirmation, reschedule, completion and follow-up", async ({
  page,
}) => {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": "198.18.14.14" });
  await page.goto(`/site-visit?property=${property.slug}`);
  await expect(page.getByText(/not an automatic booking/i)).toBeVisible();
  await page.getByLabel("Name").fill(`M14 visitor ${unique}`);
  await page.getByLabel("Mobile number").fill(mobile);
  await page.getByLabel("Preferred date").fill("2099-01-02");
  await page.getByLabel("Preferred time window").selectOption("MORNING");
  await page.getByLabel(/I agree/).check();
  await page.getByRole("button", { name: "Request site visit" }).click();
  await expect(page).toHaveURL(/\/site-visit\/thank-you/);
  await expect(page.getByText(/not a confirmed booking/i)).toBeVisible();

  const party = await service().from("parties").select("id").eq("phone", `+91${mobile}`).single();
  if (!party.data) throw party.error;
  const lead = await service()
    .from("leads")
    .select("id,status")
    .eq("party_id", party.data.id)
    .single();
  if (!lead.data) throw lead.error;
  leadId = lead.data.id;
  expect(lead.data.status).toBe("NEW");
  const visit = await service()
    .from("site_visits")
    .select("id,status,version")
    .eq("lead_id", leadId)
    .single();
  if (!visit.data) throw visit.error;
  visitId = visit.data.id;
  expect(visit.data).toMatchObject({ status: "REQUESTED", version: 1 });

  await signIn(page);
  await page.goto(`/admin/site-visits?q=${encodeURIComponent(`M14 visitor ${unique}`)}`);
  await expect(page.getByRole("heading", { name: "Site visit queue" })).toBeVisible();
  await expect(page.getByRole("table").getByText("Requested", { exact: true })).toBeVisible();
  await page.locator(`a[href="/admin/site-visits/${visitId}"]`).click();

  await page.getByLabel("Contact outcome").fill("Reached visitor; reviewed access and timing");
  await page.getByRole("button", { name: "Mark contacted" }).click();
  await expect(page.getByText("Status: Contacted")).toBeVisible();
  await expect(page.getByText("Visit operation recorded.")).toBeVisible();

  await page.getByLabel("Start (IST)").fill("2099-01-03T10:00");
  await page.getByLabel("End (IST)").fill("2099-01-03T12:00");
  await page.getByLabel("Meeting/location instructions").fill("Meet at the public road entrance");
  await page.getByRole("button", { name: "Save proposal" }).click();
  await expect(page.getByText("Status: Proposed")).toBeVisible();
  expect(
    (await service().from("site_visits").select("confirmed_start_at").eq("id", visitId).single())
      .data?.confirmed_start_at,
  ).toBeNull();

  await page.getByRole("button", { name: "Confirm visit" }).click();
  await expect(page.getByText("Status: Confirmed")).toBeVisible();
  expect(
    (await service().from("leads").select("status").eq("id", leadId).single()).data?.status,
  ).toBe("SITE_VISIT_CONFIRMED");

  await page.getByLabel("Start (IST)").fill("2099-01-04T14:00");
  await page.getByLabel("End (IST)").fill("2099-01-04T16:00");
  await page.getByLabel("Reschedule reason").fill("Visitor requested an afternoon slot");
  await page.getByRole("button", { name: "Record reschedule" }).click();
  await expect(page.getByText("Status: Rescheduled")).toBeVisible();
  await expect(page.getByText(/Prior:/).first()).toBeVisible();
  expect(
    (await service().from("site_visits").select("confirmed_start_at").eq("id", visitId).single())
      .data?.confirmed_start_at,
  ).toBeNull();
  expect(
    (await service().from("leads").select("status").eq("id", leadId).single()).data?.status,
  ).toBe("SITE_VISIT_REQUESTED");

  await page.getByRole("button", { name: "Confirm visit" }).click();
  await expect(page.getByText("Status: Confirmed")).toBeVisible();
  const current = await service().from("site_visits").select("version").eq("id", visitId).single();
  const stale = await service().rpc("transition_site_visit", {
    requested_actor_id: (
      await service()
        .from("admin_profiles")
        .select("user_id")
        .eq("is_active", true)
        .limit(1)
        .single()
    ).data!.user_id,
    requested_visit_id: visitId,
    requested_expected_version: current.data!.version - 1,
    requested_next_status: "CANCELLED",
    requested_payload: { reason: "Stale browser" },
  });
  expect(stale.error?.message).toContain("STALE_SITE_VISIT");

  const pastStart = new Date(Date.now() - 7_200_000).toISOString();
  const pastEnd = new Date(Date.now() - 3_600_000).toISOString();
  const timeShift = await service()
    .from("site_visits")
    .update({
      proposed_start_at: pastStart,
      proposed_end_at: pastEnd,
      confirmed_start_at: pastStart,
      confirmed_end_at: pastEnd,
    })
    .eq("id", visitId);
  if (timeShift.error) throw timeShift.error;
  await page.reload();
  await page.getByLabel("Outcome").fill("INTERESTED");
  await page.getByLabel("Buyer reaction / next action").fill("Discuss commercials tomorrow");
  await page.getByRole("button", { name: "Mark completed" }).click();
  await expect(page.getByText("Status: Completed")).toBeVisible();
  expect(
    (await service().from("leads").select("status").eq("id", leadId).single()).data?.status,
  ).toBe("SITE_VISIT_COMPLETED");

  await page.getByLabel("Next contact (IST)").fill("2099-01-05T10:00");
  await page.getByLabel("Follow-up type").selectOption("NEGOTIATION");
  await page.getByLabel("Context").fill("Discuss commercial terms");
  await page.getByRole("button", { name: "Schedule separate follow-up" }).click();
  await expect(page.getByText("CRM follow-up scheduled and linked.")).toBeVisible();
  const followUp = await service()
    .from("lead_follow_ups")
    .select("site_visit_id,completed_at")
    .eq("site_visit_id", visitId)
    .single();
  expect(followUp.data).toEqual({ site_visit_id: visitId, completed_at: null });
  expect(
    (await service().from("site_visits").select("status").eq("id", visitId).single()).data?.status,
  ).toBe("COMPLETED");
});

test("no-show, cancellation, availability conflict, mobile layout and accessibility remain operational", async ({
  page,
}) => {
  await signIn(page);
  const actor = await service()
    .from("admin_profiles")
    .select("user_id")
    .eq("is_active", true)
    .limit(1)
    .single();
  if (!actor.data) throw actor.error;
  const pastStart = new Date(Date.now() - 7_200_000).toISOString();
  const pastEnd = new Date(Date.now() - 3_600_000).toISOString();
  const seeded = await service()
    .from("site_visits")
    .insert({
      lead_id: leadId,
      property_id: property.id,
      status: "CONFIRMED",
      proposed_start_at: pastStart,
      proposed_end_at: pastEnd,
      confirmed_start_at: pastStart,
      confirmed_end_at: pastEnd,
      assigned_to: actor.data.user_id,
    })
    .select("id")
    .single();
  if (!seeded.data) throw seeded.error;
  await service().from("leads").update({ status: "SITE_VISIT_CONFIRMED" }).eq("id", leadId);
  await page.goto(`/admin/site-visits/${seeded.data.id}`);
  await page.getByLabel("No-show context").fill("Visitor did not attend");
  await page.getByRole("button", { name: "Record no-show" }).click();
  await expect(page.getByText("Status: No show")).toBeVisible();
  expect(
    (
      await service()
        .from("site_visits")
        .select("completed_at,cancelled_at")
        .eq("id", seeded.data.id)
        .single()
    ).data,
  ).toEqual({ completed_at: null, cancelled_at: null });

  await page.getByLabel("Start (IST)").fill("2099-01-07T10:00");
  await page.getByLabel("End (IST)").fill("2099-01-07T12:00");
  await page.getByLabel("Reschedule reason").fill("Visitor asked to try again");
  await page.getByRole("button", { name: "Record reschedule" }).click();
  await expect(page.getByText("Status: Rescheduled")).toBeVisible();

  await page.getByText("Cancel visit").click();
  await page.getByLabel("Cancellation reason").fill("Visitor withdrew request");
  await page.getByRole("button", { name: "Confirm cancellation" }).click();
  await expect(page.getByText("Status: Cancelled")).toBeVisible();

  const conflictVisit = await service()
    .from("site_visits")
    .insert({
      lead_id: leadId,
      property_id: property.id,
      status: "CONTACTED",
      contacted_at: new Date().toISOString(),
      contact_outcome: "Reached",
    })
    .select("id")
    .single();
  if (!conflictVisit.data) throw conflictVisit.error;
  await service().from("properties").update({ availability_status: "SOLD" }).eq("id", property.id);
  await page.goto(`/admin/site-visits/${conflictVisit.data.id}`);
  await expect(page.getByRole("alert").filter({ hasText: "Property is sold" })).toBeVisible();
  await page.getByLabel("Start (IST)").fill("2099-01-08T10:00");
  await page.getByLabel("End (IST)").fill("2099-01-08T12:00");
  await page.getByRole("button", { name: "Save proposal" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "no longer eligible" })).toBeVisible();
  expect(
    (await service().from("site_visits").select("status").eq("id", conflictVisit.data.id).single())
      .data?.status,
  ).toBe("CONTACTED");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/site-visits?status=REQUESTED");
  await expect(page.getByLabel("Site visit filters")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.getByLabel("Search site visits").focus();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Visit status")).toBeFocused();
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test("unauthorized visitors cannot open site-visit operations", async ({ browser }) => {
  const anonymous = await browser.newPage();
  await anonymous.goto("/admin/site-visits");
  await expect(anonymous).toHaveURL(/\/admin\/login\?reason=/);
  await anonymous.close();
});
