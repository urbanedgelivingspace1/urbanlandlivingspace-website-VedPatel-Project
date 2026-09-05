import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";

import type { Database } from "@/types/database.generated";

test.describe.configure({ mode: "serial" });

const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const phoneSeed = Number(String(Date.now()).slice(-5)) * 50;
const phone = (offset: number) => String(9_000_000_000 + phoneSeed + offset);
const runIp = `198.18.${Math.floor(phoneSeed / 256) % 200}.${phoneSeed % 250}`;
let published: { id: string; slug: string; code: string; title: string };
let unpublishedSlug: string;

function service() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Synthetic M13 E2E database is unavailable.");
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

async function submitPropertyInquiry(page: Page, name: string, mobile: string) {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": runIp });
  await page.goto(`/properties/${published.slug}`);
  const form = page.locator("#property-inquiry form");
  await form.getByLabel("Name").fill(name);
  await form.getByLabel("Mobile number").fill(mobile);
  await form.getByLabel("Preferred contact method").selectOption("WHATSAPP");
  await form.getByLabel("Question or context (optional)").fill("Please share approved details.");
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Send property inquiry" }).click();
  const confirmation = page.locator("#property-inquiry").getByRole("status");
  await expect(confirmation).toContainText("Your inquiry has been received");
  await expect(confirmation).toContainText(published.code);
}

test.beforeAll(async () => {
  const client = service();
  const rows = await client
    .from("properties")
    .insert([
      {
        public_slug: `m13-public-${unique}`,
        land_category: "AGRICULTURAL",
        primary_transaction_type: "BUY",
        publication_status: "PUBLISHED",
        availability_status: "AVAILABLE",
        listing_title: `M13 public conversion land ${unique}`,
        short_description: "Synthetic M13 public demand fixture.",
        district_id: "00000000-0000-4000-8000-000000000003",
        display_area_value: 2,
        display_area_unit_id: "10000000-0000-4000-8000-000000000006",
        location_visibility: "HIDDEN",
        published_at: new Date().toISOString(),
      },
      {
        public_slug: `m13-private-${unique}`,
        land_category: "NA",
        primary_transaction_type: "BUY",
        publication_status: "DRAFT",
        availability_status: "AVAILABLE",
        listing_title: `PRIVATE_M13_CANARY_${unique}`,
        district_id: "00000000-0000-4000-8000-000000000003",
        display_area_value: 1,
        display_area_unit_id: "10000000-0000-4000-8000-000000000006",
        location_visibility: "HIDDEN",
      },
    ])
    .select("id,public_slug,property_code,listing_title,publication_status");
  if (rows.error) throw rows.error;
  const publicRow = rows.data.find((row) => row.publication_status === "PUBLISHED");
  const privateRow = rows.data.find((row) => row.publication_status === "DRAFT");
  if (!publicRow?.public_slug || !publicRow.listing_title || !privateRow?.public_slug)
    throw new Error("Synthetic M13 property fixtures were not created.");
  published = {
    id: publicRow.id,
    slug: publicRow.public_slug,
    code: publicRow.property_code,
    title: publicRow.listing_title,
  };
  unpublishedSlug = privateRow.public_slug;

  const settings = await client.from("app_settings").upsert(
    [
      {
        key: "public_phone",
        label: "Public phone",
        value_type: "TEXT",
        text_value: "+919876500000",
        is_public: true,
      },
      {
        key: "whatsapp_number",
        label: "WhatsApp number",
        value_type: "TEXT",
        text_value: "+919876500001",
        is_public: true,
      },
    ],
    { onConflict: "key" },
  );
  if (settings.error) throw settings.error;
});

