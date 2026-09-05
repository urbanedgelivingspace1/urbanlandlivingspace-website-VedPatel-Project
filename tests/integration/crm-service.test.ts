import { createClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { Database } from "@/types/database.generated";
vi.mock("server-only", () => ({}));
let actorId: string;
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
    email: `m12-${unique}@example.invalid`,
    password: `Synthetic-${unique}-Only!`,
    email_confirm: true,
  });
  if (!user.data.user) throw user.error;
  actorId = user.data.user.id;
  const profile = await c.from("admin_profiles").insert({
    user_id: actorId,
    display_name: "Synthetic M12 Admin",
    role: "ADMIN",
    is_active: true,
  });
  if (profile.error) throw profile.error;
  const property = await c
    .from("properties")
    .insert({
      land_category: "AGRICULTURAL",
      primary_transaction_type: "BUY",
      district_id: "00000000-0000-4000-8000-000000000003",
      display_area_value: 2,
      display_area_unit_id: "10000000-0000-4000-8000-000000000006",
      listing_title: "Synthetic M12 candidate",
    })
    .select("id")
    .single();
  if (!property.data) throw property.error;
  propertyId = property.data.id;
});
describe.sequential("M12 CRM service integration", () => {
  it("creates lead and activity atomically", async () => {
    const { persistAdminLead } = await import("@/server/services/crm");
    leadId = await persistAdminLead(client(), actorId, {
      name: "Synthetic CRM Buyer",
      phone: "9999999999",
      email: "CRM-BUYER@example.invalid",
      sourceType: "MANUAL",
      inquiryType: "BUYER_REQUIREMENT",
      buyerType: "INVESTOR",
      preferredTransaction: "BUY",
      landCategory: "AGRICULTURAL",
      budgetMin: 1000000,
      budgetMax: 5000000,
      districtId: "00000000-0000-4000-8000-000000000003",
    });
    const c = client();
    const [lead, activity] = await Promise.all([
      c.from("leads").select("status").eq("id", leadId).single(),
      c.from("lead_activities").select("activity_type").eq("lead_id", leadId),
    ]);
    expect(lead.data?.status).toBe("NEW");
    expect(activity.data?.map((row) => row.activity_type)).toContain("LEAD_CREATED");
  });
  it("detects duplicates, reuses one contact, and preserves separate opportunities", async () => {
    const { findLikelyDuplicateLeads, persistAdminLead } = await import("@/server/services/crm");
    const c = client();
    const duplicates = await findLikelyDuplicateLeads(c, {
      phone: "+91 99999 99999",
      email: "crm-buyer@EXAMPLE.INVALID",
    });
    expect(duplicates.map((lead) => lead.id)).toContain(leadId);
    const secondLeadId = await persistAdminLead(c, actorId, {
      name: "Synthetic CRM Buyer New Intent",
      phone: "+91 99999 99999",
      email: "crm-buyer@example.invalid",
      sourceType: "REFERRAL",
      inquiryType: "PRICE_INQUIRY",
    });
    const opportunities = await c
      .from("leads")
      .select("id,party_id")
      .in("id", [leadId, secondLeadId]);
    expect(opportunities.data).toHaveLength(2);
    expect(new Set(opportunities.data?.map((lead) => lead.party_id)).size).toBe(1);
  });
  it("persists requirement, controlled progression, property match and follow-up history", async () => {
    const c = client();
    const activity = await c.rpc("add_lead_activity", {
      requested_actor_id: actorId,
      requested_lead_id: leadId,
      requested_activity_type: "CONTACT_ATTEMPTED",
      requested_note: "Called",
    });
    expect(activity.error).toBeNull();
    for (const [next, reason] of [
      ["CONTACT_ATTEMPTED", "Call"],
      ["QUALIFIED", "Qualified"],
    ] as const) {
      const result = await c.rpc("transition_lead_status", {
        requested_actor_id: actorId,
        requested_lead_id: leadId,
        requested_next_status: next,
        requested_reason: reason,
      });
      expect(result.error).toBeNull();
    }
    expect(
      (
        await c.rpc("transition_lead_status", {
          requested_actor_id: actorId,
          requested_lead_id: leadId,
          requested_next_status: "PROPERTY_MATCHED",
        })
      ).error,
    ).not.toBeNull();
    expect(
      (
        await c.rpc("save_lead_requirement", {
          requested_actor_id: actorId,
          requested_lead_id: leadId,
          requested_payload: {
            minAreaValue: 1,
            maxAreaValue: 3,
            areaUnitId: "10000000-0000-4000-8000-000000000006",
          },
        })
      ).error,
    ).toBeNull();
    expect(
      (
        await c.rpc("transition_lead_status", {
          requested_actor_id: actorId,
          requested_lead_id: leadId,
          requested_next_status: "REQUIREMENT_CONFIRMED",
          requested_reason: "Reviewed",
        })
      ).error,
    ).toBeNull();
    expect(
      (
        await c.rpc("match_lead_property", {
          requested_actor_id: actorId,
          requested_lead_id: leadId,
          requested_property_id: propertyId,
          requested_status: "ACTIVE",
        })
      ).error,
    ).toBeNull();
    expect(
      (
        await c.rpc("transition_lead_status", {
          requested_actor_id: actorId,
          requested_lead_id: leadId,
          requested_next_status: "PROPERTY_MATCHED",
          requested_reason: "Matched",
        })
      ).error,
    ).toBeNull();
    const follow = await c.rpc("schedule_lead_follow_up", {
      requested_actor_id: actorId,
      requested_lead_id: leadId,
      requested_due_at: new Date(Date.now() + 86400000).toISOString(),
      requested_type: "CALL",
      requested_context: "Present candidate",
    });
    expect(follow.error).toBeNull();
    if (!follow.data) throw new Error("No follow-up ID");
    expect(
      (
        await c.rpc("complete_lead_follow_up", {
          requested_actor_id: actorId,
          requested_follow_up_id: follow.data,
          requested_outcome: "Presented",
        })
      ).error,
    ).toBeNull();
    const timeline = await c
      .from("lead_activities")
      .select("activity_type")
      .eq("lead_id", leadId)
      .order("activity_at");
    expect(timeline.data?.map((row) => row.activity_type)).toEqual(
      expect.arrayContaining([
        "REQUIREMENT_UPDATED",
        "PROPERTY_MATCHED",
        "FOLLOW_UP_SCHEDULED",
        "FOLLOW_UP_COMPLETED",
      ]),
    );
  });
  it("keeps system audit payload free of contact PII", async () => {
    const audits = await client()
      .from("audit_logs")
      .select("before_state,after_state,reason")
      .eq("entity_id", leadId);
    expect(JSON.stringify(audits.data)).not.toContain("CRM-BUYER");
    expect(JSON.stringify(audits.data)).not.toContain("9999999999");
  });
});
