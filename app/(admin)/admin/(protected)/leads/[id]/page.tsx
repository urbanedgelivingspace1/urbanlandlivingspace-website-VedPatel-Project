import Link from "next/link";
import { notFound } from "next/navigation";
import { FOLLOW_UP_TYPES, LOSS_REASONS } from "@/features/crm/domain/contracts";
import { formatIndiaDateTime } from "@/features/crm/domain/follow-ups";
import { leadStatusLabel, nextLeadStatuses } from "@/features/crm/domain/pipeline";
import { getCrmReferenceData, getLeadWorkspace } from "@/server/services/crm";
import {
  addActivityAction,
  completeFollowUpAction,
  matchPropertyAction,
  saveRequirementAction,
  scheduleFollowUpAction,
  transitionLeadAction,
  unmatchPropertyAction,
  updateLeadAction,
} from "../actions";

const input = "mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal";
export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string | string[] }>;
}) {
  const { id } = await params;
  const saved = (await searchParams).saved;
  const [workspace, refs] = await Promise.all([getLeadWorkspace(id), getCrmReferenceData()]);
  if (!workspace) notFound();
  const { lead, requirement, matches, followUps, activities } = workspace;
  const openFollowUp = followUps.find((f) => !f.completedAt);
  return (
    <section className="mx-auto max-w-7xl" aria-labelledby="lead-heading">
      <div className="flex flex-wrap gap-4 text-sm font-semibold text-[var(--brand-navy)]">
        <Link href="/admin/leads">← Lead inbox</Link>
        <Link href={`/admin/site-visits?q=${encodeURIComponent(lead.leadReference)}`}>
          Linked site visits →
        </Link>
      </div>
      {saved ? (
        <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
          CRM update saved.
        </p>
      ) : null}
      <header className="mt-4 rounded-2xl bg-slate-950 p-6 text-white">
        <p className="text-xs font-bold tracking-[.16em] text-[var(--brand-gold)] uppercase">
          {lead.leadReference}
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 id="lead-heading" className="font-display text-4xl">
              {lead.name}
            </h1>
            <p className="mt-2 text-slate-300">
              {lead.phone ?? "No phone"} · {lead.email ?? "No email"}
            </p>
          </div>
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
            {leadStatusLabel(lead.status)}
          </span>
        </div>
      </header>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Panel title="Contact and demand">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Fact
                label="Source"
                value={[lead.sourceType, lead.sourceDetail].filter(Boolean).join(" · ")}
              />
              <Fact label="Inquiry" value={lead.inquiryType} />
              <Fact
                label="Intent"
                value={[lead.transaction, lead.category].filter(Boolean).join(" · ")}
              />
              <Fact label="Buyer type" value={lead.buyerType} />
              <Fact
                label="Location"
                value={[lead.districtName, lead.localityText].filter(Boolean).join(" · ")}
              />
              <Fact label="Budget" value={formatBudget(lead.budgetMin, lead.budgetMax)} />
              <Fact label="Intended use" value={lead.intendedUse} />
              <Fact label="Intake note" value={lead.notesInternal} />
              <Fact label="Created" value={formatIndiaDateTime(lead.createdAt)} />
            </dl>
            <details className="mt-5">
              <summary className="cursor-pointer font-bold text-[var(--brand-navy)]">
                Edit lead
              </summary>
              <form
                action={updateLeadAction.bind(null, id)}
                className="mt-4 grid gap-3 sm:grid-cols-2"
              >
                <Field name="name" label="Full name" value={lead.name} required />
                <Field name="phone" label="Phone" value={lead.phone ?? ""} />
                <Field name="email" label="Email" type="email" value={lead.email ?? ""} />
                <Field name="sourceType" label="Source" value={lead.sourceType} required />
                <Field name="sourceDetail" label="Source context" value={lead.sourceDetail ?? ""} />
                <Select
                  name="inquiryType"
                  label="Inquiry type"
                  value={lead.inquiryType}
                  options={[
                    "GENERAL_CONTACT",
                    "PROPERTY_INQUIRY",
                    "PRICE_INQUIRY",
                    "BUYER_REQUIREMENT",
                    "SITE_VISIT_REQUEST",
                    "WHATSAPP_CLICK",
                    "CALL_CLICK",
                  ]}
                />
                <Select
                  name="buyerType"
                  label="Buyer type"
                  value={lead.buyerType ?? ""}
                  options={[
                    "",
                    "INDIVIDUAL",
                    "INVESTOR",
                    "FARMER",
                    "DEVELOPER",
                    "BUILDER",
                    "INDUSTRIAL_BUSINESS",
                    "LOGISTICS_OPERATOR",
                    "NRI",
                    "BROKER",
                    "OTHER",
                  ]}
                />
                <Select
                  name="preferredTransaction"
                  label="Transaction"
                  value={lead.transaction ?? ""}
                  options={["", "BUY", "RENT", "LEASE"]}
                />
                <Select
                  name="landCategory"
                  label="Category"
                  value={lead.category ?? ""}
                  options={["", "AGRICULTURAL", "NA", "INDUSTRIAL"]}
                />
                <Select
                  name="districtId"
                  label="District"
                  value={refs.districts.find((d) => d.name === lead.districtName)?.id ?? ""}
                  options={["", ...refs.districts.map((d) => d.id)]}
                  labels={Object.fromEntries(refs.districts.map((d) => [d.id, d.name]))}
                />
                <Field name="localityText" label="Locality" value={lead.localityText ?? ""} />
                <Field
                  name="budgetMin"
                  label="Minimum budget"
                  type="number"
                  value={lead.budgetMin ?? ""}
                />
                <Field
                  name="budgetMax"
                  label="Maximum budget"
                  type="number"
                  value={lead.budgetMax ?? ""}
                />
                <Field name="intendedUse" label="Intended use" value={lead.intendedUse ?? ""} />
                <button className="button button-primary sm:col-span-2">Save lead</button>
              </form>
            </details>
          </Panel>
          <Panel title="Buyer requirement">
            <form
              action={saveRequirementAction.bind(null, id)}
              className="grid gap-3 sm:grid-cols-2"
            >
              <Field
                name="minAreaValue"
                label="Minimum area"
                type="number"
                step="any"
                value={requirement?.minAreaValue ?? ""}
              />
              <Field
                name="maxAreaValue"
                label="Maximum area"
                type="number"
                step="any"
                value={requirement?.maxAreaValue ?? ""}
              />
              <Select
                name="areaUnitId"
                label="Area unit"
                value={requirement?.areaUnitId ?? ""}
                options={["", ...refs.units.map((u) => u.id)]}
                labels={Object.fromEntries(
                  refs.units.map((u) => [
                    u.id,
                    `${u.display_name}${u.symbol ? ` (${u.symbol})` : ""}`,
                  ]),
                )}
              />
              <Field
                name="preferredRoadWidthMMin"
                label="Minimum road width (m)"
                type="number"
                step="any"
                value={requirement?.preferredRoadWidthMMin ?? ""}
              />
              <Field
                name="preferredFrontageMMin"
                label="Minimum frontage (m)"
                type="number"
                step="any"
                value={requirement?.preferredFrontageMMin ?? ""}
              />
              <label className="text-sm font-semibold sm:col-span-2">
                Requirement notes
                <textarea
                  name="requirementNotes"
                  defaultValue={requirement?.notes ?? ""}
                  rows={3}
                  className={input}
                />
              </label>
              <button className="button button-primary sm:col-span-2">Save requirement</button>
            </form>
          </Panel>
          <Panel title="Matched properties">
            <form
              action={matchPropertyAction.bind(null, id)}
              className="grid gap-3 sm:grid-cols-[1fr_10rem_1fr_auto]"
            >
              <Select
                name="propertyId"
                label="Candidate property"
                options={refs.properties.map((p) => p.id)}
                labels={Object.fromEntries(
                  refs.properties.map((p) => [
                    p.id,
                    `${p.property_code} · ${p.listing_title ?? p.land_category}`,
                  ]),
                )}
              />
              <Select
                name="matchStatus"
                label="Match state"
                options={["ACTIVE", "PRESENTED", "ACCEPTED", "REJECTED"]}
              />
              <Field name="matchNotes" label="Internal match note" />
              <button className="button button-primary self-end">Link property</button>
            </form>
            <div className="mt-5 space-y-3">
              {matches.map((match) => (
                <article
                  key={match.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
                >
                  <div>
                    <Link
                      href={`/admin/properties/${match.propertyId}`}
                      className="font-bold text-[var(--brand-navy)]"
                    >
                      {match.propertyCode} · {match.title ?? match.category}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {match.status} · {match.availability}
                      {match.notes ? ` · ${match.notes}` : ""}
                    </p>
                  </div>
                  <form action={unmatchPropertyAction.bind(null, id)}>
                    <input type="hidden" name="propertyId" value={match.propertyId} />
                    <input type="hidden" name="reason" value="Removed from candidate set" />
                    <button className="rounded-lg border border-red-300 px-3 py-2 text-sm font-bold text-red-800">
                      Remove match
                    </button>
                  </form>
                </article>
              ))}
              {!matches.length ? (
                <p className="text-sm text-slate-500">No candidate properties linked.</p>
              ) : null}
            </div>
          </Panel>
          <Panel title="Activity timeline">
            <form
              action={addActivityAction.bind(null, id)}
              className="grid gap-3 sm:grid-cols-[13rem_1fr_auto]"
            >
              <Select
                name="activityType"
                label="Activity"
                options={[
                  "CONTACT_ATTEMPTED",
                  "CONTACTED",
                  "CALL_CLICK",
                  "WHATSAPP_CLICK",
                  "EMAIL_INTERACTION",
                  "NOTE_ADDED",
                  "OFFER_RECEIVED",
                  "OTHER",
                ]}
              />
              <Field name="activityNote" label="Private note" />
              <button className="button button-primary self-end">Record</button>
            </form>
            <ol className="mt-6 space-y-3">
              {activities.map((activity) => (
                <li key={activity.id} className="border-l-2 border-[var(--brand-gold)] pl-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <strong>{activity.type.replaceAll("_", " ")}</strong>
                    <time className="text-xs text-slate-500">
                      {formatIndiaDateTime(activity.at)}
                    </time>
                  </div>
                  <p className="text-sm text-slate-600">
                    {activity.note ?? activity.metadata ?? "Recorded"}
                  </p>
                  <p className="text-xs text-slate-400">{activity.actorName}</p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
        <aside className="space-y-6">
          <Panel title="Next action">
            {openFollowUp ? (
              <div className="rounded-lg bg-amber-50 p-3">
                <strong>{openFollowUp.type.replaceAll("_", " ")}</strong>
                <p className="mt-1 text-sm">{formatIndiaDateTime(openFollowUp.dueAt)}</p>
                <p className="text-sm text-slate-600">
                  {openFollowUp.context ?? openFollowUp.note}
                </p>
                <form action={completeFollowUpAction.bind(null, id)} className="mt-3">
                  <input type="hidden" name="followUpId" value={openFollowUp.id} />
                  <label className="text-sm font-semibold">
                    Outcome
                    <input name="outcome" className={input} />
                  </label>
                  <button className="button button-primary mt-3 w-full">Complete follow-up</button>
                </form>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No open follow-up.</p>
            )}
            <form action={scheduleFollowUpAction.bind(null, id)} className="mt-4 space-y-3">
              <Field
                name="dueAt"
                label={openFollowUp ? "Reschedule for" : "Due in India time"}
                type="datetime-local"
                required
              />
              <Select name="followUpType" label="Type" options={[...FOLLOW_UP_TYPES]} />
              <Field name="followUpContext" label="Context" />
              <label className="text-sm font-semibold">
                Follow-up note
                <textarea name="followUpNote" rows={2} className={input} />
              </label>
              <button className="button button-outline w-full">Schedule follow-up</button>
            </form>
          </Panel>
          <Panel title="Change stage">
            {nextLeadStatuses(lead.status).length ? (
              <form action={transitionLeadAction.bind(null, id)} className="space-y-3">
                <Select
                  name="nextStatus"
                  label="Next stage"
                  options={[...nextLeadStatuses(lead.status)]}
                />
                <label className="text-sm font-semibold">
                  Reason or outcome
                  <input name="reason" list="loss-reasons" className={input} />
                  <datalist id="loss-reasons">
                    {LOSS_REASONS.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    Required for nurture and closed outcomes. Closed lost uses a listed reason.
                  </span>
                </label>
                <button className="button button-primary w-full">Change stage</button>
              </form>
            ) : (
              <p className="text-sm text-slate-600">
                This outcome is terminal. Create a new opportunity for new business intent.
              </p>
            )}
          </Panel>
          <Panel title="Follow-up history">
            <ul className="space-y-3 text-sm">
              {followUps.map((f) => (
                <li key={f.id} className="border-b border-slate-100 pb-3">
                  <strong>{f.type.replaceAll("_", " ")}</strong>
                  <span className="block text-slate-500">Due {formatIndiaDateTime(f.dueAt)}</span>
                  <span className="block">
                    {f.completedAt ? `Completed ${formatIndiaDateTime(f.completedAt)}` : "Open"}
                    {f.outcome ? ` · ${f.outcome}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </aside>
      </div>
    </section>
  );
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-display mb-4 text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}
function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium">{value || "Not recorded"}</dd>
    </div>
  );
}
function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, value, ...rest } = props;
  return (
    <label className="text-sm font-semibold">
      {label}
      <input {...rest} defaultValue={value} className={input} />
    </label>
  );
}
function Select({
  name,
  label,
  value,
  options,
  labels = {},
}: {
  name: string;
  label: string;
  value?: string;
  options: readonly string[];
  labels?: Record<string, string>;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <select name={name} defaultValue={value} className={input}>
        {options.map((o) => (
          <option key={o || "blank"} value={o}>
            {labels[o] ?? (o ? o.replaceAll("_", " ") : "Not set")}
          </option>
        ))}
      </select>
    </label>
  );
}
function formatBudget(min: number | null, max: number | null) {
  if (min === null && max === null) return "Not recorded";
  const money = (v: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(v);
  return min !== null && max !== null
    ? `${money(min)} – ${money(max)}`
    : min !== null
      ? `From ${money(min)}`
      : `Up to ${money(max as number)}`;
}