test("published-property inquiry creates private CRM state, safe output, and a distinct returning opportunity", async ({
  page,
  request,
}) => {
  const inquiryName = `M13 inquiry ${unique}`;
  const returningName = `M13 returning ${unique}`;
  const mobile = phone(1);
  await submitPropertyInquiry(page, inquiryName, mobile);

  const first = await service()
    .from("leads")
    .select("id,party_id,status,source_type,source_detail")
    .eq("source_detail", `PROPERTY_DETAIL:${published.code}`)
    .eq(
      "party_id",
      (await service().from("parties").select("id").eq("phone", `+91${mobile}`).single()).data!.id,
    )
    .single();
  if (first.error) throw first.error;
  expect(first.data).toMatchObject({
    status: "NEW",
    source_type: "WEBSITE",
    source_detail: `PROPERTY_DETAIL:${published.code}`,
  });
  const relation = await service()
    .from("lead_properties")
    .select("property_id,match_status")
    .eq("lead_id", first.data.id)
    .single();
  expect(relation.data).toEqual({ property_id: published.id, match_status: "INQUIRY" });
  const notification = await service()
    .from("notification_deliveries")
    .select("status")
    .eq("lead_id", first.data.id)
    .single();
  expect(notification.data?.status).toBe("SKIPPED");

  const analytics = await service()
    .from("analytics_events")
    .select("event_name,metadata,lead_id")
    .eq("property_id", published.id)
    .eq("event_name", "property_inquiry_success")
    .order("occurred_at", { ascending: false })
    .limit(1)
    .single();
  expect(analytics.data?.lead_id).toBeNull();
  expect(JSON.stringify(analytics.data)).not.toContain(inquiryName);
  expect(JSON.stringify(analytics.data)).not.toContain(mobile);

  await submitPropertyInquiry(page, returningName, mobile);
  const returning = await service()
    .from("leads")
    .select("id,party_id")
    .eq("party_id", first.data.party_id);
  expect(returning.data).toHaveLength(2);
  expect(new Set(returning.data?.map((lead) => lead.id)).size).toBe(2);
  const returningLead = returning.data?.find((lead) => lead.id !== first.data.id);
  if (!returningLead) throw new Error("Returning opportunity was not created.");

  await signIn(page);
  await page.goto(`/admin/leads?q=${encodeURIComponent(returningName)}`);
  await page.locator(`a[href="/admin/leads/${returningLead.id}"]`).click();
  await expect(page.getByText(`WEBSITE · PROPERTY_DETAIL:${published.code}`)).toBeVisible();
  await expect(page.getByRole("link", { name: new RegExp(published.title) })).toBeVisible();

  const call = await request.get(`/api/public/intent/call?property=${published.slug}`, {
    maxRedirects: 0,
  });
  expect(call.status()).toBe(302);
  expect(call.headers().location).toBe("tel:+919876500000");
  const whatsapp = await request.get(`/api/public/intent/whatsapp?property=${published.slug}`, {
    maxRedirects: 0,
  });
  expect(whatsapp.status()).toBe(302);
  expect(whatsapp.headers().location).toContain("https://wa.me/919876500001");
  expect(whatsapp.headers().location).toContain(encodeURIComponent(published.code));
});

test("zero-result discovery prefills and persists one structured CRM requirement", async ({
  page,
}) => {
  const name = `M13 requirement ${unique}`;
  await page.setExtraHTTPHeaders({ "x-forwarded-for": runIp });
  await page.goto(
    `/properties?q=no-result-${unique}&category=industrial&transaction=lease&minArea=2&maxArea=5&areaUnit=acre`,
  );
  await page.getByRole("link", { name: "Share a requirement" }).click();
  await expect(page).toHaveURL(/\/requirements\?source=SEARCH_ZERO/);
  await expect(page.getByLabel("Transaction")).toHaveValue("LEASE");
  await expect(page.getByLabel("Land category")).toHaveValue("INDUSTRIAL");
  await expect(page.getByLabel("Minimum area")).toHaveValue("2");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Mobile number").fill(phone(2));
  await page.getByLabel("District").selectOption({ label: "Ahmedabad" });
  await page.getByLabel("Minimum budget (₹)").fill("1000000");
  await page.getByLabel("Maximum budget (₹)").fill("5000000");
  await page.getByLabel("Intended use (optional)").fill("Logistics yard");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Share requirement" }).click();
  await expect(page).toHaveURL(/\/requirements\/thank-you/);
  await expect(page.getByRole("heading", { name: /requirement has been shared/i })).toBeVisible();

  const party = await service()
    .from("parties")
    .select("id")
    .eq("phone", `+91${phone(2)}`)
    .single();
  const lead = await service()
    .from("leads")
    .select("id,status,source_detail,preferred_transaction,land_category,intended_use")
    .eq("party_id", party.data!.id)
    .single();
  expect(lead.data).toMatchObject({
    status: "NEW",
    source_detail: "REQUIREMENTS_SEARCH_ZERO",
    preferred_transaction: "LEASE",
    land_category: "INDUSTRIAL",
    intended_use: "Logistics yard",
  });
  const requirement = await service()
    .from("lead_requirements")
    .select("min_area_value,max_area_value,area_unit_id")
    .eq("lead_id", lead.data!.id)
    .single();
  expect(requirement.data).toEqual({
    min_area_value: 2,
    max_area_value: 5,
    area_unit_id: "10000000-0000-4000-8000-000000000006",
  });
});

