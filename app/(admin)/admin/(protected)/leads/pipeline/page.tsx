import Link from "next/link";
import { LEAD_STATUSES } from "@/features/crm/domain/contracts";
import { leadStatusLabel } from "@/features/crm/domain/pipeline";
import { listLeads } from "@/server/services/crm";
export default async function PipelinePage() {
  const leads = await listLeads({});
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[.16em] text-[var(--brand-navy)] uppercase">
            Leads
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold">Lead Stages</h1>
        </div>
        <Link href="/admin/leads" className="button button-outline">
          All Leads
        </Link>
      </div>
      <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
        {LEAD_STATUSES.map((status) => {
          const cards = leads.filter((l) => l.status === status);
          return (
            <section
              key={status}
              aria-labelledby={`stage-${status}`}
              className="w-72 shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <h2 id={`stage-${status}`} className="font-bold">
                {leadStatusLabel(status)} <span className="text-slate-500">{cards.length}</span>
              </h2>
              <div className="mt-3 space-y-2">
                {cards.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/admin/leads/${lead.id}`}
                    className="block rounded-lg border border-slate-200 bg-white p-3 hover:border-[var(--brand-navy)]"
                  >
                    <strong>{lead.name}</strong>
                    <span className="mt-1 block text-xs text-slate-500">
                      {lead.leadReference} · {lead.category ?? "Unclassified"}
                    </span>
                  </Link>
                ))}
                {!cards.length ? (
                  <p className="rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-500">
                    No leads
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
