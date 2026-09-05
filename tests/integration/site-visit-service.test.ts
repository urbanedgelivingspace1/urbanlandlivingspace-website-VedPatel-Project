import { createClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it, vi } from "vitest";

import type { Database } from "@/types/database.generated";

vi.mock("server-only", () => ({}));

let actorId: string;
let visitId: string;
let leadId: string;
let propertyId: string;

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Local integration environment is missing.");
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

beforeAll(async () => {
  const c = client();
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const user = await c.auth.admin.createUser({
    email: `m14-${unique}@example.invalid`,
    password: `Synthetic-${unique}-Only!`,
    email_confirm: true,
  });
  if (!user.data.user) throw user.error;
  actorId = user.data.user.id;
  const profile = await c.from("admin_profiles").insert({
    user_id: actorId,
    display_name: "Synthetic M14 Admin",
    role: "ADMIN",
    is_active: true,
  });
  if (profile.error) throw profile.error;
  const property = await c
    .from("properties")
    .insert({
      public_slug: `m14-integration-${unique}`,
      land_category: "AGRICULTURAL",
      primary_transaction_type: "BUY",
      publication_status: "PUBLISHED",
      availability_status: "AVAILABLE",
      listing_title: "Synthetic M14 visit property",
      district_id: "00000000-0000-4000-8000-000000000003",
      display_area_value: 2,
      display_area_unit_id: "10000000-0000-4000-8000-000000000006",
      published_at: new Date().toISOString(),
    })
    .select("id,public_slug")
    .single();
  if (!property.data?.public_slug) throw property.error;
  propertyId = property.data.id;
  const intake = await c.rpc("submit_public_crm_intake", {
    requested_action: "SITE_VISIT_REQUEST",
    requested_idempotency_key_hash: "e".repeat(64),
    requested_payload: {
      name: "Synthetic M14 Visitor",
      phone: "+919876541414",
      consent: true,
      privacyNoticeVersion: "M13-CONTACT-PLACEHOLDER-2026-09-05",
      propertySlug: property.data.public_slug,
      requestedStartAt: new Date(Date.now() + 3 * 86_400_000).toISOString(),
      requestedEndAt: new Date(Date.now() + 3 * 86_400_000 + 7_200_000).toISOString(),
    },
  });
  if (intake.error || !intake.data?.[0]) throw intake.error;
  leadId = intake.data[0].target_lead_id;
  const visit = await c.from("site_visits").select("id").eq("lead_id", leadId).single();
  if (!visit.data) throw visit.error;
  visitId = visit.data.id;
});

