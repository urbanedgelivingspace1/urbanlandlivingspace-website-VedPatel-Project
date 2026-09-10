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

test("admin operates the complete lead, demand, matching, follow-up and closure workflow", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const leadName = `Synthetic M12 Buyer ${Date.now()}`;
  await signIn(page);
  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await page.goto("/admin/leads/new");
  await page.getByLabel("Full name").fill(leadName);
  await page.getByLabel("Phone").fill(String(Date.now()).slice(-10));
  await page.getByLabel("Inquiry type").selectOption("BUYER_REQUIREMENT");
  await page.getByLabel("Transaction").selectOption("BUY");
  await page.getByLabel("Land category").selectOption("AGRICULTURAL");
  await page.getByLabel("District").selectOption({ label: "Ahmedabad" });
  await page.getByRole("button", { name: "Create lead" }).click();
  await expect(page).toHaveURL(/\/admin\/leads\/[0-9a-f-]+$/);
  const leadId = page.url().split("/").at(-1) as string;

  await page.getByText("Edit lead", { exact: true }).click();
  await page.getByLabel("Intended use").fill("Long-term agricultural investment");
  await page.getByRole("button", { name: "Save lead" }).click();
  await expect(page.getByText("Long-term agricultural investment")).toBeVisible();

  const firstStageChoices = await page.getByLabel("Next stage").locator("option").allTextContents();
  expect(firstStageChoices).not.toContain("PROPERTY MATCHED");
  await page.getByLabel("Activity").selectOption("CONTACT_ATTEMPTED");
  await page.getByLabel("Private note").fill("Initial phone attempt");
  await page.getByRole("button", { name: "Record" }).click();
  await expect(page.getByText("Initial phone attempt")).toBeVisible();
  await page.getByLabel("Next stage").selectOption("CONTACT_ATTEMPTED");
  await page.getByLabel("Reason or outcome").fill("Phone");
  await page.getByRole("button", { name: "Change stage" }).click();
  await expect(page.getByText("Contact attempted", { exact: true })).toBeVisible();
  await page.getByLabel("Next stage").selectOption("QUALIFIED");
  await page.getByLabel("Reason or outcome").fill("Qualified buyer");
  await page.getByRole("button", { name: "Change stage" }).click();
  await page.getByLabel("Minimum area").fill("1");
  await page.getByLabel("Maximum area").fill("3");
  await page.getByLabel("Area unit").selectOption("10000000-0000-4000-8000-000000000006");
  await page.getByLabel("Requirement notes").fill("Agricultural land near Ahmedabad");
  await page.getByRole("button", { name: "Save requirement" }).click();
  await expect(page).toHaveURL(/saved=requirement/);
  await page.getByLabel("Next stage").selectOption("REQUIREMENT_CONFIRMED");
  await page.getByLabel("Reason or outcome").fill("Reviewed requirement");
  await page.getByRole("button", { name: "Change stage" }).click();
  await page.getByLabel("Candidate property").selectOption(propertyId);
  await page.getByLabel("Internal match note").fill("Manual shortlist");
  await page.getByRole("button", { name: "Link property" }).click();
  await expect(page.getByRole("link", { name: /M12 E2E candidate/ })).toBeVisible();
  await page.getByRole("button", { name: "Remove match" }).click();
  await expect(page.getByRole("link", { name: /M12 E2E candidate/ })).toHaveCount(0);
  await expect(page.getByText("No candidate properties linked.")).toBeVisible();
  await page.getByLabel("Candidate property").selectOption(propertyId);
  await page.getByLabel("Internal match note").fill("Relinked after admin review");
  await page.getByRole("button", { name: "Link property" }).click();
  await expect(page.getByRole("link", { name: /M12 E2E candidate/ })).toBeVisible();
  await page.getByLabel("Next stage").selectOption("PROPERTY_MATCHED");
  await page.getByLabel("Reason or outcome").fill("Candidate linked");
  await page.getByRole("button", { name: "Change stage" }).click();
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
  await page.goto("/admin/follow-ups");
  await expect(
    page.locator('[aria-labelledby="bucket-OVERDUE"]').getByText(leadName),
  ).toBeVisible();

  const today = await service()
    .from("lead_follow_ups")
    .update({ due_at: indiaTodayAtNoon() })
    .eq("id", followUpId);
  expect(today.error).toBeNull();
  await page.reload();
  await expect(page.locator('[aria-labelledby="bucket-TODAY"]').getByText(leadName)).toBeVisible();

  const upcoming = await service()
    .from("lead_follow_ups")
    .update({ due_at: new Date(Date.now() + 8 * 24 * 60 * 60_000).toISOString() })
    .eq("id", followUpId);
  expect(upcoming.error).toBeNull();
  await page.reload();
  await expect(
    page.locator('[aria-labelledby="bucket-UPCOMING"]').getByText(leadName),
  ).toBeVisible();
  const upcomingArticle = page
    .locator('[aria-labelledby="bucket-UPCOMING"] article')
    .filter({ hasText: leadName });
  await upcomingArticle.getByLabel(/Outcome for/).fill("Buyer contacted");
  await upcomingArticle.getByRole("button", { name: "Complete" }).click();
  await expect(
    page
      .locator('[aria-labelledby="bucket-COMPLETED"] article')
      .filter({ hasText: leadName })
      .getByText(/Buyer contacted/),
  ).toBeVisible();
  const update = await service().from("leads").update({ status: "NEGOTIATION" }).eq("id", leadId);
  expect(update.error).toBeNull();
  await page.goto(`/admin/leads/${leadId}`);
  await page.getByLabel("Next stage").selectOption("CLOSED_WON");
  await page.getByLabel("Reason or outcome").fill("Transaction confirmed");
  await page.getByRole("button", { name: "Change stage" }).click();
  await expect(page.getByText("Closed won", { exact: true })).toBeVisible();

  // Explicitly verify CLOSED_WON does NOT change property availability
  const propCheck = await service()
    .from("properties")
    .select("availability_status")
    .eq("id", propertyId)
    .single();
  expect(propCheck.data?.availability_status).toBe("AVAILABLE");

  // Explicitly verify only the explicit [Mark Property Sold] action changes property availability to SOLD
  await page.goto(`/admin/properties/${propertyId}`);
  await page.getByRole("link", { name: "Activity" }).click();
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
  await page.getByLabel("Pipeline stage").selectOption("CLOSED_WON");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/status=CLOSED_WON/);
  await expect(page.getByRole("link", { name: leadName })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: "Lead inbox" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  const lostLeadName = `Synthetic M12 Lost ${Date.now()}`;
  await page.goto("/admin/leads/new");
  await page.getByLabel("Full name").fill(lostLeadName);
  await page.getByLabel("Phone").fill(String(Date.now() + 1).slice(-10));
  await page.getByRole("button", { name: "Create lead" }).click();
  await page.getByLabel("Next stage").selectOption("CLOSED_LOST");
  await page.getByLabel("Reason or outcome").fill("NOT_INTERESTED");
  await page.getByRole("button", { name: "Change stage" }).click();
  await expect(page.getByText("Closed lost", { exact: true })).toBeVisible();
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
