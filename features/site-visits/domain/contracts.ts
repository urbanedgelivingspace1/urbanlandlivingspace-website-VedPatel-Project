import type { Database } from "@/types/database.generated";

export const SITE_VISIT_STATUSES = [
  "REQUESTED",
  "CONTACTED",
  "PROPOSED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "RESCHEDULED",
] as const;

export type SiteVisitStatus = Database["public"]["Enums"]["site_visit_status"];
export type SiteVisitQueueBucket = "TODAY" | "UPCOMING" | "PAST" | "UNSCHEDULED";

export type SiteVisitListItem = Readonly<{
  id: string;
  reference: string;
  version: number;
  status: SiteVisitStatus;
  leadId: string;
  leadReference: string;
  leadName: string;
  phone: string | null;
  propertyId: string;
  propertyCode: string;
  propertyTitle: string | null;
  availability: string;
  publication: string;
  requestedStartAt: string | null;
  proposedStartAt: string | null;
  confirmedStartAt: string | null;
  effectiveStartAt: string | null;
  bucket: SiteVisitQueueBucket;
  assignedName: string | null;
  hasOpenFollowUp: boolean;
  updatedAt: string;
}>;

export type SiteVisitWorkspace = Readonly<{
  visit: SiteVisitListItem & {
    requestedEndAt: string | null;
    proposedEndAt: string | null;
    confirmedEndAt: string | null;
    timezone: "Asia/Kolkata";
    meetingInstructions: string | null;
    contactOutcome: string | null;
    contactedAt: string | null;
    completedAt: string | null;
    cancelledAt: string | null;
    cancellationReason: string | null;
    noShowAt: string | null;
    outcome: string | null;
    requestNotes: string | null;
    leadEmail: string | null;
    propertyConflict: string | null;
  };
  events: readonly Readonly<{
    id: string;
    type: string;
    fromStatus: SiteVisitStatus | null;
    toStatus: SiteVisitStatus | null;
    previousStartAt: string | null;
    newStartAt: string | null;
    reason: string | null;
    note: string | null;
    actorName: string;
    occurredAt: string;
  }>[];
  followUps: readonly Readonly<{
    id: string;
    type: string;
    dueAt: string;
    completedAt: string | null;
    outcome: string | null;
  }>[];
}>;
