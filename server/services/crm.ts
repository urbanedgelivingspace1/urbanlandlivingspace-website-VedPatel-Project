import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { LeadStatus } from "@/features/admin/contracts";
import type { FollowUpType, LeadListItem, LeadWorkspace } from "@/features/crm/domain/contracts";
import {
  adminLeadInputSchema,
  followUpInputSchema,
  normalizeEmail,
  normalizePhone,
  requirementInputSchema,
  transitionInputSchema,
} from "@/features/crm/domain/validation";
import { requireActiveAdmin } from "@/server/auth/authorization";
import { createPrivilegedServerClient } from "@/server/supabase/privileged";
import type { Database, Json } from "@/types/database.generated";

type Db = SupabaseClient<Database>;
type LeadInput = Parameters<typeof adminLeadInputSchema.parse>[0];
type RequirementInput = Parameters<typeof requirementInputSchema.parse>[0];
const db = () => createPrivilegedServerClient() as unknown as Db;
function payload(value: unknown): Json {
  return value as Json;
}
function check(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function findLikelyDuplicateLeads(
  client: Db,
  contact: { phone?: string; email?: string },
) {
  const phone = normalizePhone(contact.phone);
  const email = normalizeEmail(contact.email);
  if (!phone && !email) return [];
  const parties = new Map<
    string,
    { id: string; display_name: string; phone: string | null; email: string | null }
  >();
  if (phone) {
    const result = await client
      .from("parties")
      .select("id,display_name,phone,email")
      .eq("phone", phone)
      .is("archived_at", null)
      .limit(20);
    check(result.error);
    for (const party of result.data ?? []) parties.set(party.id, party);
  }
  if (email) {
    const result = await client
      .from("parties")
      .select("id,display_name,phone,email")
      .eq("email", email)
      .is("archived_at", null)
      .limit(20);
    check(result.error);
    for (const party of result.data ?? []) parties.set(party.id, party);
  }
  const partyRows = [...parties.values()];
  if (!partyRows.length) return [];
  const leadResult = await client
    .from("leads")
    .select("id,lead_reference,status,party_id")
    .in(
      "party_id",
      partyRows.map((p) => p.id),
    )
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(20);
  check(leadResult.error);
  return (leadResult.data ?? []).map((lead) => ({
    ...lead,
    name: partyRows.find((p) => p.id === lead.party_id)?.display_name ?? "Existing contact",
  }));
}

export async function persistAdminLead(
  client: Db,
  actorId: string,
  input: LeadInput,
): Promise<string> {
  const parsed = adminLeadInputSchema.parse(input);
  const normalized = {
    ...parsed,
    phone: normalizePhone(parsed.phone),
    email: normalizeEmail(parsed.email),
  };
  const result = await client.rpc("create_admin_lead", {
    requested_actor_id: actorId,
    requested_payload: payload(normalized),
  });
  check(result.error);
  if (!result.data) throw new Error("Lead creation returned no identifier.");
  return result.data;
}
export async function createAdminLead(input: LeadInput) {
  const actor = await requireActiveAdmin();
  return persistAdminLead(db(), actor.userId, input);
}
export async function updateAdminLead(leadId: string, input: LeadInput) {
  const actor = await requireActiveAdmin();
  const parsed = adminLeadInputSchema.parse(input);
  const result = await db().rpc("update_admin_lead", {
    requested_actor_id: actor.userId,
    requested_lead_id: leadId,
    requested_payload: payload({
      ...parsed,
      phone: normalizePhone(parsed.phone),
      email: normalizeEmail(parsed.email),
    }),
  });
  check(result.error);
}
export async function saveLeadRequirement(leadId: string, input: RequirementInput) {
  const actor = await requireActiveAdmin();
  const parsed = requirementInputSchema.parse(input);
  const result = await db().rpc("save_lead_requirement", {
    requested_actor_id: actor.userId,
    requested_lead_id: leadId,
    requested_payload: payload(parsed),
  });
  check(result.error);
  return result.data;
}
export async function transitionLeadStatus(
  leadId: string,
  input: { nextStatus: LeadStatus; reason?: string },
) {
  const actor = await requireActiveAdmin();
  const parsed = transitionInputSchema.parse(input);
  const result = await db().rpc("transition_lead_status", {
    requested_actor_id: actor.userId,
    requested_lead_id: leadId,
    requested_next_status: parsed.nextStatus,
    requested_reason: parsed.reason,
  });
  check(result.error);
}
export async function addLeadActivity(
  leadId: string,
  input: { type: Database["public"]["Enums"]["lead_activity_type"]; note?: string },
) {
  const actor = await requireActiveAdmin();
  const result = await db().rpc("add_lead_activity", {
    requested_actor_id: actor.userId,
    requested_lead_id: leadId,
    requested_activity_type: input.type,
    requested_note: input.note,
  });
  check(result.error);
  return result.data;
}
export async function scheduleLeadFollowUp(
  leadId: string,
  input: {
    dueAt: string;
    type: FollowUpType;
    context?: string;
    note?: string;
  },
) {
  const actor = await requireActiveAdmin();
  const parsed = followUpInputSchema.parse(input);
  const result = await db().rpc("schedule_lead_follow_up", {
    requested_actor_id: actor.userId,
    requested_lead_id: leadId,
    requested_due_at: parsed.dueAt,
    requested_type: parsed.type,
    requested_context: parsed.context,
    requested_note: parsed.note,
  });
  check(result.error);
  return result.data;
}
export async function completeLeadFollowUp(followUpId: string, outcome?: string) {
  const actor = await requireActiveAdmin();
  const result = await db().rpc("complete_lead_follow_up", {
    requested_actor_id: actor.userId,
    requested_follow_up_id: followUpId,
    requested_outcome: outcome,
  });
  check(result.error);
}
export async function matchLeadToProperty(
  leadId: string,
  propertyId: string,
  status: string,
  notes?: string,
) {
  const actor = await requireActiveAdmin();
  const result = await db().rpc("match_lead_property", {
    requested_actor_id: actor.userId,
    requested_lead_id: leadId,
    requested_property_id: propertyId,
    requested_status: status,
    requested_notes: notes,
  });
  check(result.error);
  return result.data;
}
export async function unmatchLeadFromProperty(leadId: string, propertyId: string, reason?: string) {
  const actor = await requireActiveAdmin();
  const result = await db().rpc("unmatch_lead_property", {
    requested_actor_id: actor.userId,
    requested_lead_id: leadId,
    requested_property_id: propertyId,
    requested_reason: reason,
  });
  check(result.error);
}

export type LeadFilters = Readonly<{
  query?: string;
  status?: string;
  category?: string;
  transaction?: string;
  source?: string;
  districtId?: string;
  followUp?: string;
  createdFrom?: string;
  createdTo?: string;
  assignedTo?: string;
}>;
export async function listLeads(filters: LeadFilters = {}): Promise<LeadListItem[]> {
  await requireActiveAdmin();
  const client = db();
  let partyIds: string[] | undefined;
  if (filters.query?.trim()) {
    const safe = filters.query.trim().replaceAll(/[,%()]/g, "");
    const result = await client
      .from("parties")
      .select("id")
      .or(`display_name.ilike.%${safe}%,phone.ilike.%${safe}%,email.ilike.%${safe}%`)
      .limit(100);
    check(result.error);
    partyIds = (result.data ?? []).map((p) => p.id);
    if (!partyIds.length) return [];
  }
  let query = client
    .from("leads")
    .select("*")
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (partyIds) query = query.in("party_id", partyIds);
  if (filters.status) query = query.eq("status", filters.status as LeadStatus);
  if (filters.category)
    query = query.eq(
      "land_category",
      filters.category as Database["public"]["Enums"]["land_category"],
    );
  if (filters.transaction)
    query = query.eq(
      "preferred_transaction",
      filters.transaction as Database["public"]["Enums"]["transaction_type"],
    );
  if (filters.source) query = query.eq("source_type", filters.source);
  if (filters.districtId) query = query.eq("district_id", filters.districtId);
  if (filters.assignedTo) query = query.eq("assigned_to", filters.assignedTo);
  if (filters.createdFrom) query = query.gte("created_at", filters.createdFrom);
  if (filters.createdTo) query = query.lte("created_at", `${filters.createdTo}T23:59:59.999Z`);
  if (filters.followUp === "overdue")
    query = query
      .lt("next_follow_up_at", new Date().toISOString())
      .not("status", "in", "(CLOSED_WON,CLOSED_LOST)");
  if (filters.followUp === "none")
    query = query.is("next_follow_up_at", null).not("status", "in", "(CLOSED_WON,CLOSED_LOST)");
  if (filters.followUp === "today" || filters.followUp === "upcoming") {
    const indiaDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const todayStart = new Date(`${indiaDate}T00:00:00+05:30`);
    const rangeStart =
      filters.followUp === "today" ? todayStart : new Date(todayStart.getTime() + 86_400_000);
    const rangeEnd = new Date(
      todayStart.getTime() + (filters.followUp === "today" ? 86_400_000 : 8 * 86_400_000),
    );
    query = query
      .gte("next_follow_up_at", rangeStart.toISOString())
      .lt("next_follow_up_at", rangeEnd.toISOString())
      .not("status", "in", "(CLOSED_WON,CLOSED_LOST)");
  }
  const result = await query;
  check(result.error);
  const leads = result.data ?? [];
  if (!leads.length) return [];
  const [parties, districts, matches] = await Promise.all([
    client
      .from("parties")
      .select("id,display_name,phone,email")
      .in("id", [...new Set(leads.map((l) => l.party_id))]),
    client
      .from("districts")
      .select("id,name")
      .in("id", [...new Set(leads.flatMap((l) => (l.district_id ? [l.district_id] : [])))]),
    client
      .from("lead_properties")
      .select("lead_id")
      .in(
        "lead_id",
        leads.map((l) => l.id),
      ),
  ]);
  [parties, districts, matches].forEach((r) => check(r.error));
  return leads.map((lead) => {
    const party = parties.data?.find((p) => p.id === lead.party_id);
    return {
      id: lead.id,
      leadReference: lead.lead_reference,
      name: party?.display_name ?? "Unknown contact",
      phone: party?.phone ?? null,
      email: party?.email ?? null,
      status: lead.status,
      sourceType: lead.source_type,
      buyerType: lead.buyer_type,
      transaction: lead.preferred_transaction,
      category: lead.land_category,
      districtName: districts.data?.find((d) => d.id === lead.district_id)?.name ?? null,
      localityText: lead.locality_text,
      budgetMin: lead.budget_min,
      budgetMax: lead.budget_max,
      nextFollowUpAt: lead.next_follow_up_at,
      lastContactedAt: lead.last_contacted_at,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
      matchCount: (matches.data ?? []).filter((m) => m.lead_id === lead.id).length,
    };
  });
}

export async function getLeadWorkspace(leadId: string): Promise<LeadWorkspace | null> {
  await requireActiveAdmin();
  const client = db();
  const leadResult = await client
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .is("archived_at", null)
    .maybeSingle();
  check(leadResult.error);
  const row = leadResult.data;
  if (!row) return null;
  const [party, requirement, matches, followUps, activities, district, units, admins, properties] =
    await Promise.all([
      client.from("parties").select("id,display_name,phone,email").eq("id", row.party_id).single(),
      client.from("lead_requirements").select("*").eq("lead_id", leadId).maybeSingle(),
      client
        .from("lead_properties")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false }),
      client
        .from("lead_follow_ups")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false }),
      client
        .from("lead_activities")
        .select("*")
        .eq("lead_id", leadId)
        .order("activity_at", { ascending: false })
        .limit(200),
      row.district_id
        ? client.from("districts").select("id,name").eq("id", row.district_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      client.from("area_units").select("id,display_name,symbol"),
      client.from("admin_profiles").select("user_id,display_name"),
      client
        .from("properties")
        .select(
          "id,property_code,listing_title,land_category,primary_transaction_type,availability_status",
        )
        .is("deleted_at", null),
    ]);
  [party, requirement, matches, followUps, activities, district, units, admins, properties].forEach(
    (r) => check(r.error),
  );
  if (!party.data) return null;
  const base: LeadListItem = {
    id: row.id,
    leadReference: row.lead_reference,
    name: party.data.display_name,
    phone: party.data.phone,
    email: party.data.email,
    status: row.status,
    sourceType: row.source_type,
    buyerType: row.buyer_type,
    transaction: row.preferred_transaction,
    category: row.land_category,
    districtName: district.data?.name ?? null,
    localityText: row.locality_text,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    nextFollowUpAt: row.next_follow_up_at,
    lastContactedAt: row.last_contacted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    matchCount: matches.data?.length ?? 0,
  };
  const adminName = (id: string | null) =>
    admins.data?.find((a) => a.user_id === id)?.display_name ?? "System";
  return {
    lead: {
      ...base,
      partyId: row.party_id,
      sourceDetail: row.source_detail,
      inquiryType: row.inquiry_type,
      intendedUse: row.intended_use,
      notesInternal: row.notes_internal,
      closedAt: row.closed_at,
      lossReason: row.loss_reason,
    },
    requirement: requirement.data
      ? {
          id: requirement.data.id,
          minAreaValue: requirement.data.min_area_value,
          maxAreaValue: requirement.data.max_area_value,
          areaUnitId: requirement.data.area_unit_id,
          areaUnitLabel:
            units.data?.find((u) => u.id === requirement.data?.area_unit_id)?.display_name ?? null,
          preferredRoadWidthMMin: requirement.data.preferred_road_width_m_min,
          preferredFrontageMMin: requirement.data.preferred_frontage_m_min,
          notes: requirement.data.preferred_use_text,
        }
      : null,
    matches: (matches.data ?? []).map((m) => {
      const p = properties.data?.find((v) => v.id === m.property_id);
      return {
        id: m.id,
        propertyId: m.property_id,
        propertyCode: p?.property_code ?? "Unknown",
        title: p?.listing_title ?? null,
        category: p?.land_category ?? "Unknown",
        transaction: p?.primary_transaction_type ?? "Unknown",
        availability: p?.availability_status ?? "Unknown",
        status: m.match_status ?? "ACTIVE",
        notes: m.notes_internal,
        matchedAt: m.matched_at,
      };
    }),
    followUps: (followUps.data ?? []).map((f) => ({
      id: f.id,
      type: f.follow_up_type,
      context: f.context,
      note: f.note,
      dueAt: f.due_at,
      completedAt: f.completed_at,
      outcome: f.outcome,
      actorName: adminName(f.created_by),
    })),
    activities: (activities.data ?? []).map((a) => ({
      id: a.id,
      type: a.activity_type,
      at: a.activity_at,
      note: a.note,
      metadata: a.metadata_text,
      actorName: adminName(a.actor_admin_id),
      propertyId: a.property_id,
    })),
  };
}