test("site-visit intake records REQUESTED only and never confirms or advances the lead", async ({
  page,
}) => {
  const name = `M13 visit ${unique}`;
  await page.setExtraHTTPHeaders({ "x-forwarded-for": runIp });
  await page.goto(`/site-visit?property=${published.slug}`);
  await expect(page.getByText(/not an automatic booking/i)).toBeVisible();
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Mobile number").fill(phone(3));
  await page.getByLabel("Preferred date").fill("2099-01-02");
  await page.getByLabel("Preferred time window").selectOption("MORNING");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Request site visit" }).click();
  await expect(page).toHaveURL(new RegExp(`/site-visit/thank-you\\?property=${published.code}`));
  await expect(page.getByText(/not a confirmed booking/i)).toBeVisible();

  const party = await service()
    .from("parties")
    .select("id")
    .eq("phone", `+91${phone(3)}`)
    .single();
  const lead = await service()
    .from("leads")
    .select("id,status")
    .eq("party_id", party.data!.id)
    .single();
  const visit = await service()
    .from("site_visits")
    .select("status,confirmed_start_at,confirmed_end_at,completed_at")
    .eq("lead_id", lead.data!.id)
    .single();
  expect(lead.data?.status).toBe("NEW");
  expect(visit.data).toEqual({
    status: "REQUESTED",
    confirmed_start_at: null,
    confirmed_end_at: null,
    completed_at: null,
  });
});

test("malformed, bot-filled, unpublished, and rapid duplicate submissions fail safely", async ({
  page,
  request,
}) => {
  const malformedName = `M13 malformed ${unique}`;
  await page.setExtraHTTPHeaders({ "x-forwarded-for": runIp });
  await page.goto(`/properties/${published.slug}`);
  const form = page.locator("#property-inquiry form");
  await form.getByLabel("Name").fill(malformedName);
  await form.getByLabel("Mobile number").fill("123");
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Send property inquiry" }).click();
  await expect(form.getByRole("alert")).toContainText("highlighted fields");
  await expect(form.getByLabel("Mobile number")).toBeFocused();
  await expect(form.getByLabel("Name")).toHaveValue(malformedName);

  await form.getByLabel("Mobile number").fill(phone(4));
  await form.locator('[name="website"]').fill("bot-filled");
  await form.getByRole("button", { name: "Send property inquiry" }).click();
  await expect(form.getByRole("alert")).toContainText("Check the form");
  const botParty = await service()
    .from("parties")
    .select("id")
    .eq("phone", `+91${phone(4)}`);
  expect(botParty.data).toHaveLength(0);

  expect((await request.get(`/site-visit?property=${unpublishedSlug}`)).status()).toBe(404);
  expect(
    (
      await request.get(`/api/public/intent/call?property=${unpublishedSlug}`, { maxRedirects: 0 })
    ).status(),
  ).toBe(404);

  const rapidName = `M13 rapid ${unique}`;
  await page.goto(`/properties/${published.slug}`);
  const rapidForm = page.locator("#property-inquiry form");
  await rapidForm.getByLabel("Name").fill(rapidName);
  await rapidForm.getByLabel("Mobile number").fill(phone(5));
  await rapidForm.getByRole("checkbox").check();
  await rapidForm.evaluate((element: HTMLFormElement) => {
    element.requestSubmit();
    element.requestSubmit();
  });
  await expect(page.locator("#property-inquiry").getByRole("status")).toContainText("received");
  const rapidParty = await service()
    .from("parties")
    .select("id")
    .eq("phone", `+91${phone(5)}`)
    .single();
  const rapidLeads = await service().from("leads").select("id").eq("party_id", rapidParty.data!.id);
  expect(rapidLeads.data).toHaveLength(1);

  const anonymous = await page.context().browser()!.newPage();
  await anonymous.goto("/admin/leads");
  await expect(anonymous).toHaveURL(/\/admin\/login/);
  await expect(anonymous.getByText(rapidName)).toHaveCount(0);
  await anonymous.close();
});

test("contact is responsive, accessible, keyboard-operable, and rate limited without leaking PII", async ({
  page,
}) => {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `198.19.100.${phoneSeed % 200}` });
  for (const width of [320, 375, 390, 430, 768, 1280]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
    await page.goto("/contact");
    await expect(page.getByRole("button", { name: "Send message" })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  for (let attempt = 0; attempt < 6; attempt += 1) {
    if (attempt > 0) await page.goto("/contact");
    const name = `M13 rate ${attempt} ${unique}`;
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Mobile number").fill(phone(10 + attempt));
    await page.getByLabel("Message").fill("Please explain the UrbanEdge service process.");
    await page.getByRole("checkbox").check();
    const button = page.getByRole("button", { name: "Send message" });
    button.focus();
    await page.keyboard.press("Enter");
    if (attempt < 5) {
      await expect(page.getByRole("status")).toContainText("message has been received");
    } else {
      await expect(page.locator(".form-error-summary")).toContainText("Too many requests");
      await expect(page.getByLabel("Name")).toHaveValue(name);
    }
  }
  const created = await service()
    .from("leads")
    .select("id")
    .like("source_detail", "CONTACT_PAGE")
    .in(
      "party_id",
      (
        await service()
          .from("parties")
          .select("id")
          .in(
            "phone",
            Array.from({ length: 6 }, (_, index) => `+91${phone(10 + index)}`),
          )
      ).data!.map((party) => party.id),
    );
  expect(created.data).toHaveLength(5);
  const publicHtml = await page.content();
  expect(publicHtml).not.toContain(`+91${phone(10)}`);
});
