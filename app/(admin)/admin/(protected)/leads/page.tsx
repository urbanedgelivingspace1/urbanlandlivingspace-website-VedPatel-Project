import Link from "next/link";
import type { Metadata } from "next";
import { measureAdminPerf } from "@/server/admin-perf";
import { LEAD_STATUSES } from "@/features/crm/domain/contracts";
import { formatIndiaDateTime } from "@/features/crm/domain/follow-ups";
import { leadStatusLabel } from "@/features/crm/domain/pipeline";
import { getCrmReferenceData, listLeads } from "@/server/services/crm";

export const metadata: Metadata = { title: "Leads | CRM" };
export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const value = (key: string) => (typeof params[key] === "string" ? params[key] : undefined);
  const [leads, refs] = await measureAdminPerf("/admin/leads", () =>
    Promise.all([
      listLeads({
        query: value("q"),
        status: value("status"),
        category: value("category"),
        transaction: value("transaction"),
        source: value("source"),
        districtId: value("district"),
        followUp: value("followUp"),
        createdFrom: value("from"),
        createdTo: value("to"),
        assignedTo: value("assigned"),
      }),
      getCrmReferenceData(),
    ]),
  );
  return (
    <section className="min-w-0" aria-labelledby="leads-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[.16em] text-[var(--brand-navy)] uppercase">
            Brokerage CRM
          </p>
          <h1 id="leads-heading" className="font-display mt-2 text-4xl font-semibold">
            Lead inbox
          </h1>
          <p className="mt-2 text-slate-600">
            Private, bounded operational search. Up to 100 recent matches.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/leads/pipeline" className="button button-outline">
            Pipeline
          </Link>
          <Link href="/admin/leads/new" className="button button-primary">
            New lead
          </Link>
        </div>
      </div>
      <form
        className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-5"
        aria-label="Lead filters"
      >
        <input
          name="q"
          defaultValue={value("q")}
          placeholder="Name, phone or email"
          aria-label="Search contacts"
          className="min-w-0 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <select
          name="status"
          defaultValue={value("status") ?? ""}
          aria-label="Pipeline stage"
          className="min-w-0 w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">All stages</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {leadStatusLabel(s)}
            </option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={value("category") ?? ""}
          aria-label="Land category"
          className="min-w-0 w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">All categories</option>
          {["AGRICULTURAL", "NA", "INDUSTRIAL"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <select
          name="transaction"
          defaultValue={value("transaction") ?? ""}
          aria-label="Transaction"
          className="min-w-0 w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">All transactions</option>
          {["BUY", "RENT", "LEASE"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <select
          name="followUp"
          defaultValue={value("followUp") ?? ""}
          aria-label="Follow-up state"
          className="min-w-0 w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Any follow-up</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due today</option>
          <option value="upcoming">Next 7 days</option>
          <option value="none">No follow-up</option>
        </select>
        <select
          name="assigned"
          defaultValue={value("assigned") ?? ""}
          aria-label="Assigned admin"
          className="min-w-0 w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Any assignee</option>
          {refs.admins.map((admin) => (
            <option key={admin.user_id} value={admin.user_id}>
              {admin.display_name}
            </option>
          ))}
        </select>
        <select
          name="district"
          defaultValue={value("district") ?? ""}
          aria-label="District"
          className="min-w-0 w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">All districts</option>
          {refs.districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <input
          name="source"
          defaultValue={value("source")}
          placeholder="Source"
          aria-label="Source"
          className="min-w-0 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          type="date"
          name="from"
          defaultValue={value("from")}
          aria-label="Created from"
          className="min-w-0 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          type="date"
          name="to"
          defaultValue={value("to")}
          aria-label="Created to"
          className="min-w-0 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <button className="button button-primary">Apply filters</button>
      </form>
      <div className="mt-6 max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {leads.length ? (
          <table className="min-w-[1050px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                {[
                  "Lead",
                  "Stage",
                  "Source",
                  "Demand",
                  "Location",
                  "Matches",
                  "Next follow-up",
                  "Updated",
                ].map((h) => (
                  <th key={h} className="px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-bold text-[var(--brand-navy)] underline-offset-2 hover:underline"
                    >
                      {lead.name}
                    </Link>
                    <span className="block text-xs text-slate-500">
                      {lead.leadReference} · {lead.phone ?? lead.email}
                    </span>
                  </td>
                  <td className="px-4 py-3">{leadStatusLabel(lead.status)}</td>
                  <td className="px-4 py-3">{lead.sourceType}</td>
                  <td className="px-4 py-3">
                    {[lead.transaction, lead.category].filter(Boolean).join(" · ") || "Not set"}
                  </td>
                  <td className="px-4 py-3">
                    {lead.districtName ?? lead.localityText ?? "Not set"}
                  </td>
                  <td className="px-4 py-3">{lead.matchCount}</td>
                  <td className="px-4 py-3">
                    {lead.nextFollowUpAt
                      ? formatIndiaDateTime(lead.nextFollowUpAt)
                      : "Not scheduled"}
                  </td>
                  <td className="px-4 py-3">{formatIndiaDateTime(lead.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-10 text-center">
            <h2 className="font-display text-2xl">No leads found</h2>
            <p className="mt-2 text-slate-600">Adjust the filters or create the first lead.</p>
          </div>
        )}
      </div>
    </section>
  );
}