export async function getCrmReferenceData() {
  await requireActiveAdmin();
  const client = db();
  const [districts, units, properties, admins] = await Promise.all([
    client.from("districts").select("id,name").eq("is_active", true).order("name"),
    client.from("area_units").select("id,display_name,symbol").order("display_name"),
    client
      .from("properties")
      .select(
        "id,property_code,listing_title,land_category,primary_transaction_type,availability_status",
      )
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(100),
    client.from("admin_profiles").select("user_id,display_name").eq("is_active", true),
  ]);
  [districts, units, properties, admins].forEach((r) => check(r.error));
  return {
    districts: districts.data ?? [],
    units: units.data ?? [],
    properties: properties.data ?? [],
    admins: admins.data ?? [],
  };
}

export async function listFollowUps() {
  await requireActiveAdmin();
  const client = db();
  const result = await client
    .from("lead_follow_ups")
    .select("*")
    .order("due_at", { ascending: true })
    .limit(200);
  check(result.error);
  const rows = result.data ?? [];
  const leadIds = [...new Set(rows.map((r) => r.lead_id))];
  if (!leadIds.length) return [];
  const leads = await client
    .from("leads")
    .select("id,lead_reference,party_id,status")
    .in("id", leadIds);
  check(leads.error);
  const parties = await client
    .from("parties")
    .select("id,display_name")
    .in("id", [...new Set((leads.data ?? []).map((l) => l.party_id))]);
  check(parties.error);
  return rows.map((row) => {
    const lead = leads.data?.find((l) => l.id === row.lead_id);
    return {
      ...row,
      leadReference: lead?.lead_reference ?? "Unknown",
      leadStatus: lead?.status ?? "NEW",
      leadName: parties.data?.find((p) => p.id === lead?.party_id)?.display_name ?? "Unknown",
    };
  });
}

