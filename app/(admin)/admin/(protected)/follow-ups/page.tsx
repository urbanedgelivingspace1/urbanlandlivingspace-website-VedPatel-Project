import Link from "next/link";

import {
  AdminPageHeader,
  EmptyState,
  StatusBadge,
  WorkspaceTabs,
} from "@/components/admin/admin-ui";
import type { FollowUpBucket } from "@/features/crm/domain/contracts";
import { classifyFollowUp, formatIndiaDateTime } from "@/features/crm/domain/follow-ups";
import { leadStatusLabel } from "@/features/crm/domain/pipeline";
import { listFollowUps } from "@/server/services/crm";
import { completeFollowUpAction } from "../leads/actions";

const buckets: readonly FollowUpBucket[] = ["OVERDUE", "TODAY", "UPCOMING", "COMPLETED"];

export default async function FollowUpsPage({
  searchParams = Promise.resolve({}),
}: Readonly<{ searchParams?: Promise<{ bucket?: string }> }>) {
  const params = await searchParams;
  const active = buckets.includes(params.bucket as FollowUpBucket)
    ? (params.bucket as FollowUpBucket)
    : "TODAY";
  const rows = await listFollowUps();
  const counts = Object.fromEntries(
    buckets.map((bucket) => [
      bucket,
      rows.filter((row) => classifyFollowUp(row.due_at, row.completed_at) === bucket).length,
    ]),
  ) as Record<FollowUpBucket, number>;
  const visible = rows.filter((row) => classifyFollowUp(row.due_at, row.completed_at) === active);
  const overdue = counts.OVERDUE;

  return (
    <section className="mx-auto max-w-[1400px]">
      <AdminPageHeader
        eyebrow="CRM · Daily work"
        title="Follow-ups"
        description="Call, WhatsApp, finish, or move the conversations that keep each lead moving."
        actions={
          <Link href="/admin/leads" className="button button-secondary">
            Open leads
          </Link>
        }
        meta={
          overdue > 0 ? (
            <StatusBadge tone="danger">{overdue} overdue</StatusBadge>
          ) : (
            <StatusBadge tone="success">No overdue work</StatusBadge>
          )
        }
      />
      <WorkspaceTabs
        label="CRM workspaces"
        active="follow-ups"
        tabs={[
          { key: "leads", label: "Leads", href: "/admin/leads" },
          { key: "pipeline", label: "Pipeline", href: "/admin/leads/pipeline" },
          { key: "follow-ups", label: "Follow-ups", href: "/admin/follow-ups" },
          { key: "site-visits", label: "Site visits", href: "/admin/site-visits" },
        ]}
      />

      <nav aria-label="Follow-up queues" className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {buckets.map((bucket) => (
          <Link
            key={bucket}
            href={`/admin/follow-ups?bucket=${bucket}`}
            aria-current={active === bucket ? "page" : undefined}
            className="flex min-w-32 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 aria-[current=page]:border-emerald-700 aria-[current=page]:bg-emerald-50 aria-[current=page]:text-emerald-900"
          >
            <span>{bucketLabel(bucket)}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{counts[bucket]}</span>
          </Link>
        ))}
      </nav>

      {visible.length ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-100">
            {visible.map((item) => {
              const phone = item.leadPhone;
              return (
                <li
                  key={item.id}
                  className="grid gap-4 p-4 lg:grid-cols-[minmax(14rem,1fr)_minmax(12rem,.8fr)_minmax(15rem,1.2fr)_auto] lg:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/leads/${item.lead_id}`}
                        className="font-bold text-slate-950 hover:text-emerald-800"
                      >
                        {item.leadName}
                      </Link>
                      <StatusBadge tone="info">{leadStatusLabel(item.leadStatus)}</StatusBadge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.leadReference}
                      {phone ? ` · ${phone}` : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Due</p>
                    <time
                      className={`mt-1 block text-sm font-bold ${active === "OVERDUE" ? "text-red-700" : "text-slate-900"}`}
                    >
                      {formatIndiaDateTime(item.due_at)}
                    </time>
                    <p className="mt-0.5 text-xs text-slate-500">{friendly(item.follow_up_type)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-500">
                      Reason / previous context
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {item.context ?? item.note ?? "No context recorded"}
                    </p>
                    {item.completed_at ? (
                      <p className="mt-1 text-xs font-semibold text-emerald-700">
                        {item.outcome ? `Outcome: ${item.outcome}` : "Completed"}
                      </p>
                    ) : null}
                  </div>
                  {!item.completed_at ? (
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      {phone ? (
                        <a className="button button-secondary px-3 text-xs" href={`tel:${phone}`}>
                          Call
                        </a>
                      ) : null}
                      {phone ? (
                        <a
                          className="button button-secondary px-3 text-xs"
                          href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp
                        </a>
                      ) : null}
                      <details className="w-full lg:w-auto">
                        <summary className="button button-primary cursor-pointer list-none text-center text-xs">
                          Complete
                        </summary>
                        <form
                          action={completeFollowUpAction.bind(null, item.lead_id)}
                          className="mt-2 grid min-w-64 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 lg:absolute lg:right-8 lg:z-10 lg:shadow-lg"
                        >
                          <input type="hidden" name="followUpId" value={item.id} />
                          <label className="text-xs font-bold text-slate-700">
                            Outcome
                            <input
                              name="outcome"
                              aria-label={`Outcome for ${item.leadReference}`}
                              placeholder="What happened?"
                              className="admin-control"
                            />
                          </label>
                          <button className="button button-primary text-xs">Save completion</button>
                          <Link
                            href={`/admin/leads/${item.lead_id}#next-action`}
                            className="text-center text-xs font-bold text-emerald-800"
                          >
                            Reschedule instead
                          </Link>
                        </form>
                      </details>
                    </div>
                  ) : (
                    <Link
                      href={`/admin/leads/${item.lead_id}`}
                      className="text-sm font-bold text-emerald-800 lg:text-right"
                    >
                      Open lead →
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            title={`No ${bucketLabel(active).toLowerCase()} follow-ups`}
            description={
              active === "TODAY"
                ? "Nothing is due today. Check upcoming work or return to the lead pipeline."
                : "This queue is clear."
            }
            action={{
              href: active === "TODAY" ? "/admin/follow-ups?bucket=UPCOMING" : "/admin/leads",
              label: active === "TODAY" ? "View upcoming" : "Open leads",
            }}
          />
        </div>
      )}
    </section>
  );
}

function bucketLabel(bucket: FollowUpBucket) {
  return (
    { OVERDUE: "Overdue", TODAY: "Today", UPCOMING: "Upcoming", COMPLETED: "Completed" } as const
  )[bucket];
}

function friendly(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}
