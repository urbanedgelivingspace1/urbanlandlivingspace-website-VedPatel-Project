"use client";

import { useState } from "react";

import type { LeadStatus } from "@/features/admin/contracts";
import { LOSS_REASONS } from "@/features/crm/domain/contracts";
import { leadStatusLabel } from "@/features/crm/domain/pipeline";

type Props = Readonly<{
  currentStatus: LeadStatus;
  nextStatuses: readonly LeadStatus[];
  action: (data: FormData) => Promise<void>;
}>;

const control = "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

const lossReasonLabels: Record<(typeof LOSS_REASONS)[number], string> = {
  BUDGET_MISMATCH: "Budget does not match",
  LOCATION_MISMATCH: "Location does not match",
  SIZE_MISMATCH: "Land size does not match",
  PROPERTY_SOLD: "Property was sold",
  PROPERTY_UNAVAILABLE: "Property is not available",
  BUYER_ELIGIBILITY_REVIEW: "Buyer is not ready",
  LEGAL_DOCUMENT_CONCERN: "Document concern",
  TIMING_CHANGED: "Timing changed",
  COMPETITOR_PROPERTY: "Chose another property",
  BUYER_STOPPED_RESPONDING: "Customer stopped replying",
  NOT_INTERESTED: "Not interested",
  DUPLICATE: "Duplicate lead",
  OTHER: "Other reason",
};

export function LeadStageForm({ currentStatus, nextStatuses, action }: Props) {
  const [nextStatus, setNextStatus] = useState<LeadStatus>(nextStatuses[0] ?? currentStatus);
  const closingLost = nextStatus === "CLOSED_LOST";
  const closingWon = nextStatus === "CLOSED_WON";

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-slate-50 p-3">
        <p className="text-xs font-semibold text-slate-500">Current stage</p>
        <p className="mt-1 text-sm font-bold text-slate-950">{leadStatusLabel(currentStatus)}</p>
      </div>
      <form action={action} className="space-y-3">
        <label className="text-sm font-semibold">
          Move lead to
          <select
            name="nextStatus"
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value as LeadStatus)}
            className={control}
          >
            {nextStatuses.map((status) => (
              <option key={status} value={status}>
                {leadStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>

        {closingLost ? (
          <label className="text-sm font-semibold">
            Why is it not going ahead?
            <select name="reason" className={control} required defaultValue="">
              <option value="" disabled>
                Choose a reason
              </option>
              {LOSS_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {lossReasonLabels[reason]}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="text-sm font-semibold">
            {closingWon ? "What was agreed?" : "Short note (optional)"}
            <input
              name="reason"
              required={closingWon}
              placeholder={closingWon ? "Add the final result" : "Add useful context"}
              className={control}
            />
          </label>
        )}

        <p className="text-xs text-slate-500">
          Only the next allowed stages are shown. This updates the lead’s current stage.
        </p>
        <button className="button button-primary w-full">Update lead stage</button>
      </form>
    </div>
  );
}
