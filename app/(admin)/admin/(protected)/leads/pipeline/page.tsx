import Link from "next/link";

import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/admin-ui";
import { CrmWorkspaceTabs } from "@/components/admin/crm-workspace-tabs";
import type { LeadStatus } from "@/features/admin/contracts";
import type { LeadListItem } from "@/features/crm/domain/contracts";
import { formatIndiaDateTime } from "@/features/crm/domain/follow-ups";
import { leadStatusLabel } from "@/features/crm/domain/pipeline";
import { listLeads } from "@/server/services/crm";

const lanes: readonly Readonly<{
  key: string;
  label: string;
  statuses: readonly LeadStatus[];
  tone: string;
}>[] = [
  { key: "new", label: "New", statuses: ["NEW"], tone: "bg-blue-500" },
  {
    key: "contacted",
    label: "Contact started",
    statuses: ["CONTACT_ATTEMPTED"],
    tone: "bg-cyan-500",
  },
  { key: "qualified", label: "Interested", statuses: ["QUALIFIED"], tone: "bg-violet-500" },
  {
    key: "requirement",
    label: "Needs confirmed",
    statuses: ["REQUIREMENT_CONFIRMED"],
    tone: "bg-indigo-500",
  },
  {
    key: "matched",
    label: "Properties shared",
    statuses: ["PROPERTY_MATCHED"],
    tone: "bg-amber-500",
  },
  {
    key: "visit",
    label: "Site visit",
    statuses: ["SITE_VISIT_REQUESTED", "SITE_VISIT_CONFIRMED", "SITE_VISIT_COMPLETED"],
    tone: "bg-orange-500",
  },
  {
    key: "negotiation",
    label: "Discussing price",
    statuses: ["NEGOTIATION"],
    tone: "bg-emerald-500",
  },
  {
    key: "later",
    label: "Follow up later",
    statuses: ["NURTURE"],
    tone: "bg-teal-500",
  },
  {
    key: "closed",
    label: "Finished",
    statuses: ["CLOSED_WON", "CLOSED_LOST"],
    tone: "bg-slate-500",
  },
];

export default async function PipelinePage() {
  const leads = await listLeads({});
  return (
    <section className="mx-auto max-w-[1700px]">
      <AdminPageHeader
        eyebrow="CRM"
        title="Pipeline"
        description="See where every active lead stands. Open a lead to record what should happen next."
        actions={
          <Link href="/admin/leads/new" className="button button-primary">
            + New lead
          </Link>
        }
      />
      <CrmWorkspaceTabs active="pipeline" />
      <div className="mt-5 flex gap-3 overflow-x-auto pb-5">
        {lanes.map((lane) => {
          const cards = leads.filter((lead) => lane.statuses.includes(lead.status));
          return (
            <section
              key={lane.key}
              aria-label={`${lane.label} ${cards.length}`}
              className="w-[17rem] shrink-0 rounded-xl border border-slate-200 bg-slate-100/70"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-3 py-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${lane.tone}`} />
                  <h2 className="text-sm font-bold text-slate-900">{lane.label}</h2>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500">
                  {cards.length}
                </span>
              </div>
              <div className="space-y-2 p-2">
                {cards.map((lead) => (
                  <PipelineCard key={lead.id} lead={lead} />
                ))}
                {!cards.length ? (
                  <EmptyState compact title="No leads" description="This stage is clear." />
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        Stage changes stay inside the lead workspace so existing workflow checks and required
        information are preserved.
      </p>
    </section>
  );
}

function PipelineCard({ lead }: Readonly<{ lead: LeadListItem }>) {
  return (
    <Link
      href={`/admin/leads/${lead.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,.03)] hover:border-emerald-500 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <strong className="text-sm text-slate-950">{lead.name}</strong>
        <StatusBadge tone={lead.inquiryType === "SELLER_LEAD" ? "success" : "info"}>
          {lead.inquiryType === "SELLER_LEAD" ? "Seller" : "Buyer"}
        </StatusBadge>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {lead.leadReference} · {leadStatusLabel(lead.status)}
      </p>
      <p className="mt-3 text-xs font-semibold text-slate-700">
        {[friendly(lead.category), lead.localityText ?? lead.districtName]
          .filter(Boolean)
          .join(" · ") || "Requirement not captured"}
      </p>
      <div className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
        <span className="font-semibold">Next: </span>
        {lead.nextFollowUpAt ? formatIndiaDateTime(lead.nextFollowUpAt) : "Not scheduled"}
      </div>
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
