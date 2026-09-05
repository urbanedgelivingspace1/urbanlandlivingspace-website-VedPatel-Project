import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  SiteVisitListItem,
  SiteVisitStatus,
  SiteVisitWorkspace,
} from "@/features/site-visits/domain/contracts";
import {
  classifyVisitTime,
  effectiveVisitStart,
  propertyVisitConflict,
} from "@/features/site-visits/domain/workflow";
import {
  visitFollowUpInputSchema,
  visitNoteInputSchema,
  visitTransitionInputSchema,
} from "@/features/site-visits/domain/validation";
import { requireActiveAdmin } from "@/server/auth/authorization";
import { createPrivilegedServerClient } from "@/server/supabase/privileged";
import type { Database, Json } from "@/types/database.generated";

type Db = SupabaseClient<Database>;
const db = () => createPrivilegedServerClient() as unknown as Db;

function check(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export type SiteVisitFilters = Readonly<{
  status?: string;
  bucket?: string;
  query?: string;
  assignedTo?: string;
  followUp?: string;
}>;

export async function listSiteVisits(filters: SiteVisitFilters = {}): Promise<SiteVisitListItem[]> {
  await requireActiveAdmin();
  const client = db();
  let query = client
    .from("site_visits")
    .select("*")
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(200);
  if (filters.status) query = query.eq("status", filters.status as SiteVisitStatus);
  if (filters.assignedTo) query = query.eq("assigned_to", filters.assignedTo);
  const visitsResult = await query;
  check(visitsResult.error);
  const visits = visitsResult.data ?? [];
  if (!visits.length) return [];
  const leadIds = [...new Set(visits.map((visit) => visit.lead_id))];
  const propertyIds = [...new Set(visits.map((visit) => visit.property_id))];
  const assignedIds = [
    ...new Set(visits.flatMap((visit) => (visit.assigned_to ? [visit.assigned_to] : []))),
  ];
  const [leads, properties, followUps, admins] = await Promise.all([
    client.from("leads").select("id,lead_reference,party_id").in("id", leadIds),
    client
      .from("properties")
      .select("id,property_code,listing_title,availability_status,publication_status")
      .in("id", propertyIds),
    client
      .from("lead_follow_ups")
      .select("lead_id,site_visit_id,completed_at")
      .in("lead_id", leadIds),
    assignedIds.length
      ? client.from("admin_profiles").select("user_id,display_name").in("user_id", assignedIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  [leads, properties, followUps, admins].forEach((result) => check(result.error));
  const partyIds = [...new Set((leads.data ?? []).map((lead) => lead.party_id))];
  const parties = partyIds.length
    ? await client.from("parties").select("id,display_name,phone").in("id", partyIds)
    : { data: [], error: null };
  check(parties.error);

  const items = visits.map((visit): SiteVisitListItem => {
    const lead = leads.data?.find((item) => item.id === visit.lead_id);
    const party = parties.data?.find((item) => item.id === lead?.party_id);
    const property = properties.data?.find((item) => item.id === visit.property_id);
    const effectiveStartAt = effectiveVisitStart({
      confirmedStartAt: visit.confirmed_start_at,
      proposedStartAt: visit.proposed_start_at,
      requestedStartAt: visit.requested_start_at,
    });
    return {
      id: visit.id,
      reference: visit.visit_reference,
      version: visit.version,
      status: visit.status,
      leadId: visit.lead_id,
      leadReference: lead?.lead_reference ?? "Unknown lead",
      leadName: party?.display_name ?? "Unknown contact",
      phone: party?.phone ?? null,
      propertyId: visit.property_id,
      propertyCode: property?.property_code ?? "Unknown property",
      propertyTitle: property?.listing_title ?? null,
      availability: property?.availability_status ?? "UNKNOWN",
      publication: property?.publication_status ?? "UNKNOWN",
      requestedStartAt: visit.requested_start_at,
      proposedStartAt: visit.proposed_start_at,
      confirmedStartAt: visit.confirmed_start_at,
      effectiveStartAt,
      bucket: classifyVisitTime(effectiveStartAt),
      assignedName:
        admins.data?.find((admin) => admin.user_id === visit.assigned_to)?.display_name ?? null,
      hasOpenFollowUp: (followUps.data ?? []).some(
        (followUp) => followUp.site_visit_id === visit.id && !followUp.completed_at,
      ),
      updatedAt: visit.updated_at,
    };
  });
  const needle = filters.query?.trim().toLowerCase();
  return items
    .filter((item) => !filters.bucket || item.bucket === filters.bucket)
    .filter((item) => {
      if (filters.followUp === "required") return item.hasOpenFollowUp;
      if (filters.followUp === "none") return !item.hasOpenFollowUp;
      return true;
    })
    .filter(
      (item) =>
        !needle ||
        [
          item.reference,
          item.leadReference,
          item.leadName,
          item.phone,
          item.propertyCode,
          item.propertyTitle,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(needle)),
    )
    .sort((left, right) => {
      if (!left.effectiveStartAt) return 1;
      if (!right.effectiveStartAt) return -1;
      return Date.parse(left.effectiveStartAt) - Date.parse(right.effectiveStartAt);
    })
    .slice(0, 100);
}

export async function getSiteVisitReferenceData() {
  await requireActiveAdmin();
  const result = await db()
    .from("admin_profiles")
    .select("user_id,display_name")
    .eq("is_active", true)
    .order("display_name");
  check(result.error);
  return { admins: result.data ?? [] };
}

export async function getSiteVisitWorkspace(visitId: string): Promise<SiteVisitWorkspace | null> {
  await requireActiveAdmin();
  const client = db();
  const visitResult = await client
    .from("site_visits")
    .select("*")
    .eq("id", visitId)
    .is("archived_at", null)
    .maybeSingle();
  check(visitResult.error);
  const visit = visitResult.data;
  if (!visit) return null;
  const [lead, property, events, followUps, admins] = await Promise.all([
    client.from("leads").select("id,lead_reference,party_id").eq("id", visit.lead_id).single(),
    client
      .from("properties")
      .select(
        "id,property_code,listing_title,availability_status,publication_status,archived_at,deleted_at",
      )
      .eq("id", visit.property_id)
      .single(),
    client
      .from("site_visit_events")
      .select("*")
      .eq("site_visit_id", visitId)
      .order("occurred_at", { ascending: false })
      .limit(200),
    client
      .from("lead_follow_ups")
      .select("id,follow_up_type,due_at,completed_at,outcome")
      .eq("site_visit_id", visitId)
      .order("created_at", { ascending: false }),
    client.from("admin_profiles").select("user_id,display_name"),
  ]);
  [lead, property, events, followUps, admins].forEach((result) => check(result.error));
  if (!lead.data || !property.data) return null;
  const party = await client
    .from("parties")
    .select("display_name,phone,email")
    .eq("id", lead.data.party_id)
    .single();
  check(party.error);
  if (!party.data) return null;
  const effectiveStartAt = effectiveVisitStart({
    confirmedStartAt: visit.confirmed_start_at,
    proposedStartAt: visit.proposed_start_at,
    requestedStartAt: visit.requested_start_at,
  });
  const adminName = (id: string | null) =>
    admins.data?.find((admin) => admin.user_id === id)?.display_name ?? "System";
  return {
    visit: {
      id: visit.id,
      reference: visit.visit_reference,
      version: visit.version,
      status: visit.status,
      leadId: visit.lead_id,
      leadReference: lead.data.lead_reference,
      leadName: party.data.display_name,
      phone: party.data.phone,
      leadEmail: party.data.email,
      propertyId: visit.property_id,
      propertyCode: property.data.property_code,
      propertyTitle: property.data.listing_title,
      availability: property.data.availability_status,
      publication: property.data.publication_status,
      requestedStartAt: visit.requested_start_at,
      requestedEndAt: visit.requested_end_at,
      proposedStartAt: visit.proposed_start_at,
      proposedEndAt: visit.proposed_end_at,
      confirmedStartAt: visit.confirmed_start_at,
      confirmedEndAt: visit.confirmed_end_at,
      effectiveStartAt,
      bucket: classifyVisitTime(effectiveStartAt),
      assignedName: adminName(visit.assigned_to),
      hasOpenFollowUp: (followUps.data ?? []).some((followUp) => !followUp.completed_at),
      updatedAt: visit.updated_at,
      timezone: "Asia/Kolkata",
      meetingInstructions: visit.meeting_instructions,
      contactOutcome: visit.contact_outcome,
      contactedAt: visit.contacted_at,
      completedAt: visit.completed_at,
      cancelledAt: visit.cancelled_at,
      cancellationReason: visit.cancellation_reason,
      noShowAt: visit.no_show_at,
      outcome: visit.outcome,
      requestNotes: visit.notes_internal,
      propertyConflict: propertyVisitConflict({
        deletedAt: property.data.deleted_at,
        archivedAt: property.data.archived_at,
        publicationStatus: property.data.publication_status,
        availabilityStatus: property.data.availability_status,
      }),
    },
    events: (events.data ?? []).map((event) => ({
      id: event.id,
      type: event.event_type,
      fromStatus: event.from_status,
      toStatus: event.to_status,
      previousStartAt: event.previous_start_at,
      newStartAt: event.new_start_at,
      reason: event.reason,
      note: event.note,
      actorName: adminName(event.actor_admin_id),
      occurredAt: event.occurred_at,
    })),
    followUps: (followUps.data ?? []).map((followUp) => ({
      id: followUp.id,
      type: followUp.follow_up_type,
      dueAt: followUp.due_at,
      completedAt: followUp.completed_at,
      outcome: followUp.outcome,
    })),
  };
}

export async function persistSiteVisitTransition(
  client: Db,
  actorId: string,
  visitId: string,
  input: unknown,
) {
  const parsed = visitTransitionInputSchema.parse(input);
  const { expectedVersion, nextStatus, ...operation } = parsed;
  const result = await client.rpc("transition_site_visit", {
    requested_actor_id: actorId,
    requested_visit_id: visitId,
    requested_expected_version: expectedVersion,
    requested_next_status: nextStatus,
    requested_payload: operation as Json,
  });
  check(result.error);
  return result.data;
}

export async function transitionSiteVisit(visitId: string, input: unknown) {
  const actor = await requireActiveAdmin();
  return persistSiteVisitTransition(db(), actor.userId, visitId, input);
}

export async function addSiteVisitNote(visitId: string, input: unknown) {
  const actor = await requireActiveAdmin();
  return persistSiteVisitNote(db(), actor.userId, visitId, input);
}

export async function persistSiteVisitNote(
  client: Db,
  actorId: string,
  visitId: string,
  input: unknown,
) {
  const parsed = visitNoteInputSchema.parse(input);
  const result = await client.rpc("add_site_visit_note", {
    requested_actor_id: actorId,
    requested_visit_id: visitId,
    requested_expected_version: parsed.expectedVersion,
    requested_note: parsed.note,
  });
  check(result.error);
  return result.data;
}

export async function scheduleSiteVisitFollowUp(visitId: string, input: unknown) {
  const actor = await requireActiveAdmin();
  return persistSiteVisitFollowUp(db(), actor.userId, visitId, input);
}

export async function persistSiteVisitFollowUp(
  client: Db,
  actorId: string,
  visitId: string,
  input: unknown,
) {
  const parsed = visitFollowUpInputSchema.parse(input);
  const result = await client.rpc("schedule_site_visit_follow_up", {
    requested_actor_id: actorId,
    requested_visit_id: visitId,
    requested_expected_version: parsed.expectedVersion,
    requested_due_at: parsed.dueAt,
    requested_type: parsed.type,
    requested_context: parsed.context,
    requested_note: parsed.note,
  });
  check(result.error);
  return result.data;
}