export async function listRequirements(unmatchedOnly = false) {
  await requireActiveAdmin();
  const client = db();
  const requirements = await client
    .from("lead_requirements")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(100);
  check(requirements.error);
  const requirementRows = requirements.data ?? [];
  if (!requirementRows.length) return [];
  const [leadRows, matches, units] = await Promise.all([
    client
      .from("leads")
      .select("*")
      .in(
        "id",
        requirementRows.map((requirement) => requirement.lead_id),
      )
      .is("archived_at", null),
    client.from("lead_properties").select("lead_id"),
    client.from("area_units").select("id,display_name,symbol"),
  ]);
  check(leadRows.error);
  check(matches.error);
  check(units.error);
  const rawLeads = leadRows.data ?? [];
  const partyIds = [...new Set(rawLeads.map((lead) => lead.party_id))];
  const districtIds = [
    ...new Set(rawLeads.flatMap((lead) => (lead.district_id ? [lead.district_id] : []))),
  ];
  const [parties, districts] = await Promise.all([
    client.from("parties").select("id,display_name,phone,email").in("id", partyIds),
    districtIds.length
      ? client.from("districts").select("id,name").in("id", districtIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  check(parties.error);
  check(districts.error);
  const leads: LeadListItem[] = rawLeads.map((lead) => {
    const party = parties.data?.find((item) => item.id === lead.party_id);
    return {
      id: lead.id,
      leadReference: lead.lead_reference,
      name: party?.display_name ?? "Unknown contact",
      phone: party?.phone ?? null,
      email: party?.email ?? null,
      status: lead.status,
      sourceType: lead.source_type,
      buyerType: lead.buyer_type,
      transaction: lead.preferred_transaction,
      category: lead.land_category,
      districtName:
        districts.data?.find((district) => district.id === lead.district_id)?.name ?? null,
      localityText: lead.locality_text,
      budgetMin: lead.budget_min,
      budgetMax: lead.budget_max,
      nextFollowUpAt: lead.next_follow_up_at,
      lastContactedAt: lead.last_contacted_at,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
      matchCount: (matches.data ?? []).filter((match) => match.lead_id === lead.id).length,
    };
  });
  return requirementRows
    .map((requirement) => ({
      requirement,
      lead: leads.find((lead) => lead.id === requirement.lead_id),
      matchCount: (matches.data ?? []).filter((match) => match.lead_id === requirement.lead_id)
        .length,
      areaUnit:
        units.data?.find((unit) => unit.id === requirement.area_unit_id)?.display_name ?? null,
    }))
    .filter((item) => item.lead && (!unmatchedOnly || item.matchCount === 0));
}

export async function getRequirementLeadId(requirementId: string) {
  await requireActiveAdmin();
  const result = await db()
    .from("lead_requirements")
    .select("lead_id,leads!inner(archived_at)")
    .eq("id", requirementId)
    .is("leads.archived_at", null)
    .maybeSingle();
  check(result.error);
  return result.data?.lead_id ?? null;
}
