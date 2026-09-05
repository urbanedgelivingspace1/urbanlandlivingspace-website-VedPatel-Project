import type { LeadStatus } from "@/features/admin/contracts";
import { leadMachine } from "@/features/workflows/domain/state-machines";
import { allowedTransitions, canTransition } from "@/features/workflows/domain/state-machine";

export const canTransitionLead = (from: LeadStatus, to: LeadStatus) =>
  canTransition(leadMachine, from, to);
export const nextLeadStatuses = (from: LeadStatus) => allowedTransitions(leadMachine, from);
export function leadStatusLabel(status: LeadStatus) {
  return status
    .replace("CLOSED_WON", "Closed won")
    .replace("CLOSED_LOST", "Closed lost")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}
