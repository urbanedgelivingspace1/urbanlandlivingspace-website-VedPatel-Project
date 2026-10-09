import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import type { Database } from "@/types/database.generated";

test.describe.configure({ mode: "serial" });
let propertyId: string;
function service() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Synthetic E2E database is unavailable.");
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
async function signIn(page: Page, email = process.env.E2E_ADMIN_EMAIL) {
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Synthetic E2E admin was not initialized.");
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in securely" }).click();
  if (email === process.env.E2E_ADMIN_EMAIL) {
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  }
}
function indiaLocalInput(daysFromNow: number) {
  return new Date(Date.now() + (daysFromNow * 24 * 60 + 330) * 60_000).toISOString().slice(0, 16);
}
function indiaTodayAtNoon() {
  const day = new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);
  return `${day}T06:30:00.000Z`;
}
test.beforeAll(async () => {
  const result = await service()
    .from("properties")
    .insert({
      land_category: "AGRICULTURAL",
      primary_transaction_type: "BUY",
      district_id: "00000000-0000-4000-8000-000000000003",
      display_area_value: 2,
      display_area_unit_id: "10000000-0000-4000-8000-000000000006",
      listing_title: "M12 E2E candidate",
    })
    .select("id")
    .single();
  if (!result.data) throw result.error;
  propertyId = result.data.id;
});

