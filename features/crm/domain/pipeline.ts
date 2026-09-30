import type { LeadStatus } from "@/features/admin/contracts";
import { leadMachine } from "@/features/workflows/domain/state-machines";
import { allowedTransitions, canTransition } from "@/features/workflows/domain/state-machine";

const leadStageLabels: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACT_ATTEMPTED: "Contact started",
  QUALIFIED: "Interested",
  REQUIREMENT_CONFIRMED: "Needs confirmed",
  PROPERTY_MATCHED: "Properties shared",
  SITE_VISIT_REQUESTED: "Visit requested",
  SITE_VISIT_CONFIRMED: "Visit booked",
  SITE_VISIT_COMPLETED: "Visit done",
  NEGOTIATION: "Discussing price",
  NURTURE: "Follow up later",
  CLOSED_WON: "Completed",
  CLOSED_LOST: "Not going ahead",
};

export const canTransitionLead = (from: LeadStatus, to: LeadStatus) =>
  canTransition(leadMachine, from, to);
export const nextLeadStatuses = (from: LeadStatus) => allowedTransitions(leadMachine, from);
export function leadStatusLabel(status: LeadStatus) {
  return leadStageLabels[status];
}
