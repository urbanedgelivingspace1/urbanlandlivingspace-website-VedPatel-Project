import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteVisitDetailWorkspace } from "@/components/admin/site-visit-workspace";
import { siteVisitStatusLabel } from "@/features/site-visits/domain/workflow";
import { getSiteVisitWorkspace } from "@/server/services/site-visits";
import {
  addSiteVisitNoteAction,
  scheduleSiteVisitFollowUpAction,
  transitionSiteVisitAction,
} from "../actions";

export default async function SiteVisitDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string | string[]; error?: string | string[] }>;
}) {
  const { id } = await params;
  const messages = await searchParams;
  const workspace = await getSiteVisitWorkspace(id);
  if (!workspace) notFound();
  const saved = typeof messages.saved === "string" ? messages.saved : undefined;
  const error = typeof messages.error === "string" ? messages.error : undefined;
  return (
    <section className="mx-auto max-w-7xl" aria-labelledby="visit-heading">
      <Link href="/admin/leads?view=site-visits" className="text-sm font-semibold text-emerald-800">
        ← Site Visits
      </Link>
      {saved ? (
        <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
          {saved}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-900">
          {error}
        </p>
      ) : null}
      <header className="mt-4 rounded-2xl bg-slate-950 p-6 text-white">
        <p className="text-xs font-bold tracking-[.16em] text-[var(--brand-gold)] uppercase">
          {workspace.visit.reference}
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 id="visit-heading" className="font-display text-4xl">
              {workspace.visit.leadName} · {workspace.visit.propertyCode}
            </h1>
            <p className="mt-2 text-slate-300">
              {workspace.visit.leadReference} · {workspace.visit.propertyTitle ?? "Property visit"}
            </p>
          </div>
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
            Status: {siteVisitStatusLabel(workspace.visit.status)}
          </span>
        </div>
      </header>
      <SiteVisitDetailWorkspace
        workspace={workspace}
        transitionAction={transitionSiteVisitAction.bind(null, id)}
        noteAction={addSiteVisitNoteAction.bind(null, id)}
        followUpAction={scheduleSiteVisitFollowUpAction.bind(null, id)}
      />
    </section>
  );
}
