import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  AdminPageHeader,
  EmptyState,
  StatusBadge,
  WorkspaceTabs,
} from "@/components/admin/admin-ui";
import { LEAD_STATUSES, type LeadListItem } from "@/features/crm/domain/contracts";
import { classifyFollowUp, formatIndiaDateTime } from "@/features/crm/domain/follow-ups";
import { leadStatusLabel } from "@/features/crm/domain/pipeline";
import { DeleteLeadButton } from "@/components/admin/delete-lead-button";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { SiteVisitQueue } from "@/components/admin/site-visit-queue";
import { measureAdminPerf } from "@/server/admin-perf";
import { getCrmReferenceData, listFollowUps, listLeads } from "@/server/services/crm";
import { getSiteVisitReferenceData, listSiteVisits } from "@/server/services/site-visits";
import { completeFollowUpAction, deleteLeadAction } from "./actions";

export const metadata: Metadata = { title: "Leads" };
type Params = Record<string, string | string[] | undefined>;
type LeadView = "all" | "follow-ups" | "site-visits" | "stages";
type LeadPageData =
  | { kind: "follow-ups"; rows: Awaited<ReturnType<typeof listFollowUps>> }
  | {
      kind: "site-visits";
      visits: Awaited<ReturnType<typeof listSiteVisits>>;
      refs: Awaited<ReturnType<typeof getSiteVisitReferenceData>>;
    }
  | {
      kind: "leads";
      leads: LeadListItem[];
      refs: Awaited<ReturnType<typeof getCrmReferenceData>>;
    };

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const value = (key: string) => (typeof params[key] === "string" ? params[key] : undefined);
  const requestedView = value("view");
  if (requestedView === "follow-ups") redirect("/admin/follow-ups");
  if (requestedView === "site-visits") {
    const next = new URLSearchParams();
    for (const key of ["q", "status", "bucket", "followUp", "assigned"] as const) {
      const current = value(key);
      if (current) next.set(key, current);
    }
    redirect(`/admin/site-visits${next.size ? `?${next.toString()}` : ""}`);
  }
  if (requestedView === "stages") redirect("/admin/leads/pipeline");
  const unmatchedBuyersOnly = requestedView === "unmatched_buyers" || value("unmatched") === "true";
  const view: LeadView = ["follow-ups", "site-visits", "stages"].includes(requestedView ?? "")
    ? (requestedView as LeadView)
    : "all";

  let data: LeadPageData | null = null;
  let loadError = false;
  try {
    if (view === "follow-ups") {
      const rows = await measureAdminPerf("/admin/leads/follow-ups", () => listFollowUps());
      data = { kind: "follow-ups", rows };
    } else if (view === "site-visits") {
      const [visits, refs] = await measureAdminPerf("/admin/leads/site-visits", () =>
        Promise.all([
          listSiteVisits({
            query: value("q"),
            status: value("status"),
            bucket: value("bucket"),
            followUp: value("followUp"),
            assignedTo: value("assigned"),
          }),
          getSiteVisitReferenceData(),
        ]),
      );
      data = { kind: "site-visits", visits, refs };
    } else {
      const [rawLeads, refs] = await measureAdminPerf("/admin/leads", () =>
        Promise.all([
          listLeads({
            query: value("q"),
            status: value("status"),
            category: value("category"),
            transaction: value("transaction"),
            source: value("source"),
            inquiryType: value("type") === "SELLER_LEAD" ? "SELLER_LEAD" : undefined,
            districtId: value("district"),
            followUp: value("followUp"),
            assignedTo: value("assigned"),
          }),
          getCrmReferenceData(),
        ]),
      );
      let leads =
        value("type") === "BUYER_LEAD"
          ? rawLeads.filter((lead) => lead.inquiryType !== "SELLER_LEAD")
          : rawLeads;
      if (unmatchedBuyersOnly) {
        leads = leads.filter((lead) => lead.inquiryType !== "SELLER_LEAD" && lead.matchCount === 0);
      }
      data = { kind: "leads", leads, refs };
    }
  } catch (error) {
    console.error("admin_leads_load_failed", error);
    loadError = true;
  }

  const content =
    data?.kind === "follow-ups" ? (
      <FollowUpView rows={data.rows} />
    ) : data?.kind === "site-visits" ? (
      <SiteVisitQueue
        visits={data.visits}
        admins={data.refs.admins}
        filters={{
          q: value("q"),
          status: value("status"),
          bucket: value("bucket"),
          followUp: value("followUp"),
          assigned: value("assigned"),
        }}
        unified
      />
    ) : data?.kind === "leads" ? (
      view === "stages" ? (
        <StageView leads={data.leads} />
      ) : (
        <LeadList leads={data.leads} refs={data.refs} params={params} />
      )
    ) : null;

  return (
    <section className="mx-auto max-w-[1400px]">
      <AdminPageHeader
        eyebrow="CRM"
        title="Leads"
        description="Scan customers quickly, see the next action, and open the full CRM workspace."
        actions={
          <Link href="/admin/leads/new" className="button button-primary">
            + New lead
          </Link>
        }
      />
      <WorkspaceTabs
        label="CRM workspaces"
        active="leads"
        tabs={[
          { key: "leads", label: "Leads", href: "/admin/leads" },
          { key: "pipeline", label: "Pipeline", href: "/admin/leads/pipeline" },
          { key: "follow-ups", label: "Follow-ups", href: "/admin/follow-ups" },
          { key: "site-visits", label: "Site visits", href: "/admin/site-visits" },
        ]}
      />
      {value("deleted") === "1" ? (
        <div
          role="status"
          className="mt-6 flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Lead deleted successfully.</span>
          </div>
          <Link
            href="/admin/leads"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </Link>
        </div>
      ) : null}
      {loadError ? (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
        >
          <p className="font-bold">Some information could not be loaded</p>
          <p className="mt-1">
            Refresh the page or contact technical support if the problem continues.
          </p>
        </div>
      ) : (
        content
      )}
    </section>
  );
}