describe.sequential("M14 site-visit service integration", () => {
  it("continues the M13 request without auto-confirming it", async () => {
    const [visit, lead, events] = await Promise.all([
      client()
        .from("site_visits")
        .select("status,version,confirmed_start_at")
        .eq("id", visitId)
        .single(),
      client().from("leads").select("status").eq("id", leadId).single(),
      client().from("site_visit_events").select("event_type").eq("site_visit_id", visitId),
    ]);
    expect(visit.data).toEqual({ status: "REQUESTED", version: 1, confirmed_start_at: null });
    expect(lead.data?.status).toBe("NEW");
    expect(events.data?.map((event) => event.event_type)).toContain("REQUESTED");
  });

  it("records contact, proposal, and explicit confirmation atomically with CRM state", async () => {
    const { persistSiteVisitTransition } = await import("@/server/services/site-visits");
    const c = client();
    await expect(
      persistSiteVisitTransition(c, actorId, visitId, {
        expectedVersion: 1,
        nextStatus: "CONTACTED",
        contactOutcome: "Reached visitor and reviewed access",
      }),
    ).resolves.toBe(2);
    const startAt = new Date(Date.now() + 4 * 86_400_000).toISOString();
    const endAt = new Date(Date.now() + 4 * 86_400_000 + 7_200_000).toISOString();
    await expect(
      persistSiteVisitTransition(c, actorId, visitId, {
        expectedVersion: 2,
        nextStatus: "PROPOSED",
        startAt,
        endAt,
        timezone: "Asia/Kolkata",
        meetingInstructions: "Meet at the public road entrance",
      }),
    ).resolves.toBe(3);
    expect(
      (await c.from("site_visits").select("status,confirmed_start_at").eq("id", visitId).single())
        .data,
    ).toEqual({
      status: "PROPOSED",
      confirmed_start_at: null,
    });
    await expect(
      persistSiteVisitTransition(c, actorId, visitId, {
        expectedVersion: 3,
        nextStatus: "CONFIRMED",
        timezone: "Asia/Kolkata",
      }),
    ).resolves.toBe(4);
    const [visit, lead, activities] = await Promise.all([
      c
        .from("site_visits")
        .select("status,confirmed_start_at,confirmed_end_at")
        .eq("id", visitId)
        .single(),
      c.from("leads").select("status").eq("id", leadId).single(),
      c.from("lead_activities").select("activity_type").eq("lead_id", leadId),
    ]);
    expect(visit.data?.status).toBe("CONFIRMED");
    expect(Date.parse(visit.data!.confirmed_start_at!)).toBe(Date.parse(startAt));
    expect(Date.parse(visit.data!.confirmed_end_at!)).toBe(Date.parse(endAt));
    expect(lead.data?.status).toBe("SITE_VISIT_CONFIRMED");
    expect(activities.data?.map((activity) => activity.activity_type)).toContain(
      "SITE_VISIT_CONFIRMED",
    );
  });

  it("rejects stale updates, completes explicitly, and links a separate follow-up", async () => {
    const { persistSiteVisitFollowUp, persistSiteVisitTransition } =
      await import("@/server/services/site-visits");
    const c = client();
    await expect(
      persistSiteVisitTransition(c, actorId, visitId, {
        expectedVersion: 3,
        nextStatus: "CANCELLED",
        reason: "Stale request",
      }),
    ).rejects.toThrow(/STALE_SITE_VISIT/);
    const pastStart = new Date(Date.now() - 7_200_000).toISOString();
    const pastEnd = new Date(Date.now() - 3_600_000).toISOString();
    const adjusted = await c
      .from("site_visits")
      .update({
        proposed_start_at: pastStart,
        proposed_end_at: pastEnd,
        confirmed_start_at: pastStart,
        confirmed_end_at: pastEnd,
      })
      .eq("id", visitId);
    if (adjusted.error) throw adjusted.error;
    await expect(
      persistSiteVisitTransition(c, actorId, visitId, {
        expectedVersion: 4,
        nextStatus: "COMPLETED",
        outcome: "INTERESTED",
        note: "Buyer requested commercial follow-up",
      }),
    ).resolves.toBe(5);
    await expect(
      persistSiteVisitFollowUp(c, actorId, visitId, {
        expectedVersion: 5,
        dueAt: new Date(Date.now() + 86_400_000).toISOString(),
        type: "NEGOTIATION",
        context: "Discuss commercial terms",
      }),
    ).resolves.toMatch(/[0-9a-f-]{36}/);
    const [visit, lead, followUp, events] = await Promise.all([
      c.from("site_visits").select("status,completed_at,version").eq("id", visitId).single(),
      c.from("leads").select("status,next_follow_up_at").eq("id", leadId).single(),
      c
        .from("lead_follow_ups")
        .select("site_visit_id,completed_at")
        .eq("site_visit_id", visitId)
        .single(),
      c.from("site_visit_events").select("event_type").eq("site_visit_id", visitId),
    ]);
    expect(visit.data).toMatchObject({ status: "COMPLETED", version: 6 });
    expect(visit.data?.completed_at).not.toBeNull();
    expect(lead.data?.status).toBe("SITE_VISIT_COMPLETED");
    expect(lead.data?.next_follow_up_at).not.toBeNull();
    expect(followUp.data).toEqual({ site_visit_id: visitId, completed_at: null });
    expect(events.data?.map((event) => event.event_type)).toEqual(
      expect.arrayContaining([
        "CONTACTED",
        "PROPOSED",
        "CONFIRMED",
        "COMPLETED",
        "FOLLOW_UP_LINKED",
      ]),
    );
  });

  it("fails safely when current property state is not visitable", async () => {
    const { persistSiteVisitTransition } = await import("@/server/services/site-visits");
    const c = client();
    const inserted = await c
      .from("site_visits")
      .insert({
        lead_id: leadId,
        property_id: propertyId,
        status: "CONTACTED",
        contacted_at: new Date().toISOString(),
        contact_outcome: "Reached",
      })
      .select("id")
      .single();
    if (!inserted.data) throw inserted.error;
    await c.from("properties").update({ availability_status: "OFF_MARKET" }).eq("id", propertyId);
    await expect(
      persistSiteVisitTransition(c, actorId, inserted.data.id, {
        expectedVersion: 1,
        nextStatus: "PROPOSED",
        startAt: new Date(Date.now() + 86_400_000).toISOString(),
        endAt: new Date(Date.now() + 90_000_000).toISOString(),
        timezone: "Asia/Kolkata",
      }),
    ).rejects.toThrow(/PROPERTY_NOT_VISITABLE/);
    expect(
      (await c.from("site_visits").select("status,version").eq("id", inserted.data.id).single())
        .data,
    ).toEqual({ status: "CONTACTED", version: 1 });
  });
});