test("CRM is one sidebar module with four routed workspace tabs", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/leads");

  const sidebar = page.getByRole("navigation", { name: "Admin" });
  await expect(sidebar.getByRole("link", { name: "CRM" })).toHaveCount(1);
  await expect(sidebar.getByRole("link", { name: "CRM" })).toHaveAttribute("aria-current", "page");
  await expect(sidebar.getByRole("link", { name: "Leads" })).toHaveCount(0);
  await expect(sidebar.getByRole("link", { name: "Pipeline" })).toHaveCount(0);
  await expect(sidebar.getByRole("link", { name: "Follow-ups" })).toHaveCount(0);
  await expect(sidebar.getByRole("link", { name: "Site visits" })).toHaveCount(0);

  const crmTabs = page.getByRole("navigation", { name: "CRM workspaces" });
  await crmTabs.getByRole("link", { name: "Pipeline" }).click();
  await expect(page).toHaveURL(/\/admin\/leads\/pipeline$/);
  await expect(crmTabs.getByRole("link", { name: "Pipeline" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await crmTabs.getByRole("link", { name: "Follow-ups" }).click();
  await expect(page).toHaveURL(/\/admin\/follow-ups$/);
  await expect(crmTabs.getByRole("link", { name: "Follow-ups" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await crmTabs.getByRole("link", { name: "Site visits" }).click();
  await expect(page).toHaveURL(/\/admin\/site-visits$/);
  await expect(crmTabs.getByRole("link", { name: "Site visits" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await crmTabs.getByRole("link", { name: "Leads" }).click();
  await expect(page).toHaveURL(/\/admin\/leads$/);
  await expect(crmTabs.getByRole("link", { name: "Leads" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("link", { name: "+ New lead" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("admin operates the complete lead, demand, matching, follow-up and closure workflow", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const leadName = `Synthetic M12 Buyer ${Date.now()}`;
  await signIn(page);
  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await page.goto("/admin/leads/new");
  await page.getByLabel("Full name").fill(leadName);
  await page.getByLabel("Phone", { exact: true }).fill(String(Date.now()).slice(-10));
  await page.getByLabel("Buyer or seller?").selectOption("BUYER_REQUIREMENT");
  await page.getByLabel("Transaction").selectOption("BUY");
  await page.getByLabel("Land category").selectOption("AGRICULTURAL");
  await page.getByLabel("District").selectOption({ label: "Ahmedabad" });
  await page.getByRole("button", { name: "Add Lead" }).click();
  await expect(page).toHaveURL(/\/admin\/leads\/[0-9a-f-]+$/);
  const leadId = page.url().split("/").at(-1) as string;

  await page.getByText("Edit lead", { exact: true }).click();
  await page.getByLabel("Intended use").fill("Long-term agricultural investment");
  await page.getByRole("button", { name: "Save lead" }).click();
  await expect(page.getByText("Long-term agricultural investment")).toBeVisible();

  const firstStageChoices = await page
    .getByLabel("Move lead to")
    .locator("option")
    .allTextContents();
  expect(firstStageChoices).not.toContain("Properties shared");
  await page.getByLabel("Activity").selectOption("CONTACT_ATTEMPTED");
  await page.getByLabel("Private note").fill("Initial phone attempt");
  await page.getByRole("button", { name: "Record" }).click();
  await expect(page.getByText("Initial phone attempt")).toBeVisible();
  await page.getByLabel("Move lead to").selectOption("CONTACT_ATTEMPTED");
  await page.getByLabel("Short note (optional)").fill("Phone");
  await page.getByRole("button", { name: "Update lead stage" }).click();
  await expect(page.getByText("Contact started", { exact: true }).last()).toBeVisible();
  await page.getByLabel("Move lead to").selectOption("QUALIFIED");
  await page.getByLabel("Short note (optional)").fill("Qualified buyer");
  await page.getByRole("button", { name: "Update lead stage" }).click();
  await page.getByLabel("Minimum area").fill("1");
  await page.getByLabel("Maximum area").fill("3");
  await page.getByLabel("Area unit").selectOption("10000000-0000-4000-8000-000000000006");
  await page.getByLabel("Requirement notes").fill("Agricultural land near Ahmedabad");
  await page.getByRole("button", { name: "Save requirement" }).click();
  await expect(page).toHaveURL(/saved=requirement/);
  await page.getByLabel("Move lead to").selectOption("REQUIREMENT_CONFIRMED");
  await page.getByLabel("Short note (optional)").fill("Reviewed requirement");
  await page.getByRole("button", { name: "Update lead stage" }).click();
  const candidateCard = page.locator("article").filter({
    has: page.locator(`a[href="/admin/properties/${propertyId}"]`),
  });
  await candidateCard.getByRole("button", { name: "Add match" }).click();
  await expect(page.locator(`a[href="/admin/properties/${propertyId}"]`).last()).toBeVisible();
  await page.getByRole("button", { name: "Remove match" }).click();
  await expect(page.getByText("No candidate properties linked.")).toBeVisible();
  await candidateCard.getByRole("button", { name: "Add match" }).click();
  await expect(page.locator(`a[href="/admin/properties/${propertyId}"]`).last()).toBeVisible();
  await page.getByLabel("Move lead to").selectOption("PROPERTY_MATCHED");
  await page.getByLabel("Short note (optional)").fill("Candidate linked");
  await page.getByRole("button", { name: "Update lead stage" }).click();
  const dueInput = page.getByLabel(/Due in India time|Reschedule for/);
  const scheduledFor = indiaLocalInput(2);
  await dueInput.fill(scheduledFor);
  await expect(dueInput).toHaveValue(scheduledFor);
  await page.locator('select[name="followUpType"]').selectOption("CALL");
  await page.getByLabel("Context", { exact: true }).fill("Discuss shortlist");
  await dueInput.press("Enter");
  await expect(page).toHaveURL(/saved=follow-up/);

  const openFollowUp = await service()
    .from("lead_follow_ups")
    .select("id")
    .eq("lead_id", leadId)
    .is("completed_at", null)
    .single();
  if (!openFollowUp.data) throw openFollowUp.error;
  const followUpId = openFollowUp.data.id;

  const overdue = await service()
    .from("lead_follow_ups")
    .update({ due_at: new Date(Date.now() - 36 * 60 * 60_000).toISOString() })
    .eq("id", followUpId);
  expect(overdue.error).toBeNull();
  await page.goto("/admin/follow-ups?bucket=OVERDUE");
  await expect(page.getByRole("link", { name: leadName })).toBeVisible();

  const today = await service()
    .from("lead_follow_ups")
    .update({ due_at: indiaTodayAtNoon() })
    .eq("id", followUpId);
  expect(today.error).toBeNull();
  await page.goto("/admin/follow-ups?bucket=TODAY");
  await expect(page.getByRole("link", { name: leadName })).toBeVisible();

  const upcoming = await service()
    .from("lead_follow_ups")
    .update({ due_at: new Date(Date.now() + 8 * 24 * 60 * 60_000).toISOString() })
    .eq("id", followUpId);
  expect(upcoming.error).toBeNull();
  await page.goto("/admin/follow-ups?bucket=UPCOMING");
  const upcomingItem = page.locator("li").filter({ hasText: leadName });
  await expect(upcomingItem.getByRole("link", { name: leadName })).toBeVisible();
  await upcomingItem.getByText("Complete", { exact: true }).click();
  await upcomingItem.getByLabel(/Outcome for/).fill("Buyer contacted");
  await upcomingItem.getByRole("button", { name: "Save completion" }).click();
  await expect(upcomingItem).toHaveCount(0);
  await page.goto("/admin/follow-ups?bucket=COMPLETED");
  await expect(page.locator("li").filter({ hasText: leadName })).toContainText("Buyer contacted");
  const update = await service().from("leads").update({ status: "NEGOTIATION" }).eq("id", leadId);
  expect(update.error).toBeNull();
  await page.goto(`/admin/leads/${leadId}`);
  await page.getByLabel("Move lead to").selectOption("CLOSED_WON");
  await page.getByLabel("What was agreed?").fill("Transaction confirmed");
  await page.getByRole("button", { name: "Update lead stage" }).click();
  await expect(page.getByText("Completed", { exact: true }).last()).toBeVisible();

  // Explicitly verify CLOSED_WON does NOT change property availability
  const propCheck = await service()
    .from("properties")
    .select("availability_status")
    .eq("id", propertyId)
    .single();
  expect(propCheck.data?.availability_status).toBe("AVAILABLE");

  // Explicitly verify only the explicit [Mark Property Sold] action changes property availability to SOLD
  await page.goto(`/admin/properties/${propertyId}`);
  await page.getByRole("link", { name: "Status & history" }).click();
  await expect(page.getByRole("button", { name: "Mark Property Sold" })).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Mark Property Sold" }).click();
  await expect(page.getByText("SOLD", { exact: true }).first()).toBeVisible();

  const soldCheck = await service()
    .from("properties")
    .select("availability_status")
    .eq("id", propertyId)
    .single();
  expect(soldCheck.data?.availability_status).toBe("SOLD");

  await page.goto(`/admin/leads?q=${encodeURIComponent(leadName)}`);
  await expect(page.getByRole("link", { name: leadName })).toBeVisible();
  await page.getByLabel("Stage").selectOption("CLOSED_WON");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page).toHaveURL(/status=CLOSED_WON/);
  await expect(page.getByRole("link", { name: leadName })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: "Leads", exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  const lostLeadName = `Synthetic M12 Lost ${Date.now()}`;
  await page.goto("/admin/leads/new");
  await page.getByLabel("Full name").fill(lostLeadName);
  await page.getByLabel("Phone", { exact: true }).fill(String(Date.now() + 1).slice(-10));
  await page.getByRole("button", { name: "Add Lead" }).click();
  await page.getByLabel("Move lead to").selectOption("CLOSED_LOST");
  await page.getByLabel("Why is it not going ahead?").selectOption("NOT_INTERESTED");
  await page.getByRole("button", { name: "Update lead stage" }).click();
  await expect(page.getByText("Not going ahead", { exact: true }).last()).toBeVisible();
});

test("inactive and anonymous actors cannot read CRM", async ({ browser }) => {
  const anonymous = await browser.newPage();
  await anonymous.goto("/admin/leads");
  await expect(anonymous).toHaveURL(/\/admin\/login/);
  await expect(anonymous.getByText("Lead inbox")).toHaveCount(0);
  const guessedLead = await browser.newPage();
  await guessedLead.goto(`/admin/leads/${crypto.randomUUID()}`);
  await expect(guessedLead).toHaveURL(/\/admin\/login/);
  await guessedLead.close();
  await anonymous.close();

  const nonAdmin = await browser.newPage();
  await signIn(nonAdmin, process.env.E2E_NON_ADMIN_EMAIL);
  await expect(nonAdmin).toHaveURL(/\/admin\/login\?reason=not_active_admin/);
  await nonAdmin.close();

  const inactive = await browser.newPage();
  await signIn(inactive, process.env.E2E_INACTIVE_ADMIN_EMAIL);
  await expect(inactive).toHaveURL(/\/admin\/login\?reason=not_active_admin/);
  await inactive.close();
});
