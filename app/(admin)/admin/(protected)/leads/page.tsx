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
  const isUnmatchedBuyerView =
    value("view") === "unmatched_buyers" || value("unmatched") === "true";
  const activeType = value("type") ?? (isUnmatchedBuyerView ? "UNMATCHED" : "ALL");

  const [rawLeads, refs] = await measureAdminPerf("/admin/leads", () =>
    Promise.all([
      listLeads({
        query: value("q"),
        status: value("status"),
        category: value("category"),
        transaction: value("transaction"),
        source: value("source"),
        inquiryType:
          value("type") === "SELLER_LEAD" || value("type") === "BUYER_LEAD"
            ? value("type")
            : undefined,
        districtId: value("district"),
        followUp: value("followUp"),
        createdFrom: value("from"),
        createdTo: value("to"),
        assignedTo: value("assigned"),
      }),
      getCrmReferenceData(),
    ]),
  );

  const leads = isUnmatchedBuyerView
    ? rawLeads.filter((l) => l.inquiryType !== "SELLER_LEAD" && l.matchCount === 0)
    : rawLeads;

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
            People & demand management: Seller leads, buyer requirements, and match pipeline.
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

      {/* Quick View Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <Link
          href="/admin/leads"
          style={activeType === "ALL" ? { color: "#ffffff" } : undefined}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
            activeType === "ALL"
              ? "bg-[var(--brand-navy)] text-white"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          All Leads ({rawLeads.length})
        </Link>
        <Link
          href="/admin/leads?type=SELLER_LEAD"
          style={activeType === "SELLER_LEAD" ? { color: "#ffffff" } : undefined}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
            activeType === "SELLER_LEAD"
              ? "bg-emerald-700 text-white"
              : "bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200"
          }`}
        >
          Seller Leads
        </Link>
        <Link
          href="/admin/leads?type=BUYER_LEAD"
          style={activeType === "BUYER_LEAD" ? { color: "#ffffff" } : undefined}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
            activeType === "BUYER_LEAD"
              ? "bg-blue-700 text-white"
              : "bg-white text-blue-800 hover:bg-blue-50 border border-blue-200"
          }`}
        >
          Buyer Leads
        </Link>
        <Link
          href="/admin/leads?view=unmatched_buyers"
          style={activeType === "UNMATCHED" ? { color: "#ffffff" } : undefined}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
            activeType === "UNMATCHED"
              ? "bg-amber-700 text-white"
              : "bg-white text-amber-800 hover:bg-amber-50 border border-amber-200"
          }`}
        >
          Unmatched Buyers
        </Link>
      </div>

      <form
        className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-5"
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
                  "Type",
                  "Stage",
                  "Demand / Intent",
                  "Location",
                  "Matches",
                  "Next follow-up",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const isSeller = lead.inquiryType === "SELLER_LEAD";
                return (
                  <tr key={lead.id} className="border-t border-slate-200 hover:bg-slate-50/50">
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
                    <td className="px-4 py-3">
                      {isSeller ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-900 uppercase tracking-wide">
                          Seller
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-900 uppercase tracking-wide">
                          Buyer
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800">
                        {leadStatusLabel(lead.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {[lead.transaction, lead.category].filter(Boolean).join(" · ") || "General"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {lead.districtName ?? lead.localityText ?? "Not set"}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold">{lead.matchCount}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {lead.nextFollowUpAt ? formatIndiaDateTime(lead.nextFollowUpAt) : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold">
                      {isSeller ? (
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="rounded-md bg-emerald-50 border border-emerald-300 px-2 py-1 text-emerald-800 hover:bg-emerald-100 transition-colors"
                        >
                          Open seller workspace →
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="text-[var(--brand-navy)] hover:underline"
                        >
                          View workspace →
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
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
