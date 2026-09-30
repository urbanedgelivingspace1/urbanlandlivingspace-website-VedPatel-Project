import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { LeadStatus } from "@/features/admin/contracts";
import {
  LEAD_STATUSES,
  type FollowUpType,
  type LeadListItem,
  type LeadWorkspace,
  type MatchableProperty,
  type PropertyInterestedBuyers,
} from "@/features/crm/domain/contracts";
import { classifyFollowUp } from "@/features/crm/domain/follow-ups";
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
  inquiryType?: string;
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
  if (filters.inquiryType) {
    if (filters.inquiryType === "SELLER_LEAD") {
      query = query.eq("inquiry_type", "SELLER_LEAD");
    } else if (filters.inquiryType === "BUYER_LEAD") {
      query = query.neq("inquiry_type", "SELLER_LEAD");
    }
  }
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
      inquiryType: lead.inquiry_type,
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
  const [
    party,
    requirement,
    matches,
    followUps,
    activities,
    district,
    units,
    admins,
    properties,
    sellerLinks,
    documents,
  ] = await Promise.all([
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
        "id,property_code,listing_title,land_category,primary_transaction_type,availability_status,publication_status,created_at",
      )
      .is("deleted_at", null),
    client
      .from("property_source_links")
      .select("property_id")
      .eq("source_type", "SELLER_LEAD")
      .eq("source_reference", leadId),
    client
      .from("private_documents")
      .select(
        "id,property_id,document_type,mime_type,file_size_bytes,original_file_name,page_count,scan_status,created_at,archived_at",
      )
      .eq("party_id", row.party_id)
      .eq("document_reference", `LEAD:${leadId}`)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
  ]);
  [
    party,
    requirement,
    matches,
    followUps,
    activities,
    district,
    units,
    admins,
    properties,
    sellerLinks,
    documents,
  ].forEach((result) => check(result.error));
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
    sellerProperties: (sellerLinks.data ?? [])
      .map((link) => {
        const p = properties.data?.find((v) => v.id === link.property_id);
        if (!p) return null;
        return {
          id: link.property_id,
          propertyCode: p.property_code,
          title: p.listing_title,
          category: p.land_category,
          transaction: p.primary_transaction_type,
          availability: p.availability_status,
          publicationStatus: p.publication_status,
          createdAt: p.created_at,
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null),
    documents: (documents.data ?? []).map((document) => ({
      id: document.id,
      propertyId: document.property_id,
      documentType: document.document_type,
      mimeType: document.mime_type,
      fileSizeBytes: document.file_size_bytes,
      originalFileName: document.original_file_name,
      pageCount: document.page_count,
      scanStatus: document.scan_status,
      createdAt: document.created_at,
      archivedAt: document.archived_at,
    })),
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

const FALLBACK_CRM_DISTRICTS = [
  { id: "00000000-0000-4000-8000-000000000003", name: "Ahmedabad" },
  { id: "00000000-0000-4000-8000-000000000004", name: "Gandhinagar" },
];

const FALLBACK_CRM_UNITS = [
  { id: "10000000-0000-4000-8000-000000000002", display_name: "Square foot", symbol: "ft²" },
  { id: "10000000-0000-4000-8000-000000000001", display_name: "Square metre", symbol: "m²" },
  { id: "10000000-0000-4000-8000-000000000003", display_name: "Square yard", symbol: "yd²" },
  { id: "10000000-0000-4000-8000-000000000004", display_name: "Var", symbol: "var" },
  { id: "10000000-0000-4000-8000-000000000005", display_name: "Guntha", symbol: "guntha" },
  { id: "10000000-0000-4000-8000-000000000006", display_name: "Acre", symbol: "ac" },
  { id: "10000000-0000-4000-8000-000000000007", display_name: "Hectare", symbol: "ha" },
];

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

  const resolvedDistricts =
    districts.data && districts.data.length > 0 ? districts.data : FALLBACK_CRM_DISTRICTS;

  const resolvedUnits = units.data && units.data.length > 0 ? units.data : FALLBACK_CRM_UNITS;

  return {
    districts: resolvedDistricts,
    units: resolvedUnits,
    properties: properties.data ?? [],
    admins: admins.data ?? [],
  };
}

export async function searchMatchableProperties(
  filters: Readonly<{ query?: string; category?: string; transaction?: string }> = {},
): Promise<MatchableProperty[]> {
  await requireActiveAdmin();
  const client = db();
  let request = client
    .from("properties")
    .select(
      "id,property_code,listing_title,land_category,primary_transaction_type,availability_status,public_address,district_id,display_area_value,display_area_unit_id",
    )
    .is("deleted_at", null)
    .in("availability_status", ["AVAILABLE", "UNDER_NEGOTIATION"])
    .order("updated_at", { ascending: false })
    .limit(30);
  const safeQuery = filters.query?.trim().replaceAll(/[,%()]/g, "");
  if (safeQuery) {
    request = request.or(
      `property_code.ilike.%${safeQuery}%,listing_title.ilike.%${safeQuery}%,public_address.ilike.%${safeQuery}%`,
    );
  }
  if (filters.category) {
    request = request.eq(
      "land_category",
      filters.category as Database["public"]["Enums"]["land_category"],
    );
  }
  if (filters.transaction) {
    request = request.eq(
      "primary_transaction_type",
      filters.transaction as Database["public"]["Enums"]["transaction_type"],
    );
  }
  const properties = await request;
  check(properties.error);
  const rows = properties.data ?? [];
  if (!rows.length) return [];
  const propertyIds = rows.map((row) => row.id);
  const [offers, units, districts] = await Promise.all([
    client
      .from("property_offers")
      .select("property_id,price_mode,price_amount,price_min,price_max")
      .in("property_id", propertyIds)
      .eq("is_primary", true)
      .is("archived_at", null),
    client
      .from("area_units")
      .select("id,display_name,symbol")
      .in("id", [...new Set(rows.map((row) => row.display_area_unit_id))]),
    client
      .from("districts")
      .select("id,name")
      .in("id", [...new Set(rows.map((row) => row.district_id))]),
  ]);
  [offers, units, districts].forEach((result) => check(result.error));
  return rows.map((row) => {
    const offer = offers.data?.find((item) => item.property_id === row.id);
    const unit = units.data?.find((item) => item.id === row.display_area_unit_id);
    const district = districts.data?.find((item) => item.id === row.district_id);
    return {
      id: row.id,
      propertyCode: row.property_code,
      title: row.listing_title,
      category: row.land_category,
      transaction: row.primary_transaction_type,
      availability: row.availability_status,
      location: row.public_address || district?.name || null,
      areaValue: row.display_area_value,
      areaUnit: unit?.symbol ?? unit?.display_name ?? null,
      priceMode: offer?.price_mode ?? null,
      priceAmount: offer?.price_amount ?? null,
      priceMin: offer?.price_min ?? null,
      priceMax: offer?.price_max ?? null,
    };
  });
}

export async function listFollowUps() {
  await requireActiveAdmin();
  const client = db();
  const [openResult, completedResult] = await Promise.all([
    client
      .from("lead_follow_ups")
      .select("*")
      .is("completed_at", null)
      .order("due_at", { ascending: true })
      .limit(500),
    client
      .from("lead_follow_ups")
      .select("*")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(100),
  ]);
  check(openResult.error);
  check(completedResult.error);
  const rows = [...(openResult.data ?? []), ...(completedResult.data ?? [])];
  const leadIds = [...new Set(rows.map((r) => r.lead_id))];
  if (!leadIds.length) return [];
  const leads = await client
    .from("leads")
    .select("id,lead_reference,party_id,status")
    .in("id", leadIds);
  check(leads.error);
  const parties = await client
    .from("parties")
    .select("id,display_name,phone")
    .in("id", [...new Set((leads.data ?? []).map((l) => l.party_id))]);
  check(parties.error);
  return rows.map((row) => {
    const lead = leads.data?.find((l) => l.id === row.lead_id);
    return {
      ...row,
      leadReference: lead?.lead_reference ?? "Unknown",
      leadStatus: lead?.status ?? "NEW",
      leadName: parties.data?.find((p) => p.id === lead?.party_id)?.display_name ?? "Unknown",
      leadPhone: parties.data?.find((p) => p.id === lead?.party_id)?.phone ?? null,
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

export async function getDashboardLeadMetrics() {
  await requireActiveAdmin();
  const client = db();
  const result = await client
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("status", "NEW")
    .is("archived_at", null);
  check(result.error);
  return { newLeadsCount: result.count ?? 0 };
}

export async function getDashboardLeadStageMetrics() {
  await requireActiveAdmin();
  const client = db();
  const results = await Promise.all(
    LEAD_STATUSES.map(async (status) => {
      const result = await client
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", status)
        .is("archived_at", null);
      check(result.error);
      return [status, result.count ?? 0] as const;
    }),
  );
  return Object.fromEntries(results) as Record<(typeof LEAD_STATUSES)[number], number>;
}

export async function getDashboardFollowUpMetrics() {
  await requireActiveAdmin();
  const client = db();
  const result = await client
    .from("lead_follow_ups")
    .select("due_at,completed_at")
    .is("completed_at", null);
  check(result.error);
  const rows = result.data ?? [];
  let overdueCount = 0;
  let todayCount = 0;
  for (const row of rows) {
    const status = classifyFollowUp(row.due_at, row.completed_at);
    if (status === "OVERDUE") overdueCount++;
    else if (status === "TODAY") todayCount++;
  }
  return { overdueCount, todayCount };
}

export async function getPropertyInterestedBuyers(
  propertyId: string,
): Promise<PropertyInterestedBuyers> {
  await requireActiveAdmin();
  const client = db();
  const [matchRows, visitRows] = await Promise.all([
    client
      .from("lead_properties")
      .select("id,lead_id,property_id,notes_internal,created_at")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false }),
    client
      .from("site_visits")
      .select(
        "id,lead_id,property_id,confirmed_start_at,requested_start_at,status,notes_internal,created_at",
      )
      .eq("property_id", propertyId)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
  ]);
  check(matchRows.error);
  check(visitRows.error);

  const rawMatches = matchRows.data ?? [];
  const rawVisits = visitRows.data ?? [];

  const leadIds = [
    ...new Set([...rawMatches.map((m) => m.lead_id), ...rawVisits.map((v) => v.lead_id)]),
  ];
  if (!leadIds.length) {
    return { matches: [], siteVisits: [] };
  }

  const leadsResult = await client
    .from("leads")
    .select("id,lead_reference,status,party_id")
    .in("id", leadIds)
    .is("archived_at", null);
  check(leadsResult.error);

  const leads = leadsResult.data ?? [];
  const partyIds = [...new Set(leads.map((l) => l.party_id))];

  const partiesResult = partyIds.length
    ? await client.from("parties").select("id,display_name,phone,email").in("id", partyIds)
    : { data: [], error: null };
  check(partiesResult.error);

  const parties = partiesResult.data ?? [];

  const leadLookup = new Map(
    leads.map((lead) => {
      const party = parties.find((p) => p.id === lead.party_id);
      return [
        lead.id,
        {
          id: lead.id,
          reference: lead.lead_reference,
          name: party?.display_name ?? "Unknown contact",
          phone: party?.phone ?? null,
          status: lead.status,
        },
      ];
    }),
  );

  const matches = rawMatches.map((match) => {
    const lead = leadLookup.get(match.lead_id);
    return {
      id: match.id,
      leadId: match.lead_id,
      leadReference: lead?.reference ?? "LEAD",
      leadName: lead?.name ?? "Unknown contact",
      leadPhone: lead?.phone ?? null,
      leadStatus: lead?.status ?? "NEW",
      matchedAt: match.created_at,
      notes: match.notes_internal,
    };
  });

  const siteVisits = rawVisits.map((visit) => {
    const lead = leadLookup.get(visit.lead_id);
    return {
      id: visit.id,
      leadId: visit.lead_id,
      leadReference: lead?.reference ?? "LEAD",
      leadName: lead?.name ?? "Unknown contact",
      scheduledAt: (visit.confirmed_start_at ??
        visit.requested_start_at ??
        visit.created_at) as string,
      status: visit.status,
      notes: visit.notes_internal,
    };
  });

  return { matches, siteVisits };
}

export async function deleteLead(leadId: string, reason?: string): Promise<void> {
  const admin = await requireActiveAdmin();
  const client = db();

  const { data: lead, error: fetchError } = await client
    .from("leads")
    .select("id, lead_reference, status, archived_at")
    .eq("id", leadId)
    .is("archived_at", null)
    .maybeSingle();

  check(fetchError);
  if (!lead) throw new Error("Lead not found or already deleted.");

  const now = new Date().toISOString();

  const { error: updateError } = await client
    .from("leads")
    .update({
      archived_at: now,
      updated_at: now,
      updated_by: admin.userId,
    })
    .eq("id", leadId)
    .is("archived_at", null);

  check(updateError);

  const { error: auditError } = await client.from("audit_logs").insert({
    actor_admin_id: admin.userId,
    action: "DELETE",
    entity_type: "lead",
    entity_id: leadId,
    changed_fields: ["archived_at"],
    before_state: {
      archived_at: null,
      status: lead.status,
    },
    after_state: {
      archived_at: now,
    },
    reason: reason ?? `Lead ${lead.lead_reference ?? leadId} deleted by admin`,
  });

  if (auditError) {
    console.warn("deleteLead audit logging warning:", auditError);
  }
}
