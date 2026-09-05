import { createClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  buyerRequirementInputSchema,
  propertyInquiryInputSchema,
  siteVisitRequestInputSchema,
} from "@/features/intake/domain/validation";
import type { Database } from "@/types/database.generated";

vi.mock("server-only", () => ({}));

let propertyId: string;
let propertySlug: string;
const leadIds: string[] = [];

function service() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Local integration environment is missing.");
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

beforeAll(async () => {
  propertySlug = `m13-integration-${Date.now()}`;
  const property = await service()
    .from("properties")
    .insert({
      public_slug: propertySlug,
      land_category: "AGRICULTURAL",
      primary_transaction_type: "BUY",
      publication_status: "PUBLISHED",
      availability_status: "AVAILABLE",
      listing_title: "Synthetic M13 integration property",
      district_id: "00000000-0000-4000-8000-000000000003",
      display_area_value: 2,
      display_area_unit_id: "10000000-0000-4000-8000-000000000006",
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (!property.data) throw property.error;
  propertyId = property.data.id;
});

const common = {
  name: "Synthetic M13 Visitor",
  phone: "9876543210",
  consent: true as const,
  privacyNoticeVersion: "M13-CONTACT-PLACEHOLDER-2026-09-05" as const,
};

describe.sequential("M13 public intake service integration", () => {
  it("creates a published-property inquiry through one atomic CRM transaction", async () => {
    const { persistPublicIntake } = await import("@/server/services/public-intake");
    const input = propertyInquiryInputSchema.parse({
      action: "PROPERTY_INQUIRY",
      ...common,
      email: "m13-integration@example.invalid",
      propertySlug,
      preferredContact: "PHONE",
      message: "Please share approved details",
      idempotencyKey: "94000000-0000-4000-8000-000000000001",
    });
    const result = await persistPublicIntake(service(), input, "a".repeat(64));
    leadIds.push(result.target_lead_id);
    expect(result).toMatchObject({ target_property_id: propertyId, replayed: false });
    const client = service();
    const [lead, relation, activity, consent, notification] = await Promise.all([
      client
        .from("leads")
        .select("status,source_type,source_detail")
        .eq("id", result.target_lead_id)
        .single(),
      client
        .from("lead_properties")
        .select("match_status")
        .eq("lead_id", result.target_lead_id)
        .single(),
      client.from("lead_activities").select("activity_type").eq("lead_id", result.target_lead_id),
      client.from("party_consents").select("purpose").eq("lead_id", result.target_lead_id).single(),
      client
        .from("notification_deliveries")
        .select("status")
        .eq("lead_id", result.target_lead_id)
        .single(),
    ]);
    expect(lead.data).toMatchObject({ status: "NEW", source_type: "WEBSITE" });
    expect(lead.data?.source_detail).toMatch(/^PROPERTY_DETAIL:UE-LS-/);
    expect(relation.data?.match_status).toBe("INQUIRY");
    expect(activity.data?.map((row) => row.activity_type)).toEqual(
      expect.arrayContaining(["LEAD_CREATED", "PROPERTY_INQUIRY_RECEIVED"]),
    );
    expect(consent.data?.purpose).toBe("INQUIRY_CONTACT");
    expect(notification.data?.status).toBe("PENDING");
  });

  it("replays one bounded event without creating duplicate business state", async () => {
    const { persistPublicIntake } = await import("@/server/services/public-intake");
    const input = propertyInquiryInputSchema.parse({
      action: "PROPERTY_INQUIRY",
      ...common,
      email: "m13-integration@example.invalid",
      propertySlug,
      preferredContact: "PHONE",
      message: "Please share approved details",
      idempotencyKey: "94000000-0000-4000-8000-000000000001",
    });
    const replay = await persistPublicIntake(service(), input, "a".repeat(64));
    expect(replay).toMatchObject({ target_lead_id: leadIds[0], replayed: true });
    const rows = await service().from("leads").select("id").eq("id", leadIds[0]!);
    expect(rows.data).toHaveLength(1);
  });

  it("creates a first-class generic requirement without a fake property", async () => {
    const { persistPublicIntake } = await import("@/server/services/public-intake");
    const input = buyerRequirementInputSchema.parse({
      action: "BUYER_REQUIREMENT",
      ...common,
      phone: "9876543211",
      idempotencyKey: "94000000-0000-4000-8000-000000000002",
      sourceContext: "SEARCH_ZERO",
      preferredTransaction: "LEASE",
      landCategory: "INDUSTRIAL",
      districtId: "00000000-0000-4000-8000-000000000003",
      minimumArea: 2,
      maximumArea: 4,
      areaUnitId: "10000000-0000-4000-8000-000000000006",
      timeline: "1–3 months",
    });
    const result = await persistPublicIntake(service(), input, "b".repeat(64));
    leadIds.push(result.target_lead_id);
    expect(result.target_property_id).toBeNull();
    const [lead, requirement, relations] = await Promise.all([
      service()
        .from("leads")
        .select("source_detail,preferred_transaction,land_category")
        .eq("id", result.target_lead_id)
        .single(),
      service()
        .from("lead_requirements")
        .select("min_area_value,max_area_value")
        .eq("lead_id", result.target_lead_id)
        .single(),
      service().from("lead_properties").select("id").eq("lead_id", result.target_lead_id),
    ]);
    expect(lead.data).toMatchObject({
      source_detail: "REQUIREMENTS_SEARCH_ZERO",
      preferred_transaction: "LEASE",
      land_category: "INDUSTRIAL",
    });
    expect(requirement.data).toMatchObject({ min_area_value: 2, max_area_value: 4 });
    expect(relations.data).toEqual([]);
  });

  it("records a visit request without implementing M14 confirmation", async () => {
    const { persistPublicIntake } = await import("@/server/services/public-intake");
    const input = siteVisitRequestInputSchema.parse({
      action: "SITE_VISIT_REQUEST",
      ...common,
      phone: "9876543212",
      idempotencyKey: "94000000-0000-4000-8000-000000000003",
      propertySlug,
      requestedStartAt: new Date(Date.now() + 172_800_000).toISOString(),
      requestedEndAt: new Date(Date.now() + 183_600_000).toISOString(),
    });
    const result = await persistPublicIntake(service(), input, "c".repeat(64));
    leadIds.push(result.target_lead_id);
    const [lead, visit] = await Promise.all([
      service().from("leads").select("status").eq("id", result.target_lead_id).single(),
      service()
        .from("site_visits")
        .select("status,confirmed_start_at,completed_at")
        .eq("lead_id", result.target_lead_id)
        .single(),
    ]);
    expect(lead.data?.status).toBe("NEW");
    expect(visit.data).toEqual({
      status: "REQUESTED",
      confirmed_start_at: null,
      completed_at: null,
    });
  });

  it("keeps committed CRM state when notification and analytics effects fail", async () => {
    const { settlePostCommitIntakeEffects } = await import("@/server/services/public-intake");
    const notification = vi.fn(async () => {
      throw new Error("synthetic notification failure");
    });
    const analytics = vi.fn(async () => {
      throw new Error("synthetic analytics failure");
    });
    await expect(
      settlePostCommitIntakeEffects({ notification, analytics }),
    ).resolves.toBeUndefined();
    expect(notification).toHaveBeenCalledOnce();
    expect(analytics).toHaveBeenCalledOnce();
    const leads = await service().from("leads").select("id").in("id", leadIds);
    expect(leads.data).toHaveLength(leadIds.length);
  });

  it("enforces action-specific rate limits transactionally", async () => {
    const { consumePublicRateLimit } = await import("@/server/services/public-intake");
    const client = service();
    const bucket = "d".repeat(64);
    for (let count = 0; count < 5; count += 1)
      await expect(consumePublicRateLimit(client, "GENERAL_CONTACT", bucket)).resolves.toBe(true);
    await expect(consumePublicRateLimit(client, "GENERAL_CONTACT", bucket)).resolves.toBe(false);
  });
});
