import type { Metadata } from "next";
import Link from "next/link";

import { measureAdminPerf } from "@/server/admin-perf";
import { formatIndiaDateTime } from "@/features/crm/domain/follow-ups";
import { OWNER_SUBMISSION_STATUSES } from "@/features/owner-submissions/domain/contracts";
import {
  getOwnerSubmissionFilterOptions,
  listOwnerSubmissions,
} from "@/server/services/owner-submissions";

export const metadata: Metadata = { title: "Owner submissions" };

export default async function OwnerSubmissionsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    status?: string;
    category?: string;
    intent?: string;
    district?: string;
    assignee?: string;
    documentState?: string;
    createdFrom?: string;
    createdTo?: string;
    query?: string;
  }>;
}>) {
  const filters = await searchParams;
  const isUuid = (val?: string) =>
    typeof val === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  const safeFilters = {
    query: filters.query,
    status: OWNER_SUBMISSION_STATUSES.includes(filters.status as never)
      ? filters.status
      : undefined,
    category: ["AGRICULTURAL", "NA", "INDUSTRIAL"].includes(filters.category ?? "")
      ? filters.category
      : undefined,
    intent: ["SELL", "RENT", "LEASE"].includes(filters.intent ?? "") ? filters.intent : undefined,
    district: isUuid(filters.district) ? filters.district : undefined,
    assignee:
      filters.assignee === "UNASSIGNED" || isUuid(filters.assignee) ? filters.assignee : undefined,
    documentState: ["NONE", "PENDING", "CLEAN", "INFECTED", "FAILED"].includes(
      filters.documentState ?? "",
    )
      ? filters.documentState
      : undefined,
    createdFrom: /^\d{4}-\d{2}-\d{2}$/.test(filters.createdFrom ?? "")
      ? filters.createdFrom
      : undefined,
    createdTo: /^\d{4}-\d{2}-\d{2}$/.test(filters.createdTo ?? "") ? filters.createdTo : undefined,
  };

  const [options, rows] = await measureAdminPerf("/admin/submissions", () =>
    Promise.all([getOwnerSubmissionFilterOptions(), listOwnerSubmissions(safeFilters)]),
  );

  return (
    <section>
      <p className="text-xs font-bold tracking-[.16em] text-[var(--brand-navy)] uppercase">
        Private supply intake
      </p>
      <h1 className="font-display mt-2 text-4xl font-semibold">Owner submissions</h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        Review owner-provided claims and private files. Nothing in this queue is public inventory.
      </p>
      <form className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          name="query"
          defaultValue={filters.query}
          placeholder="Reference, owner, phone or district"
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2"
          name="status"
          defaultValue={filters.status ?? ""}
        >
          <option value="">All statuses</option>
          {OWNER_SUBMISSION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={safeFilters.category ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">All land types</option>
          <option value="AGRICULTURAL">Agricultural</option>
          <option value="NA">NA</option>
          <option value="INDUSTRIAL">Industrial</option>
        </select>
        <select
          name="intent"
          defaultValue={safeFilters.intent ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">All intents</option>
          <option value="SELL">Sell</option>
          <option value="RENT">Rent</option>
          <option value="LEASE">Lease</option>
        </select>
        <select
          name="district"
          defaultValue={safeFilters.district ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">All districts</option>
          {options.districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
        <select
          name="assignee"
          defaultValue={safeFilters.assignee ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">All assignees</option>
          <option value="UNASSIGNED">Unassigned</option>
          {options.admins.map((admin) => (
            <option key={admin.user_id} value={admin.user_id}>
              {admin.display_name}
            </option>
          ))}
        </select>
        <select
          name="documentState"
          defaultValue={safeFilters.documentState ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Any document state</option>
          <option value="NONE">No documents</option>
          <option value="PENDING">Pending scan</option>
          <option value="CLEAN">Clean</option>
          <option value="INFECTED">Infected</option>
          <option value="FAILED">Scan failed</option>
        </select>
        <label className="grid gap-1 text-xs font-bold uppercase text-slate-600">
          Received from
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal"
            type="date"
            name="createdFrom"
            defaultValue={safeFilters.createdFrom ?? ""}
          />
        </label>
        <label className="grid gap-1 text-xs font-bold uppercase text-slate-600">
          Received to
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal"
            type="date"
            name="createdTo"
            defaultValue={safeFilters.createdTo ?? ""}
          />
        </label>
        <button className="button button-primary" type="submit">
          Filter
        </button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {rows.length ? (
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                {[
                  "Reference / owner",
                  "Intent",
                  "Category",
                  "District",
                  "Status",
                  "Assignee",
                  "Next action",
                  "Received",
                ].map((heading) => (
                  <th className="px-4 py-3" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className="border-t border-slate-200" key={row.id}>
                  <td className="px-4 py-3">
                    <Link
                      className="font-bold text-[var(--brand-navy)]"
                      href={`/admin/submissions/${row.id}`}
                    >
                      {row.submission_reference}
                    </Link>
                    <span className="block text-xs text-slate-500">
                      {row.party?.display_name ?? "Unknown owner"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{row.owner_intent}</td>
                  <td className="px-4 py-3">{row.land_category}</td>
                  <td className="px-4 py-3">{row.district?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold">
                      {row.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">{row.assignee?.display_name ?? "Unassigned"}</td>
                  <td className="px-4 py-3">
                    {row.next_action_at ? formatIndiaDateTime(row.next_action_at) : "—"}
                  </td>
                  <td className="px-4 py-3">{formatIndiaDateTime(row.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-10 text-center text-slate-500">
            No owner submissions match these filters.
          </p>
        )}
      </div>
    </section>
  );
}
