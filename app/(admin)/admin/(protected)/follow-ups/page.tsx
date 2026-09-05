import Link from "next/link";
import { classifyFollowUp, formatIndiaDateTime } from "@/features/crm/domain/follow-ups";
import { listFollowUps } from "@/server/services/crm";
import { completeFollowUpAction } from "../leads/actions";

export default async function FollowUpsPage() {
  const rows = await listFollowUps();
  const buckets = ["OVERDUE", "TODAY", "UPCOMING", "COMPLETED"] as const;
  return (
    <section>
      <div>
        <p className="text-xs font-bold tracking-[.16em] text-[var(--brand-navy)] uppercase">
          Daily queue
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold">Follow-ups</h1>
        <p className="mt-2 text-slate-600">
          Due dates are stored in UTC and shown in Asia/Kolkata business time.
        </p>
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {buckets.map((bucket) => {
          const items = rows.filter(
            (row) => classifyFollowUp(row.due_at, row.completed_at) === bucket,
          );
          return (
            <section
              key={bucket}
              aria-labelledby={`bucket-${bucket}`}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <h2 id={`bucket-${bucket}`} className="font-display text-2xl font-semibold">
                {bucket.replaceAll("_", " ")}{" "}
                <span className="text-base text-slate-500">{items.length}</span>
              </h2>
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <article key={item.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-wrap justify-between gap-2">
                      <Link
                        href={`/admin/leads/${item.lead_id}`}
                        className="font-bold text-[var(--brand-navy)]"
                      >
                        {item.leadName} · {item.leadReference}
                      </Link>
                      <time className="text-xs text-slate-500">
                        {formatIndiaDateTime(item.due_at)}
                      </time>
                    </div>
                    <p className="mt-1 text-sm">
                      {item.follow_up_type.replaceAll("_", " ")}
                      {item.context ? ` · ${item.context}` : ""}
                    </p>
                    {item.note ? <p className="mt-1 text-sm text-slate-600">{item.note}</p> : null}
                    {!item.completed_at ? (
                      <form
                        action={completeFollowUpAction.bind(null, item.lead_id)}
                        className="mt-3 flex gap-2"
                      >
                        <input type="hidden" name="followUpId" value={item.id} />
                        <input
                          name="outcome"
                          aria-label={`Outcome for ${item.leadReference}`}
                          placeholder="Outcome"
                          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                        <button className="rounded-lg bg-[var(--brand-navy)] px-3 py-2 text-sm font-bold text-white">
                          Complete
                        </button>
                      </form>
                    ) : (
                      <p className="mt-2 text-xs text-emerald-700">
                        Completed {formatIndiaDateTime(item.completed_at)}
                        {item.outcome ? ` · ${item.outcome}` : ""}
                      </p>
                    )}
                  </article>
                ))}
                {!items.length ? (
                  <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    No follow-ups in this queue.
                  </p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
