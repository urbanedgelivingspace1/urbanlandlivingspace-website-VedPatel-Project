import type { Metadata } from "next";
import Link from "next/link";

import {
  AdminPageHeader,
  AdminSection,
  EmptyState,
  MetricCard,
  StatusBadge,
} from "@/components/admin/admin-ui";
import { LEAD_STATUSES } from "@/features/crm/domain/contracts";
import { classifyFollowUp, formatIndiaDateTime } from "@/features/crm/domain/follow-ups";
import { leadStatusLabel } from "@/features/crm/domain/pipeline";
import { siteVisitStatusLabel } from "@/features/site-visits/domain/workflow";
import { measureAdminPerf } from "@/server/admin-perf";
import {
  getDashboardFollowUpMetrics,
  getDashboardLeadMetrics,
  getDashboardLeadStageMetrics,
  listFollowUps,
  listLeads,
} from "@/server/services/crm";
import { getDashboardOwnerSubmissionMetrics } from "@/server/services/owner-submissions";
import { getDashboardInventoryMetrics } from "@/server/services/property-drafts";
import { getDashboardSiteVisitMetrics, listSiteVisits } from "@/server/services/site-visits";

export const metadata: Metadata = { title: "Action centre" };

export default async function AdminDashboardPage() {
  const results = await measureAdminPerf("/admin/dashboard", () =>
    Promise.allSettled([
      getDashboardLeadMetrics(),
      getDashboardLeadStageMetrics(),
      getDashboardFollowUpMetrics(),
      getDashboardSiteVisitMetrics(),
      getDashboardInventoryMetrics(),
      getDashboardOwnerSubmissionMetrics(),
      listFollowUps(),
      listSiteVisits(),
      listLeads(),
    ]),
  );
  const [
    leadsResult,
    stagesResult,
    followUpsResult,
    visitsResult,
    propertiesResult,
    sellersResult,
    followUpListResult,
    visitListResult,
    recentLeadsResult,
  ] = results;
  const hasServiceDegradation = results.some((result) => result.status === "rejected");
  if (hasServiceDegradation) {
    console.error(
      "admin_dashboard_partial_failure",
      results.map((result) => result.status),
    );
  }

  const leadMetrics = leadsResult.status === "fulfilled" ? leadsResult.value : null;
  const stageMetrics = stagesResult.status === "fulfilled" ? stagesResult.value : null;
  const followUpMetrics = followUpsResult.status === "fulfilled" ? followUpsResult.value : null;
  const visitMetrics = visitsResult.status === "fulfilled" ? visitsResult.value : null;
  const propertyMetrics = propertiesResult.status === "fulfilled" ? propertiesResult.value : null;
  const sellerMetrics = sellersResult.status === "fulfilled" ? sellersResult.value : null;
  const followUps = followUpListResult.status === "fulfilled" ? followUpListResult.value : [];
  const visits = visitListResult.status === "fulfilled" ? visitListResult.value : [];
  const recentLeads =
    recentLeadsResult.status === "fulfilled" ? recentLeadsResult.value.slice(0, 6) : [];
  const urgentFollowUps = followUps
    .filter((item) =>
      ["OVERDUE", "TODAY"].includes(classifyFollowUp(item.due_at, item.completed_at)),
    )
    .slice(0, 6);
  const todayVisits = visits.filter((item) => item.bucket === "TODAY").slice(0, 6);
  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  return (
    <section className="mx-auto max-w-[1500px]">
      <AdminPageHeader
        eyebrow="UrbanEdge admin"
        title="Action centre"
        description={`${today} · Start with the queues that need attention, then move the business forward.`}
        actions={
          <>
            <Link href="/admin/leads/new" className="button button-secondary">
              + New lead
            </Link>
            <Link href="/admin/properties/new" className="button button-primary">
              + New property
            </Link>
          </>
        }
      />
      {hasServiceDegradation ? (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
        >
          <p className="font-bold">Some information could not be loaded</p>
          <p className="mt-1">
            The available queues are still usable. Refresh before making a time-sensitive decision.
          </p>
        </div>
      ) : null}

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-950">Priority work</h2>
          <span className="text-xs text-slate-500">Live operational queues</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            label="New leads"
            value={leadMetrics?.newLeadsCount ?? 0}
            href="/admin/leads?status=NEW"
            tone="blue"
          />
          <MetricCard
            label="Overdue"
            value={followUpMetrics?.overdueCount ?? 0}
            href="/admin/follow-ups?bucket=OVERDUE"
            tone="red"
            detail="Follow up now"
          />
          <MetricCard
            label="Due today"
            value={followUpMetrics?.todayCount ?? 0}
            href="/admin/follow-ups?bucket=TODAY"
            tone="amber"
            detail="Today’s calls"
          />
          <MetricCard
            label="Visits today"
            value={visitMetrics?.visitsTodayCount ?? 0}
            href="/admin/site-visits?bucket=TODAY"
            tone="green"
          />
          <MetricCard
            label="Visits to confirm"
            value={visitMetrics?.requestedCount ?? 0}
            href="/admin/site-visits?status=REQUESTED"
            tone="violet"
          />
          <MetricCard
            label="Seller enquiries"
            value={sellerMetrics?.newSubmissionsCount ?? 0}
            href="/admin/submissions?status=NEW"
            tone="slate"
            detail="Review new supply"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <AdminSection
          title="Follow-ups needing attention"
          description="Overdue and due today, ordered by due time."
          action={
            <Link href="/admin/follow-ups" className="text-xs font-bold text-emerald-800">
              Open task queue →
            </Link>
          }
        >
          {urgentFollowUps.length ? (
            <ul className="divide-y divide-slate-100 px-4">
              {urgentFollowUps.map((item) => {
                const bucket = classifyFollowUp(item.due_at, item.completed_at);
                return (
                  <li
                    key={item.id}
                    className="grid gap-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/leads/${item.lead_id}`}
                        className="text-sm font-bold text-slate-950 hover:text-emerald-800"
                      >
                        {item.leadName}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {friendly(item.follow_up_type)}
                        {item.context ? ` · ${item.context}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:justify-end">
                      <StatusBadge tone={bucket === "OVERDUE" ? "danger" : "warning"}>
                        {bucket === "OVERDUE" ? "Overdue" : "Today"}
                      </StatusBadge>
                      <time className="text-xs font-semibold text-slate-600">
                        {formatIndiaDateTime(item.due_at)}
                      </time>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-4">
              <EmptyState
                compact
                title="You’re caught up"
                description="No follow-ups are overdue or due today."
              />
            </div>
          )}
        </AdminSection>

        <AdminSection
          title="Today’s site visits"
          description="Appointments and visit requests in India business time."
          action={
            <Link
              href="/admin/site-visits?bucket=TODAY"
              className="text-xs font-bold text-emerald-800"
            >
              Open visit queue →
            </Link>
          }
        >
          {todayVisits.length ? (
            <ul className="divide-y divide-slate-100 px-4">
              {todayVisits.map((visit) => (
                <li
                  key={visit.id}
                  className="grid gap-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/admin/site-visits/${visit.id}`}
                      className="text-sm font-bold text-slate-950 hover:text-emerald-800"
                    >
                      {visit.leadName}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {visit.propertyCode} · {visit.propertyTitle ?? "Untitled property"}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <StatusBadge tone="success">{siteVisitStatusLabel(visit.status)}</StatusBadge>
                    <time className="mt-1 block text-xs text-slate-500">
                      {visit.effectiveStartAt
                        ? formatIndiaDateTime(visit.effectiveStartAt)
                        : "Time not set"}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4">
              <EmptyState
                compact
                title="No visits today"
                description="Use the visit queue to confirm upcoming appointments."
                action={{ href: "/admin/site-visits", label: "Open visits" }}
              />
            </div>
          )}
        </AdminSection>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <AdminSection
          title="CRM pipeline"
          description="Click a stage to open the corresponding lead queue."
        >
          <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-3 lg:grid-cols-4">
            {LEAD_STATUSES.map((status) => (
              <Link
                key={status}
                href={`/admin/leads?status=${status}`}
                className="bg-white px-4 py-3 hover:bg-emerald-50/60"
              >
                <span className="block text-[11px] font-semibold text-slate-500">
                  {leadStatusLabel(status)}
                </span>
                <strong className="mt-1 block text-xl text-slate-950">
                  {stageMetrics?.[status] ??
                    (status === "NEW" ? (leadMetrics?.newLeadsCount ?? 0) : 0)}
                </strong>
              </Link>
            ))}
          </div>
        </AdminSection>

        <AdminSection title="Inventory snapshot" description="Publication and market availability.">
          <div className="grid grid-cols-3 divide-x divide-slate-100 px-2 py-5 text-center">
            <InventoryLink
              label="Draft"
              value={propertyMetrics?.draftCount ?? 0}
              href="/admin/properties?publication=DRAFT"
            />
            <InventoryLink
              label="Published"
              value={propertyMetrics?.publishedCount ?? 0}
              href="/admin/properties?publication=PUBLISHED"
            />
            <InventoryLink
              label="Off market"
              value={propertyMetrics?.offMarketCount ?? 0}
              href="/admin/properties?availability=OFF_MARKET"
            />
          </div>
          <div className="border-t border-slate-100 p-3">
            <Link
              href="/admin/verification/queue"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <span>Review verification queue</span>
              <span>→</span>
            </Link>
            <Link
              href="/admin/media"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <span>Review media library</span>
              <span>→</span>
            </Link>
          </div>
        </AdminSection>
      </div>

      <AdminSection
        title="Recently updated leads"
        description="The latest customer records touched across the CRM."
        className="mt-6"
      >
        {recentLeads.length ? (
          <div className="overflow-x-auto">
            <table className="admin-table min-w-[760px]">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Stage</th>
                  <th>Requirement</th>
                  <th>Next action</th>
                  <th>
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="font-bold text-slate-950 hover:text-emerald-800"
                      >
                        {lead.name}
                      </Link>
                      <span className="block text-xs text-slate-500">
                        {lead.phone ?? lead.leadReference}
                      </span>
                    </td>
                    <td>{lead.inquiryType === "SELLER_LEAD" ? "Seller" : "Buyer"}</td>
                    <td>
                      <StatusBadge tone="info">{leadStatusLabel(lead.status)}</StatusBadge>
                    </td>
                    <td>
                      {[friendly(lead.transaction), friendly(lead.category), lead.localityText]
                        .filter(Boolean)
                        .join(" · ") || "Not captured"}
                    </td>
                    <td>
                      {lead.nextFollowUpAt
                        ? formatIndiaDateTime(lead.nextFollowUpAt)
                        : "Not scheduled"}
                    </td>
                    <td>
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="text-xs font-bold text-emerald-800"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            <EmptyState
              compact
              title="No recent lead activity"
              description="New and updated leads will appear here."
            />
          </div>
        )}
      </AdminSection>
    </section>
  );
}

function InventoryLink({
  label,
  value,
  href,
}: Readonly<{ label: string; value: number; href: string }>) {
  return (
    <Link href={href} className="px-2">
      <strong className="block text-xl text-slate-950">{value}</strong>
      <span className="mt-1 block text-[11px] font-semibold text-slate-500">{label}</span>
    </Link>
  );
}

function friendly(value: string | null | undefined) {
  return value
    ? value
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/^./, (letter) => letter.toUpperCase())
    : "";
}
