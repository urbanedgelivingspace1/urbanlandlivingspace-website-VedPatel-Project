import type { LeadStatus } from "@/features/admin/contracts";
import type {
  SiteVisitQueueBucket,
  SiteVisitStatus,
} from "@/features/site-visits/domain/contracts";

export const SITE_VISIT_TRANSITIONS: Readonly<Record<SiteVisitStatus, readonly SiteVisitStatus[]>> =
  {
    REQUESTED: ["CONTACTED", "CANCELLED"],
    CONTACTED: ["PROPOSED", "CANCELLED"],
    PROPOSED: ["CONFIRMED", "RESCHEDULED", "CANCELLED"],
    CONFIRMED: ["COMPLETED", "RESCHEDULED", "CANCELLED", "NO_SHOW"],
    RESCHEDULED: ["CONFIRMED", "RESCHEDULED", "CANCELLED"],
    NO_SHOW: ["RESCHEDULED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
  };

export function canTransitionSiteVisit(from: SiteVisitStatus, to: SiteVisitStatus) {
  return SITE_VISIT_TRANSITIONS[from].includes(to);
}

export function nextSiteVisitStatuses(from: SiteVisitStatus) {
  return SITE_VISIT_TRANSITIONS[from];
}

export function siteVisitStatusLabel(status: SiteVisitStatus) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (character) => character.toUpperCase());
}

const INDIA_OFFSET_MS = 5.5 * 60 * 60 * 1000;
function indiaDayKey(date: Date) {
  return new Date(date.getTime() + INDIA_OFFSET_MS).toISOString().slice(0, 10);
}

export function classifyVisitTime(
  effectiveStartAt: string | null,
  now = new Date(),
): SiteVisitQueueBucket {
  if (!effectiveStartAt) return "UNSCHEDULED";
  const start = new Date(effectiveStartAt);
  if (indiaDayKey(start) === indiaDayKey(now)) return "TODAY";
  return start.getTime() > now.getTime() ? "UPCOMING" : "PAST";
}

export function indiaLocalDateTimeToUtc(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("Invalid local date/time.");
  const parsed = new Date(`${value}:00+05:30`);
  if (Number.isNaN(parsed.getTime())) throw new Error("Invalid local date/time.");
  return parsed.toISOString();
}

export function toIndiaLocalDateTime(value: string | null) {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export function effectiveVisitStart(input: {
  confirmedStartAt: string | null;
  proposedStartAt: string | null;
  requestedStartAt: string | null;
}) {
  return input.confirmedStartAt ?? input.proposedStartAt ?? input.requestedStartAt;
}

export function propertyVisitConflict(property: {
  deletedAt?: string | null;
  archivedAt?: string | null;
  publicationStatus: string;
  availabilityStatus: string;
}) {
  if (property.deletedAt || property.archivedAt) return "Property is archived or deleted.";
  if (property.publicationStatus !== "PUBLISHED") return "Property is not currently published.";
  if (!["AVAILABLE", "UNDER_NEGOTIATION"].includes(property.availabilityStatus))
    return `Property is ${property.availabilityStatus.toLowerCase().replaceAll("_", " ")}.`;
  return null;
}

const EARLY_LEAD_STAGES: readonly LeadStatus[] = [
  "NEW",
  "CONTACT_ATTEMPTED",
  "QUALIFIED",
  "REQUIREMENT_CONFIRMED",
  "PROPERTY_MATCHED",
];

export function crmStageForVisitMilestone(
  current: LeadStatus,
  nextVisitStatus: SiteVisitStatus,
): LeadStatus {
  if (nextVisitStatus === "CONTACTED" && EARLY_LEAD_STAGES.includes(current))
    return "SITE_VISIT_REQUESTED";
  if (nextVisitStatus === "CONFIRMED" && current === "SITE_VISIT_REQUESTED")
    return "SITE_VISIT_CONFIRMED";
  if (nextVisitStatus === "COMPLETED" && current === "SITE_VISIT_CONFIRMED")
    return "SITE_VISIT_COMPLETED";
  if (["RESCHEDULED", "NO_SHOW"].includes(nextVisitStatus) && current === "SITE_VISIT_CONFIRMED")
    return "SITE_VISIT_REQUESTED";
  if (
    nextVisitStatus === "CANCELLED" &&
    ["SITE_VISIT_REQUESTED", "SITE_VISIT_CONFIRMED"].includes(current)
  )
    return "PROPERTY_MATCHED";
  return current;
}