function LeadList({
  leads,
  refs,
  params,
}: Readonly<{
  leads: readonly LeadListItem[];
  refs: Awaited<ReturnType<typeof getCrmReferenceData>>;
  params: Params;
}>) {
  const val = (key: string) => (typeof params[key] === "string" ? params[key] : undefined);
  return (
    <>
      <form
        className="mt-5 rounded-xl border border-slate-200 bg-white p-4"
        aria-label="Lead filters"
      >
        <div className="grid gap-3 md:grid-cols-[minmax(15rem,1.8fr)_repeat(3,minmax(9rem,1fr))_auto]">
          <label className="text-sm font-semibold text-slate-700">
            Search
            <input
              name="q"
              defaultValue={val("q")}
              placeholder="Name, phone or email"
              className="admin-control"
            />
          </label>
          <Filter
            label="Lead type"
            name="type"
            value={val("type")}
            options={[
              ["", "Buyers & sellers"],
              ["BUYER_LEAD", "Buyers"],
              ["SELLER_LEAD", "Sellers"],
            ]}
          />
          <Filter
            label="Stage"
            name="status"
            value={val("status")}
            options={[
              ["", "All stages"],
              ...LEAD_STATUSES.map(
                (status) => [status, leadStatusLabel(status)] as [string, string],
              ),
            ]}
          />
          <Filter
            label="Next action"
            name="followUp"
            value={val("followUp")}
            options={[
              ["", "Any follow-up"],
              ["overdue", "Overdue"],
              ["today", "Due today"],
              ["upcoming", "Next 7 days"],
              ["none", "Not scheduled"],
            ]}
          />
          <button className="button button-primary self-end">Apply</button>
        </div>
        <details className="mt-3 border-t border-slate-100 pt-3">
          <summary className="cursor-pointer text-sm font-bold text-emerald-800">
            More filters
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Filter
              label="Land type"
              name="category"
              value={val("category")}
              options={[
                ["", "All land types"],
                ["AGRICULTURAL", "Agricultural"],
                ["NA", "NA land"],
                ["INDUSTRIAL", "Industrial"],
              ]}
            />
            <Filter
              label="Transaction"
              name="transaction"
              value={val("transaction")}
              options={[
                ["", "Any transaction"],
                ["BUY", "Buy"],
                ["RENT", "Rent"],
                ["LEASE", "Lease"],
              ]}
            />
            <Filter
              label="District"
              name="district"
              value={val("district")}
              options={[
                ["", "All districts"],
                ...refs.districts.map((item) => [item.id, item.name] as [string, string]),
              ]}
            />
            <Filter
              label="Assigned to"
              name="assigned"
              value={val("assigned")}
              options={[
                ["", "Anyone"],
                ...refs.admins.map((item) => [item.user_id, item.display_name] as [string, string]),
              ]}
            />
          </div>
        </details>
      </form>
      {leads.length ? (
        <LeadTable leads={leads} />
      ) : (
        <div className="mt-5">
          <EmptyState
            title="No leads found"
            description="Adjust the filters or add the first lead to start the CRM workflow."
            action={{ href: "/admin/leads/new", label: "Add lead" }}
          />
        </div>
      )}
    </>
  );
}

