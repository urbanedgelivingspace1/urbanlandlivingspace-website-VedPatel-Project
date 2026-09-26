import type { Metadata } from "next";
import Link from "next/link";

import { classifyFollowUp, formatIndiaDateTime } from "@/features/crm/domain/follow-ups";
import { siteVisitStatusLabel } from "@/features/site-visits/domain/workflow";
import { measureAdminPerf } from "@/server/admin-perf";
import {
  getDashboardFollowUpMetrics,
  getDashboardLeadMetrics,
  listFollowUps,
} from "@/server/services/crm";
import { getDashboardPropertyMetrics } from "@/server/services/property-drafts";
import { getDashboardSiteVisitMetrics, listSiteVisits } from "@/server/services/site-visits";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const results = await measureAdminPerf("/admin/dashboard", () =>
    Promise.allSettled([
      getDashboardLeadMetrics(),
      getDashboardFollowUpMetrics(),
      getDashboardSiteVisitMetrics(),
      getDashboardPropertyMetrics(),
      listFollowUps(),
      listSiteVisits(),
    ]),
  );
  const [
    leadsResult,
    followUpsResult,
    visitsResult,
    propertiesResult,
    followUpListResult,
    visitListResult,
  ] = results;
  const hasServiceDegradation = results.some((result) => result.status === "rejected");
  if (hasServiceDegradation)
    console.error(
      "admin_dashboard_partial_failure",
      results.map((result) => result.status),
    );

  const leadMetrics = leadsResult.status === "fulfilled" ? leadsResult.value : null;
  const followUpMetrics = followUpsResult.status === "fulfilled" ? followUpsResult.value : null;
  const visitMetrics = visitsResult.status === "fulfilled" ? visitsResult.value : null;
  const propertyMetrics = propertiesResult.status === "fulfilled" ? propertiesResult.value : null;
  const followUps =
    followUpListResult.status === "fulfilled" ? (followUpListResult.value ?? []) : [];
  const visits = visitListResult.status === "fulfilled" ? (visitListResult.value ?? []) : [];
  const urgentFollowUps = followUps
    .filter((item) =>
      ["OVERDUE", "TODAY"].includes(classifyFollowUp(item.due_at, item.completed_at)),
    )
    .slice(0, 5);
  const todayVisits = visits.filter((item) => item.bucket === "TODAY").slice(0, 5);
  const cards = [
    {
      label: "New leads",
      value: leadMetrics?.newLeadsCount ?? 0,
      href: "/admin/leads?status=NEW",
      tone: "blue",
    },
    {
      label: "Overdue follow-ups",
      value: followUpMetrics?.overdueCount ?? 0,
      href: "/admin/leads?view=follow-ups",
      tone: "red",
    },
    {
      label: "Follow-ups today",
      value: followUpMetrics?.todayCount ?? 0,
      href: "/admin/leads?view=follow-ups",
      tone: "amber",
    },
    {
      label: "Visits today",
      value: visitMetrics?.visitsTodayCount ?? 0,
      href: "/admin/leads?view=site-visits&bucket=TODAY",
      tone: "green",
    },
    {
      label: "Visits to schedule",
      value: visitMetrics?.requestedCount ?? 0,
      href: "/admin/leads?view=site-visits&status=REQUESTED",
      tone: "violet",
    },
    {
      label: "Draft properties",
      value: propertyMetrics?.draftCount ?? 0,
      href: "/admin/properties?publication=DRAFT",
      tone: "slate",
    },
  ] as const;

  return (
    <section className="mx-auto max-w-[1380px]" aria-labelledby="dashboard-heading">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-800">Today’s priorities</p>
          <h1
            id="dashboard-heading"
            className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
          >
            Dashboard
          </h1>
          <p className="mt-2 text-base text-slate-600">
            See what needs attention and move the day forward.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/leads/new" className="button button-secondary">
            + Add Lead
          </Link>
          <Link href="/admin/properties/new" className="button button-primary">
            + Add Property
          </Link>
        </div>
      </header>

      {hasServiceDegradation ? (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
        >
          <p className="font-bold">Some information could not be loaded</p>
          <p className="mt-1">
            Refresh the page or contact technical support if the problem continues.
          </p>
        </div>
      ) : null}

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            prefetch={false}
            className={`admin-metric admin-metric-${card.tone}`}
          >
            <span className="text-sm font-semibold text-slate-600">{card.label}</span>
            <strong className="mt-3 block text-3xl font-bold tracking-tight text-slate-950">
              {card.value}
            </strong>
            <span className="mt-2 block text-xs font-semibold text-slate-500">View details →</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <WorkPanel
          title="Follow-ups needing attention"
          count={urgentFollowUps.length}
          href="/admin/leads?view=follow-ups"
        >
          {urgentFollowUps.length ? (
            <ul className="divide-y divide-slate-100">
              {urgentFollowUps.map((item) => {
                const bucket = classifyFollowUp(item.due_at, item.completed_at);
                return (
                  <li key={item.id} className="flex items-center justify-between gap-4 py-3.5">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/leads/${item.lead_id}`}
                        className="font-bold text-slate-900 hover:text-emerald-800"
                      >
                        {item.leadName}
                      </Link>
                      <p className="mt-0.5 truncate text-sm text-slate-600">
                        {humanize(item.follow_up_type)}
                        {item.context ? ` · ${item.context}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className={
                          bucket === "OVERDUE"
                            ? "admin-badge admin-badge-red"
                            : "admin-badge admin-badge-amber"
                        }
                      >
                        {bucket === "OVERDUE" ? "Overdue" : "Today"}
                      </span>
                      <time className="mt-1 block text-xs text-slate-500">
                        {formatIndiaDateTime(item.due_at)}
                      </time>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyLine>Nothing overdue or due today.</EmptyLine>
          )}
        </WorkPanel>

        <WorkPanel
          title="Today’s site visits"
          count={todayVisits.length}
          href="/admin/leads?view=site-visits&bucket=TODAY"
        >
          {todayVisits.length ? (
            <ul className="divide-y divide-slate-100">
              {todayVisits.map((visit) => (
                <li key={visit.id} className="flex items-center justify-between gap-4 py-3.5">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/site-visits/${visit.id}`}
                      className="font-bold text-slate-900 hover:text-emerald-800"
                    >
                      {visit.leadName}
                    </Link>
                    <p className="mt-0.5 truncate text-sm text-slate-600">
                      {visit.propertyCode} · {visit.propertyTitle ?? "Untitled property"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="admin-badge admin-badge-green">
                      {siteVisitStatusLabel(visit.status)}
                    </span>
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
            <EmptyLine>No site visits scheduled for today.</EmptyLine>
          )}
        </WorkPanel>
      </div>
    </section>
  );
}

function WorkPanel({
  title,
  count,
  href,
  children,
}: Readonly<{ title: string; count: number; href: string; children: React.ReactNode }>) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.03)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-950">
          {title} <span className="ml-1 text-sm font-semibold text-slate-400">{count}</span>
        </h2>
        <Link
          href={href}
          prefetch={false}
          className="text-sm font-bold text-emerald-800 hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function EmptyLine({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
      {children}
    </p>
  );
}

function humanize(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}
