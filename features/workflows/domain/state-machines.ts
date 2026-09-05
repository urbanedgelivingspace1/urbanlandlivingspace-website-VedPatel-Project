import type { LeadStatus, OwnerSubmissionStatus } from "@/features/admin/contracts";
import type { AvailabilityStatus } from "@/types/database";

import type { StateMachine } from "./state-machine";

export type PropertyPublicationStatus =
  "DRAFT" | "UNDER_REVIEW" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";
export type SiteVisitStatus =
  | "REQUESTED"
  | "CONTACTED"
  | "PROPOSED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "RESCHEDULED";
export type VerificationWorkflowStatus =
  | "NOT_STARTED"
  | "IN_REVIEW"
  | "PASSED"
  | "PASSED_WITH_NOTE"
  | "FAILED"
  | "REQUIRES_REVIEW"
  | "EXPIRED";
export type GuideWorkflowStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";

export const propertyPublicationMachine = {
  DRAFT: ["UNDER_REVIEW", "PUBLISHED"],
  UNDER_REVIEW: ["DRAFT", "PUBLISHED"],
  PUBLISHED: ["UNPUBLISHED", "ARCHIVED"],
  UNPUBLISHED: ["UNDER_REVIEW", "PUBLISHED", "ARCHIVED"],
  ARCHIVED: ["DRAFT"],
} as const satisfies StateMachine<PropertyPublicationStatus>;

export const propertyAvailabilityMachine = {
  AVAILABLE: ["UNDER_NEGOTIATION", "SOLD", "RENTED", "LEASED", "OFF_MARKET"],
  UNDER_NEGOTIATION: ["AVAILABLE", "SOLD", "RENTED", "LEASED", "OFF_MARKET"],
  SOLD: ["OFF_MARKET"],
  RENTED: ["AVAILABLE", "OFF_MARKET"],
  LEASED: ["AVAILABLE", "OFF_MARKET"],
  OFF_MARKET: [],
} as const satisfies StateMachine<AvailabilityStatus>;

export const ownerSubmissionMachine = {
  NEW: ["CONTACTED", "ON_HOLD"],
  CONTACTED: ["DOCS_REQUESTED", "UNDER_REVIEW", "ON_HOLD"],
  DOCS_REQUESTED: ["UNDER_REVIEW", "ON_HOLD"],
  UNDER_REVIEW: ["VERIFICATION_PENDING", "APPROVED", "REJECTED", "ON_HOLD"],
  VERIFICATION_PENDING: ["APPROVED", "ON_HOLD"],
  APPROVED: ["CONVERTED", "ON_HOLD"],
  REJECTED: ["CLOSED"],
  ON_HOLD: ["UNDER_REVIEW"],
  CONVERTED: ["CLOSED"],
  CLOSED: [],
} as const satisfies StateMachine<OwnerSubmissionStatus>;

export const leadMachine = {
  NEW: ["CONTACT_ATTEMPTED", "QUALIFIED", "NURTURE", "CLOSED_LOST"],
  CONTACT_ATTEMPTED: ["CONTACT_ATTEMPTED", "QUALIFIED", "NURTURE", "CLOSED_LOST"],
  QUALIFIED: ["REQUIREMENT_CONFIRMED", "PROPERTY_MATCHED", "NURTURE", "CLOSED_LOST"],
  REQUIREMENT_CONFIRMED: ["PROPERTY_MATCHED", "NURTURE", "CLOSED_LOST"],
  PROPERTY_MATCHED: ["SITE_VISIT_REQUESTED", "NURTURE", "CLOSED_LOST"],
  SITE_VISIT_REQUESTED: ["SITE_VISIT_CONFIRMED", "NURTURE", "CLOSED_LOST"],
  SITE_VISIT_CONFIRMED: ["SITE_VISIT_COMPLETED", "NURTURE", "CLOSED_LOST"],
  SITE_VISIT_COMPLETED: ["NEGOTIATION", "NURTURE", "CLOSED_LOST"],
  NEGOTIATION: ["CLOSED_WON", "CLOSED_LOST", "NURTURE"],
  NURTURE: [
    "CONTACT_ATTEMPTED",
    "QUALIFIED",
    "REQUIREMENT_CONFIRMED",
    "PROPERTY_MATCHED",
    "SITE_VISIT_REQUESTED",
    "NEGOTIATION",
    "CLOSED_WON",
    "CLOSED_LOST",
  ],
  CLOSED_WON: [],
  CLOSED_LOST: [],
} as const satisfies StateMachine<LeadStatus>;

export const siteVisitMachine = {
  REQUESTED: ["CONTACTED", "CANCELLED"],
  CONTACTED: ["PROPOSED", "CANCELLED"],
  PROPOSED: ["CONFIRMED", "RESCHEDULED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "RESCHEDULED", "NO_SHOW", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
  RESCHEDULED: ["PROPOSED", "CONFIRMED", "CANCELLED"],
} as const satisfies StateMachine<SiteVisitStatus>;

export const verificationMachine = {
  NOT_STARTED: ["IN_REVIEW"],
  IN_REVIEW: ["PASSED", "PASSED_WITH_NOTE", "FAILED", "REQUIRES_REVIEW"],
  PASSED: ["EXPIRED", "REQUIRES_REVIEW"],
  PASSED_WITH_NOTE: ["EXPIRED", "REQUIRES_REVIEW"],
  FAILED: ["IN_REVIEW"],
  REQUIRES_REVIEW: ["IN_REVIEW", "FAILED"],
  EXPIRED: ["IN_REVIEW"],
} as const satisfies StateMachine<VerificationWorkflowStatus>;

export const guideMachine = {
  DRAFT: ["REVIEW"],
  REVIEW: ["DRAFT", "PUBLISHED"],
  PUBLISHED: ["UNPUBLISHED", "ARCHIVED"],
  UNPUBLISHED: ["REVIEW", "PUBLISHED", "ARCHIVED"],
  ARCHIVED: [],
} as const satisfies StateMachine<GuideWorkflowStatus>;
