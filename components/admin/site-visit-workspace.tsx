import Link from "next/link";

import { FOLLOW_UP_TYPES } from "@/features/crm/domain/contracts";
import { formatIndiaDateTime } from "@/features/crm/domain/follow-ups";
import type { SiteVisitWorkspace } from "@/features/site-visits/domain/contracts";
import {
  canTransitionSiteVisit,
  siteVisitStatusLabel,
  toIndiaLocalDateTime,
} from "@/features/site-visits/domain/workflow";

type Action = (formData: FormData) => Promise<void>;
const input = "mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal";

export function SiteVisitDetailWorkspace({
  workspace,
  transitionAction,
  noteAction,
  followUpAction,
}: Readonly<{
  workspace: SiteVisitWorkspace;
  transitionAction: Action;
  noteAction: Action;
  followUpAction: Action;
}>) {
  const { visit, events, followUps } = workspace;
  const hidden = <input type="hidden" name="expectedVersion" value={visit.version} />;
  const terminal = ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(visit.status);
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_24rem]">
      <div className="space-y-6">
        {visit.propertyConflict ? (
          <div
            role="alert"
            className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950"
          >
            <p className="font-bold">Property availability conflict</p>
            <p className="mt-1 text-sm">
              {visit.propertyConflict} New proposals and confirmations are blocked; historical visit
              data is unchanged.
            </p>
          </div>
        ) : null}
        <Panel title="Visit context">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <Fact
              label="Requested window"
              value={range(visit.requestedStartAt, visit.requestedEndAt)}
            />
            <Fact label="Proposed slot" value={range(visit.proposedStartAt, visit.proposedEndAt)} />
            <Fact
              label="Confirmed slot"
              value={range(visit.confirmedStartAt, visit.confirmedEndAt)}
            />
            <Fact label="Timezone" value="Asia/Kolkata (IST)" />
            <Fact label="Contact outcome" value={visit.contactOutcome} />
            <Fact label="Meeting instructions" value={visit.meetingInstructions} />
            <Fact label="Request context" value={visit.requestNotes} />
            <Fact label="Outcome" value={visit.outcome} />
            <Fact label="Assigned" value={visit.assignedName} />
            <Fact label="Last updated" value={formatIndiaDateTime(visit.updatedAt)} />
          </dl>
        </Panel>
        <Panel title="Operational controls">
          <div className="grid gap-5 md:grid-cols-2">
            {canTransitionSiteVisit(visit.status, "CONTACTED") ? (
              <Operation title="Record staff contact">
                <form action={transitionAction} className="space-y-3">
                  {hidden}
                  <input type="hidden" name="nextStatus" value="CONTACTED" />
                  <Field
                    label="Contact outcome"
                    name="contactOutcome"
                    placeholder="Reached visitor; discussed preferred window"
                    required
                  />
                  <Field label="Operational note (optional)" name="note" />
                  <button className="button button-primary">Mark contacted</button>
                </form>
              </Operation>
            ) : null}
            {canTransitionSiteVisit(visit.status, "PROPOSED") ? (
              <SlotOperation
                title="Propose a visit slot"
                action={transitionAction}
                version={visit.version}
                status="PROPOSED"
                defaultStart={visit.requestedStartAt}
                defaultEnd={visit.requestedEndAt}
              />
            ) : null}
            {canTransitionSiteVisit(visit.status, "CONFIRMED") ? (
              <Operation title="Confirm proposed slot">
                <form action={transitionAction} className="space-y-3">
                  {hidden}
                  <input type="hidden" name="nextStatus" value="CONFIRMED" />
                  <p className="text-sm text-slate-600">
                    Explicitly confirms {range(visit.proposedStartAt, visit.proposedEndAt)}. A
                    proposal is not confirmed until this action succeeds.
                  </p>
                  <Field label="Confirmation note (optional)" name="note" />
                  <button className="button button-primary">Confirm visit</button>
                </form>
              </Operation>
            ) : null}
            {canTransitionSiteVisit(visit.status, "RESCHEDULED") ? (
              <SlotOperation
                title="Reschedule with history"
                action={transitionAction}
                version={visit.version}
                status="RESCHEDULED"
                defaultStart={visit.proposedStartAt ?? visit.confirmedStartAt}
                defaultEnd={visit.proposedEndAt ?? visit.confirmedEndAt}
                requireReason
              />
            ) : null}
            {canTransitionSiteVisit(visit.status, "COMPLETED") ? (
              <Operation title="Complete after the visit">
                <form action={transitionAction} className="space-y-3">
                  {hidden}
                  <input type="hidden" name="nextStatus" value="COMPLETED" />
                  <Field
                    label="Outcome"
                    name="outcome"
                    placeholder="Attended — interested"
                    required
                  />
                  <Field label="Buyer reaction / next action" name="note" required />
                  <button className="button button-primary">Mark completed</button>
                </form>
              </Operation>
            ) : null}
            {canTransitionSiteVisit(visit.status, "NO_SHOW") ? (
              <Operation title="Record no-show">
                <form action={transitionAction} className="space-y-3">
                  {hidden}
                  <input type="hidden" name="nextStatus" value="NO_SHOW" />
                  <Field
                    label="No-show context"
                    name="outcome"
                    placeholder="Visitor did not attend"
                  />
                  <Field label="Operational note" name="note" />
                  <button className="button button-outline">Record no-show</button>
                </form>
              </Operation>
            ) : null}
            {canTransitionSiteVisit(visit.status, "CANCELLED") ? (
              <details className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <summary className="cursor-pointer font-bold text-rose-950">Cancel visit</summary>
                <form action={transitionAction} className="mt-4 space-y-3">
                  {hidden}
                  <input type="hidden" name="nextStatus" value="CANCELLED" />
                  <Field label="Cancellation reason" name="reason" required />
                  <Field label="Operational note (optional)" name="note" />
                  <p className="text-xs text-rose-900">
                    Cancellation preserves the visit and its complete history.
                  </p>
                  <button className="button border border-rose-700 bg-rose-700 text-white">
                    Confirm cancellation
                  </button>
                </form>
              </details>
            ) : null}
          </div>
          {!canTransitionSiteVisit(visit.status, "CONTACTED") &&
          !canTransitionSiteVisit(visit.status, "PROPOSED") &&
          !canTransitionSiteVisit(visit.status, "CONFIRMED") &&
          !canTransitionSiteVisit(visit.status, "RESCHEDULED") &&
          !canTransitionSiteVisit(visit.status, "COMPLETED") &&
          !canTransitionSiteVisit(visit.status, "NO_SHOW") &&
          !canTransitionSiteVisit(visit.status, "CANCELLED") ? (
            <p className="text-sm text-slate-600">
              This visit has reached a terminal operational state. Its history remains available
              below.
            </p>
          ) : null}
        </Panel>
        <Panel title="Operational timeline">
          <ol className="space-y-4">
            {events.map((event) => (
              <li key={event.id} className="border-l-2 border-slate-200 pl-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold">{event.type.replaceAll("_", " ")}</p>
                  <time className="text-xs text-slate-500">
                    {formatIndiaDateTime(event.occurredAt)}
                  </time>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {event.actorName}
                  {event.fromStatus && event.toStatus
                    ? ` · ${siteVisitStatusLabel(event.fromStatus)} → ${siteVisitStatusLabel(event.toStatus)}`
                    : ""}
                </p>
                {event.previousStartAt &&
                event.newStartAt &&
                event.previousStartAt !== event.newStartAt ? (
                  <p className="mt-2 text-sm">
                    Prior: {formatIndiaDateTime(event.previousStartAt)}
                    <br />
                    New: {formatIndiaDateTime(event.newStartAt)}
                  </p>
                ) : null}
                {event.reason ? <p className="mt-2 text-sm">Reason: {event.reason}</p> : null}
                {event.note ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm">{event.note}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </Panel>
      </div>
      <aside className="space-y-6">
        <Panel title="Lead and property">
          <p className="font-bold">{visit.leadName}</p>
          <p className="mt-1 text-sm text-slate-600">
            {visit.leadReference}
            <br />
            {visit.phone ?? "No phone"}
            <br />
            {visit.leadEmail ?? "No email"}
          </p>
          <Link
            href={`/admin/leads/${visit.leadId}`}
            className="mt-4 inline-block font-semibold text-[var(--brand-navy)] hover:underline"
          >
            Open CRM lead →
          </Link>
          <hr className="my-5 border-slate-200" />
          <p className="font-bold">{visit.propertyCode}</p>
          <p className="mt-1 text-sm text-slate-600">
            {visit.propertyTitle ?? "Untitled property"}
            <br />
            {visit.publication} · {visit.availability}
          </p>
          <Link
            href={`/admin/properties/${visit.propertyId}`}
            className="mt-4 inline-block font-semibold text-[var(--brand-navy)] hover:underline"
          >
            Open property →
          </Link>
        </Panel>
        <Panel title="Add operational note">
          <form action={noteAction} className="space-y-3">
            {hidden}
            <label className="block text-sm font-semibold">
              Private note
              <textarea name="note" rows={4} required maxLength={5000} className={input} />
            </label>
            <button className="button button-outline">Add note</button>
          </form>
        </Panel>
        <Panel title="CRM follow-up">
          {followUps.length ? (
            <ul className="mb-4 space-y-2 text-sm">
              {followUps.map((followUp) => (
                <li key={followUp.id} className="rounded-lg bg-slate-50 p-3">
                  <strong>{followUp.type}</strong>
                  <br />
                  {formatIndiaDateTime(followUp.dueAt)} ·{" "}
                  {followUp.completedAt ? "Completed" : "Open"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-4 text-sm text-slate-600">No follow-up linked to this visit.</p>
          )}
          {terminal && !visit.hasOpenFollowUp ? (
            <form action={followUpAction} className="space-y-3">
              {hidden}
              <Field label="Next contact (IST)" name="dueAt" type="datetime-local" required />
              <label className="block text-sm font-semibold">
                Follow-up type
                <select name="type" className={input}>
                  {FOLLOW_UP_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              <Field label="Context" name="context" />
              <Field label="Private note (optional)" name="note" />
              <button className="button button-primary">Schedule separate follow-up</button>
            </form>
          ) : terminal ? (
            <p className="text-sm text-slate-600">
              Complete the existing CRM follow-up before adding another.
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              Follow-up creation becomes available after a completed, cancelled, or no-show outcome.
            </p>
          )}
        </Panel>
      </aside>
    </div>
  );
}

function Panel({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
function Operation({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="rounded-xl border border-slate-200 p-4">
      <h3 className="font-bold">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}
function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: Readonly<{
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}>) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        className={input}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}
function Fact({ label, value }: Readonly<{ label: string; value: string | null | undefined }>) {
  return (
    <div>
      <dt className="font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap">{value || "Not recorded"}</dd>
    </div>
  );
}
function range(start: string | null, end: string | null) {
  return start && end
    ? `${formatIndiaDateTime(start)} – ${formatIndiaDateTime(end)}`
    : "Not recorded";
}
function SlotOperation({
  title,
  action,
  version,
  status,
  defaultStart,
  defaultEnd,
  requireReason = false,
}: Readonly<{
  title: string;
  action: Action;
  version: number;
  status: "PROPOSED" | "RESCHEDULED";
  defaultStart: string | null;
  defaultEnd: string | null;
  requireReason?: boolean;
}>) {
  return (
    <Operation title={title}>
      <form action={action} className="space-y-3">
        <input type="hidden" name="expectedVersion" value={version} />
        <input type="hidden" name="nextStatus" value={status} />
        <Field label="Start (IST)" name="startAt" type="datetime-local" required />
        <Field label="End (IST)" name="endAt" type="datetime-local" required />
        {defaultStart ? (
          <p className="text-xs text-slate-500">
            Current reference: {toIndiaLocalDateTime(defaultStart)} to{" "}
            {toIndiaLocalDateTime(defaultEnd)}
          </p>
        ) : null}
        {requireReason ? <Field label="Reschedule reason" name="reason" required /> : null}
        <Field label="Meeting/location instructions" name="meetingInstructions" />
        <Field label="Operational note (optional)" name="note" />
        <button className="button button-primary">
          {status === "PROPOSED" ? "Save proposal" : "Record reschedule"}
        </button>
      </form>
    </Operation>
  );
}
