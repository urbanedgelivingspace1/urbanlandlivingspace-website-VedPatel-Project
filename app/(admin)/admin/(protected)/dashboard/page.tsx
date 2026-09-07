import type { Metadata } from "next";
import Link from "next/link";
import { measureAdminPerf } from "@/server/admin-perf";
import { getDashboardFollowUpMetrics, getDashboardLeadMetrics } from "@/server/services/crm";
import { getDashboardSiteVisitMetrics } from "@/server/services/site-visits";
import { getDashboardOwnerSubmissionMetrics } from "@/server/services/owner-submissions";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [leadsResult, followUpsResult, visitsResult, ownerSubmissionsResult] =
    await measureAdminPerf("/admin/dashboard", () =>
      Promise.allSettled([
        getDashboardLeadMetrics(),
        getDashboardFollowUpMetrics(),
        getDashboardSiteVisitMetrics(),
        getDashboardOwnerSubmissionMetrics(),
      ]),
    );

  const hasServiceDegradation =
    leadsResult.status === "rejected" ||
    followUpsResult.status === "rejected" ||
    visitsResult.status === "rejected" ||
    ownerSubmissionsResult.status === "rejected";

  if (hasServiceDegradation) {
    console.error("admin_dashboard_metrics_partial_failure", {
      leads: leadsResult.status === "rejected" ? leadsResult.reason?.message : "ok",
      followUps: followUpsResult.status === "rejected" ? followUpsResult.reason?.message : "ok",
      visits: visitsResult.status === "rejected" ? visitsResult.reason?.message : "ok",
      ownerSubmissions:
        ownerSubmissionsResult.status === "rejected"
          ? ownerSubmissionsResult.reason?.message
          : "ok",
    });
  }

  const leadMetrics = leadsResult.status === "fulfilled" ? leadsResult.value : null;
  const followUpMetrics = followUpsResult.status === "fulfilled" ? followUpsResult.value : null;
  const visitMetrics = visitsResult.status === "fulfilled" ? visitsResult.value : null;
  const submissionMetrics =
    ownerSubmissionsResult.status === "fulfilled" ? ownerSubmissionsResult.value : null;

  const cards = [
    {
      label: "New owner submissions",
      value: submissionMetrics?.newSubmissionsCount ?? 0,
      href: "/admin/submissions?status=NEW",
    },
    {
      label: "New leads",
      value: leadMetrics?.newLeadsCount ?? 0,
      href: "/admin/leads?status=NEW",
    },
    {
      label: "Overdue follow-ups",
      value: followUpMetrics?.overdueCount ?? 0,
      href: "/admin/follow-ups",
    },
    {
      label: "Due today",
      value: followUpMetrics?.todayCount ?? 0,
      href: "/admin/follow-ups",
    },
    {
      label: "New visit requests",
      value: visitMetrics?.requestedCount ?? 0,
      href: "/admin/site-visits?status=REQUESTED",
    },
    {
      label: "Visits today",
      value: visitMetrics?.visitsTodayCount ?? 0,
      href: "/admin/site-visits?bucket=TODAY",
    },
    {
      label: "Visit follow-ups",
      value: visitMetrics?.visitFollowUpsCount ?? 0,
      href: "/admin/site-visits?followUp=required",
    },
  ];

  return (
    <section aria-labelledby="dashboard-heading">
      <p className="text-xs font-bold tracking-[0.16em] text-[var(--brand-navy)] uppercase">
        Operational workspace
      </p>
      <h1 id="dashboard-heading" className="font-display mt-2 text-4xl font-semibold">
        Dashboard
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate-600">
        What needs attention today across the private brokerage pipeline.
      </p>

      {hasServiceDegradation && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl" aria-hidden="true">
              ⚠️
            </span>
            <div>
              <h2 className="font-semibold text-amber-950">Database Service Notice</h2>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Could not retrieve some live pipeline metrics from Supabase. If you recently
                migrated or updated database credentials, verify that{" "}
                <code className="rounded bg-amber-200/60 px-1 py-0.5 font-mono text-xs font-bold text-amber-950">
                  SUPABASE_SERVICE_ROLE_KEY
                </code>{" "}
                is set to the correct service role key in your hosting provider environment
                variables.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            href={card.href}
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-[var(--brand-navy)]"
          >
            <h2 className="font-semibold">{card.label}</h2>
            <p className="font-display mt-2 text-4xl">{card.value}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
