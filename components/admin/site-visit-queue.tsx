import Link from "next/link";

import { formatIndiaDateTime } from "@/features/crm/domain/follow-ups";
import {
  SITE_VISIT_STATUSES,
  type SiteVisitListItem,
} from "@/features/site-visits/domain/contracts";
import { siteVisitStatusLabel } from "@/features/site-visits/domain/workflow";

export function SiteVisitQueue({
  visits,
  admins,
  filters,
}: Readonly<{
  visits: readonly SiteVisitListItem[];
  admins: readonly Readonly<{ user_id: string; display_name: string }>[];
  filters: Readonly<Record<string, string | undefined>>;
}>) {
  return (
    <>
      <form
        className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-6"
        aria-label="Site visit filters"
      >
        <input
          name="q"
          defaultValue={filters.q}
          placeholder="Visit, lead, property"
          aria-label="Search site visits"
          className="min-w-0 rounded-lg border border-slate-300 px-3 py-2"
        />
        <select
          name="status"
          defaultValue={filters.status ?? ""}
          aria-label="Visit status"
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">All statuses</option>
          {SITE_VISIT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {siteVisitStatusLabel(status)}
            </option>
          ))}
        </select>
        <select
          name="bucket"
          defaultValue={filters.bucket ?? ""}
          aria-label="Schedule window"
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Any schedule</option>
          <option value="TODAY">Today</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="PAST">Past</option>
          <option value="UNSCHEDULED">Unscheduled</option>
        </select>
        <select
          name="followUp"
          defaultValue={filters.followUp ?? ""}
          aria-label="Follow-up state"
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Any follow-up</option>
          <option value="required">Follow-up required</option>
          <option value="none">No linked follow-up</option>
        </select>
        <select
          name="assigned"
          defaultValue={filters.assigned ?? ""}
          aria-label="Assigned admin"
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Any assignee</option>
          {admins.map((admin) => (
            <option key={admin.user_id} value={admin.user_id}>
              {admin.display_name}
            </option>
          ))}
        </select>
        <button className="button button-primary">Apply filters</button>
      </form>
      <div className="mt-6 max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {visits.length ? (
          <table className="min-w-[1050px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                {[
                  "Visit",
                  "Status",
                  "Schedule (IST)",
                  "Lead",
                  "Property",
                  "Assignee",
                  "Next action",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.id} className="border-t border-slate-200 align-top">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/site-visits/${visit.id}`}
                      className="font-bold text-[var(--brand-navy)] hover:underline"
                    >
                      {visit.reference}
                    </Link>
                    <span className="block text-xs text-slate-500">{visit.bucket}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">
                      {siteVisitStatusLabel(visit.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {visit.effectiveStartAt
                      ? formatIndiaDateTime(visit.effectiveStartAt)
                      : "Not scheduled"}
                    <span className="block text-xs text-slate-500">
                      {visit.confirmedStartAt
                        ? "Confirmed"
                        : visit.proposedStartAt
                          ? "Proposed"
                          : "Requested window"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads/${visit.leadId}`}
                      className="font-semibold hover:underline"
                    >
                      {visit.leadName}
                    </Link>
                    <span className="block text-xs text-slate-500">
                      {visit.leadReference} · {visit.phone ?? "No phone"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/properties/${visit.propertyId}`}
                      className="font-semibold hover:underline"
                    >
                      {visit.propertyCode}
                    </Link>
                    <span className="block text-xs text-slate-500">
                      {visit.propertyTitle ?? "Untitled"} · {visit.availability}
                    </span>
                  </td>
                  <td className="px-4 py-3">{visit.assignedName ?? "Unassigned"}</td>
                  <td className="px-4 py-3">
                    {visit.hasOpenFollowUp ? "CRM follow-up scheduled" : nextAction(visit.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-10 text-center">
            <h2 className="font-display text-2xl">No site visits found</h2>
            <p className="mt-2 text-slate-600">Adjust the filters or wait for a public request.</p>
          </div>
        )}
      </div>
    </>
  );
}

function nextAction(status: SiteVisitListItem["status"]) {
  return (
    {
      REQUESTED: "Record contact",
      CONTACTED: "Propose a slot",
      PROPOSED: "Confirm or reschedule",
      CONFIRMED: "Complete, reschedule, cancel, or no-show",
      RESCHEDULED: "Confirm revised slot",
      NO_SHOW: "Schedule follow-up or reschedule",
      COMPLETED: "Schedule follow-up if needed",
      CANCELLED: "Schedule follow-up if needed",
    } as const
  )[status];
}