function LeadTable({ leads }: Readonly<{ leads: readonly LeadListItem[] }>) {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="hidden overflow-x-auto md:block">
        <table className="admin-table min-w-[1120px]">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Requirement</th>
              <th>Location</th>
              <th>Budget</th>
              <th>Stage</th>
              <th>Next follow-up</th>
              <th>Last activity</th>
              <th>Matches</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-slate-100 md:hidden">
        {leads.map((lead) => (
          <LeadMobileCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}

function LeadRow({ lead }: Readonly<{ lead: LeadListItem }>) {
  const seller = lead.inquiryType === "SELLER_LEAD";
  return (
    <tr>
      <td>
        <Link
          href={`/admin/leads/${lead.id}`}
          className="font-bold text-slate-950 hover:text-emerald-800"
        >
          {lead.name}
        </Link>
        <span className="mt-0.5 block text-xs text-slate-500">
          {lead.phone ?? lead.email ?? lead.leadReference}
        </span>
        <span className="mt-1 block text-[10px] font-bold text-slate-400">
          {seller ? "SELLER" : "BUYER"} · {lead.leadReference}
        </span>
      </td>
      <td>
        <span className="font-semibold text-slate-800">
          {[friendly(lead.transaction), friendly(lead.category)].filter(Boolean).join(" · ") ||
            "General enquiry"}
        </span>
      </td>
      <td>{[lead.localityText, lead.districtName].filter(Boolean).join(", ") || "Not set"}</td>
      <td>{formatBudget(lead.budgetMin, lead.budgetMax)}</td>
      <td>
        <StatusBadge
          tone={
            lead.status.startsWith("CLOSED")
              ? "neutral"
              : lead.status === "NEGOTIATION"
                ? "warning"
                : "info"
          }
        >
          {leadStatusLabel(lead.status)}
        </StatusBadge>
      </td>
      <td className={lead.nextFollowUpAt ? "font-semibold text-slate-900" : "text-amber-700"}>
        {lead.nextFollowUpAt ? formatIndiaDateTime(lead.nextFollowUpAt) : "Not scheduled"}
      </td>
      <td>{lead.lastContactedAt ? formatIndiaDateTime(lead.lastContactedAt) : "No activity"}</td>
      <td>{lead.matchCount}</td>
      <td>
        <div className="flex items-center justify-end gap-2">
          {lead.phone ? (
            <a href={`tel:${lead.phone}`} className="text-xs font-bold text-slate-600">
              Call
            </a>
          ) : null}
          <Link
            href={`/admin/leads/${lead.id}`}
            className="button button-primary px-3 py-1.5 text-xs"
          >
            Open
          </Link>
          <details className="relative">
            <summary
              className="cursor-pointer list-none px-2 py-1 font-bold text-slate-500"
              aria-label={`More actions for ${lead.name}`}
            >
              •••
            </summary>
            <div className="absolute right-0 z-10 mt-1 min-w-44 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
              <DeleteLeadButton leadId={lead.id} leadName={lead.name} action={deleteLeadAction} />
            </div>
          </details>
        </div>
      </td>
    </tr>
  );
}

function LeadMobileCard({ lead }: Readonly<{ lead: LeadListItem }>) {
  return (
    <article className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-slate-400">
            {lead.inquiryType === "SELLER_LEAD" ? "SELLER" : "BUYER"} · {lead.leadReference}
          </span>
          <Link href={`/admin/leads/${lead.id}`} className="mt-1 block font-bold text-slate-950">
            {lead.name}
          </Link>
          <a
            href={lead.phone ? `tel:${lead.phone}` : undefined}
            className="mt-0.5 block text-sm text-slate-600"
          >
            {lead.phone ?? lead.email ?? "No contact details"}
          </a>
        </div>
        <StatusBadge tone="info">{leadStatusLabel(lead.status)}</StatusBadge>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-800">
        {[friendly(lead.transaction), friendly(lead.category), lead.localityText]
          .filter(Boolean)
          .join(" · ") || "Requirement not captured"}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-xs">
        <div>
          <span className="block text-slate-500">Next action</span>
          <strong className="mt-0.5 block">
            {lead.nextFollowUpAt ? formatIndiaDateTime(lead.nextFollowUpAt) : "Not scheduled"}
          </strong>
        </div>
        <div>
          <span className="block text-slate-500">Property matches</span>
          <strong className="mt-0.5 block">{lead.matchCount}</strong>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {lead.phone ? (
          <a className="button button-secondary flex-1" href={`tel:${lead.phone}`}>
            Call
          </a>
        ) : null}
        {lead.phone ? (
          <a
            className="button button-whatsapp flex-1"
            href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
          >
            <WhatsAppIcon className="size-4" /> WhatsApp
          </a>
        ) : null}
        <Link className="button button-primary flex-1" href={`/admin/leads/${lead.id}`}>
          Open
        </Link>
      </div>
    </article>
  );
}

function FollowUpView({ rows }: Readonly<{ rows: Awaited<ReturnType<typeof listFollowUps>> }>) {
  const buckets = ["OVERDUE", "TODAY", "UPCOMING", "COMPLETED"] as const;
  return (
    <div className="mt-6 grid gap-5 xl:grid-cols-2">
      {buckets.map((bucket) => {
        const items = rows.filter(
          (row) => classifyFollowUp(row.due_at, row.completed_at) === bucket,
        );
        return (
          <section key={bucket} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{friendly(bucket)}</h2>
              <span className="text-sm font-semibold text-slate-400">{items.length}</span>
            </div>
            <div className="mt-3 space-y-3">
              {items.map((item) => (
                <article key={item.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <Link
                      href={`/admin/leads/${item.lead_id}`}
                      className="font-bold text-slate-950 hover:text-emerald-800"
                    >
                      {item.leadName}
                    </Link>
                    <time className="text-sm font-semibold text-slate-600">
                      {formatIndiaDateTime(item.due_at)}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {friendly(item.follow_up_type)}
                    {item.context ? ` · ${item.context}` : ""}
                  </p>
                  {item.note ? <p className="mt-2 text-sm text-slate-700">{item.note}</p> : null}
                  {!item.completed_at ? (
                    <form
                      action={completeFollowUpAction.bind(null, item.lead_id)}
                      className="mt-3 flex flex-wrap gap-2"
                    >
                      <input type="hidden" name="followUpId" value={item.id} />
                      <input
                        name="outcome"
                        aria-label={`Outcome for ${item.leadName}`}
                        placeholder="Add outcome (optional)"
                        className="admin-control mt-0 min-w-48 flex-1"
                      />
                      <button className="button button-primary">Complete</button>
                    </form>
                  ) : (
                    <p className="mt-2 text-sm font-semibold text-emerald-700">
                      Completed{item.outcome ? ` · ${item.outcome}` : ""}
                    </p>
                  )}
                </article>
              ))}
              {!items.length ? (
                <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No follow-ups here.
                </p>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function StageView({ leads }: Readonly<{ leads: readonly LeadListItem[] }>) {
  return (
    <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
      {LEAD_STATUSES.map((status) => {
        const items = leads.filter((lead) => lead.status === status);
        return (
          <section
            key={status}
            aria-label={`${leadStatusLabel(status)} ${items.length}`}
            className="w-72 shrink-0 rounded-xl border border-slate-200 bg-slate-100/70 p-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">{leadStatusLabel(status)}</h2>
              <span className="text-xs font-bold text-slate-500">{items.length}</span>
            </div>
            <div className="mt-3 space-y-2">
              {items.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/admin/leads/${lead.id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-3 hover:border-emerald-500"
                >
                  <strong className="block text-sm">{lead.name}</strong>
                  <span className="mt-1 block text-xs text-slate-500">{lead.leadReference}</span>
                  {lead.nextFollowUpAt ? (
                    <span className="mt-2 block text-xs font-semibold text-slate-700">
                      Next: {formatIndiaDateTime(lead.nextFollowUpAt)}
                    </span>
                  ) : null}
                </Link>
              ))}
              {!items.length ? (
                <p className="rounded-lg border border-dashed border-slate-300 p-3 text-center text-xs text-slate-500">
                  No leads
                </p>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Filter({
  label,
  name,
  value,
  options,
}: Readonly<{
  label: string;
  name: string;
  value?: string;
  options: readonly (readonly [string, string])[];
}>) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      {label}
      <select className="admin-control" name={name} defaultValue={value ?? ""}>
        {options.map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
function formatBudget(min: number | null, max: number | null) {
  if (min === null && max === null) return "Not set";
  const compact = (value: number) =>
    value >= 10_000_000
      ? `₹${(value / 10_000_000).toFixed(1)} Cr`
      : value >= 100_000
        ? `₹${(value / 100_000).toFixed(1)} L`
        : `₹${new Intl.NumberFormat("en-IN").format(value)}`;
  return min !== null && max !== null
    ? `${compact(min)}–${compact(max)}`
    : min !== null
      ? `From ${compact(min)}`
      : `Up to ${compact(max as number)}`;
}
function friendly(value: string | null | undefined) {
  return value
    ? value
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/^./, (letter) => letter.toUpperCase())
    : "";
}
