import Link from "next/link";
import { notFound } from "next/navigation";
import { FOLLOW_UP_TYPES, LOSS_REASONS } from "@/features/crm/domain/contracts";
import type { LeadWorkspace } from "@/features/crm/domain/contracts";
import { formatIndiaDateTime } from "@/features/crm/domain/follow-ups";
import { leadStatusLabel, nextLeadStatuses } from "@/features/crm/domain/pipeline";
import { getCrmReferenceData, getLeadWorkspace } from "@/server/services/crm";
import { DeleteLeadButton } from "@/components/admin/delete-lead-button";
import {
  addActivityAction,
  completeFollowUpAction,
  deleteLeadAction,
  matchPropertyAction,
  saveRequirementAction,
  scheduleFollowUpAction,
  transitionLeadAction,
  unmatchPropertyAction,
  updateLeadAction,
  uploadSellerLeadDocumentsAction,
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
  const { lead, requirement, matches, followUps, activities, documents } = workspace;
  const openFollowUp = followUps.find((f) => !f.completedAt);
  const createPropertyHref = sellerPropertyDraftHref(lead, requirement, refs.districts);
  return (
    <section className="mx-auto max-w-7xl" aria-labelledby="lead-heading">
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-semibold text-[var(--brand-navy)]">
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/leads">← Leads</Link>
          <Link href={`/admin/leads?view=site-visits&q=${encodeURIComponent(lead.leadReference)}`}>
            Site visits →
          </Link>
        </div>
        <DeleteLeadButton
          leadId={lead.id}
          leadName={lead.name}
          action={deleteLeadAction}
          variant="danger-outline"
          buttonText="Delete lead"
        />
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
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {lead.phone ? (
                <>
                  <a
                    className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20"
                    href={`tel:${lead.phone}`}
                  >
                    Call {lead.phone}
                  </a>
                  <a
                    className="rounded-lg bg-emerald-500 px-3 py-2 font-bold text-emerald-950 hover:bg-emerald-400"
                    href={`https://wa.me/${whatsAppNumber(lead.phone)}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    WhatsApp
                  </a>
                </>
              ) : (
                <span className="text-slate-300">No phone</span>
              )}
              {lead.email ? (
                <a
                  className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20"
                  href={`mailto:${lead.email}`}
                >
                  {lead.email}
                </a>
              ) : null}
            </div>
          </div>
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
            {leadStatusLabel(lead.status)}
          </span>
        </div>
      </header>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Panel title="Overview">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Fact
                label="Source"
                value={[friendly(lead.sourceType), lead.sourceDetail].filter(Boolean).join(" · ")}
              />
              <Fact
                label="Lead type"
                value={lead.inquiryType === "SELLER_LEAD" ? "Seller" : "Buyer"}
              />
              <Fact
                label="Intent"
                value={[friendly(lead.transaction), friendly(lead.category)]
                  .filter(Boolean)
                  .join(" · ")}
              />
              <Fact label="Buyer type" value={friendly(lead.buyerType)} />
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
                    "SELLER_LEAD",
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
          {lead.inquiryType === "SELLER_LEAD" ? (
            <Panel title="Seller Property">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-950 uppercase">
                      Seller Lead
                    </span>
                    <h3 className="font-display mt-2 text-lg font-bold text-slate-900">
                      {[lead.transaction, lead.category].filter(Boolean).join(" · ") ||
                        "Land Offering"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      {lead.districtName ?? "Gujarat"}{" "}
                      {lead.localityText ? `· ${lead.localityText}` : ""}
                    </p>
                  </div>
                  <Link href={createPropertyHref} className="button button-primary">
                    + Add Property
                  </Link>
                </div>
                {lead.notesInternal ? (
                  <p className="mt-3 text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-semibold text-slate-900">Seller Note: </span>
                    {lead.notesInternal}
                  </p>
                ) : null}
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <Fact
                    label="Rough area"
                    value={formatArea(
                      requirement?.minAreaValue ?? null,
                      requirement?.maxAreaValue ?? null,
                      requirement?.areaUnitLabel ?? null,
                    )}
                  />
                  <Fact
                    label="Expected price"
                    value={formatBudget(lead.budgetMin, lead.budgetMax)}
                  />
                  <Fact label="Offering notes" value={requirement?.notes ?? lead.notesInternal} />
                </dl>
              </div>

              {/* Linked Properties List */}
              <div className="mt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Properties for this seller ({workspace.sellerProperties?.length ?? 0})
                </h4>
                {workspace.sellerProperties && workspace.sellerProperties.length > 0 ? (
                  <div className="space-y-3">
                    {workspace.sellerProperties.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 bg-white hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <Link
                            href={`/admin/properties/${p.id}`}
                            className="font-bold text-[var(--brand-navy)] hover:underline"
                          >
                            {p.propertyCode} · {p.title || p.category}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {p.category} · {p.transaction} · Availability: {p.availability}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              p.publicationStatus === "PUBLISHED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {p.publicationStatus}
                          </span>
                          <Link
                            href={`/admin/properties/${p.id}`}
                            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Open →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 rounded-lg border border-dashed border-slate-200 text-center">
                    No property has been added for this seller yet. Use Add Property above to start
                    one.
                  </p>
                )}
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Private seller documents ({documents.length})
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Private by default. Uploading a file does not mark the property verified or ready
                  to publish.
                </p>
                <form
                  action={uploadSellerLeadDocumentsAction.bind(null, id)}
                  className="mt-4 grid gap-3 sm:grid-cols-[14rem_1fr_auto]"
                >
                  <Select
                    name="documentType"
                    label="Document tag"
                    value="OTHER"
                    options={[
                      "LAND_RECORDS",
                      "TITLE_DEED",
                      "NA_ORDER_LAYOUT",
                      "TP_ZONE_CERTIFICATE",
                      "VILLAGE_MAP_DEMARCATION",
                      "SOIL_WATER_ELECTRICITY",
                      "OTHER",
                    ]}
                  />
                  <label className="text-sm font-semibold">
                    Files
                    <input
                      className={input}
                      type="file"
                      name="documents"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      required
                    />
                  </label>
                  <button className="button button-primary self-end">Upload privately</button>
                </form>
                {documents.length ? (
                  <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {documents.map((document) => (
                      <li
                        key={document.id}
                        className="flex flex-wrap items-center justify-between gap-3 p-3 text-sm"
                      >
                        <div>
                          <strong>{document.originalFileName ?? document.documentType}</strong>
                          <p className="text-xs text-slate-500">
                            {document.documentType.replaceAll("_", " ")} ·{" "}
                            {formatFileSize(document.fileSizeBytes)} · {document.scanStatus}
                          </p>
                        </div>
                        <a
                          className="rounded-lg border border-slate-300 px-3 py-2 font-bold text-[var(--brand-navy)]"
                          href={`/api/admin/private-documents/${document.id}/download`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Open securely
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">No seller documents uploaded.</p>
                )}
              </div>
            </Panel>
          ) : (
            <>
              <Panel title="Requirement">
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
            </>
          )}
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
          <Panel title="Danger Zone">
            <p className="text-sm text-slate-600">
              Permanently remove this lead from the CRM pipeline, follow-ups, and active property matching.
            </p>
            <div className="mt-4">
              <DeleteLeadButton
                leadId={lead.id}
                leadName={lead.name}
                action={deleteLeadAction}
                variant="danger-button"
                buttonText="Delete lead permanently"
                className="w-full text-center"
              />
            </div>
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
            {labels[o] ?? (o ? friendly(o) : "Not set")}
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

function friendly(value: string | null | undefined) {
  return value
    ? value
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/^./, (letter) => letter.toUpperCase())
    : null;
}

function whatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

function formatArea(min: number | null, max: number | null, unit: string | null) {
  if (min === null && max === null) return "Not recorded";
  const suffix = unit ? ` ${unit}` : "";
  if (min !== null && max !== null) return `${min}–${max}${suffix}`;
  return `${min ?? max}${suffix}`;
}

function formatFileSize(bytes: number | null) {
  if (bytes === null) return "Unknown size";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function sellerPropertyDraftHref(
  lead: LeadWorkspace["lead"],
  requirement: LeadWorkspace["requirement"],
  districts: readonly Readonly<{ id: string; name: string }>[],
) {
  const params = new URLSearchParams({
    partyId: lead.partyId,
    sourceType: "SELLER_LEAD",
    sourceName: lead.leadReference,
    sourceReference: lead.id,
  });
  if (lead.category) params.set("category", lead.category);
  if (lead.transaction) params.set("transaction", lead.transaction);
  if (lead.localityText) params.set("localityText", lead.localityText);
  const district = districts.find((item) => item.name === lead.districtName);
  if (district) params.set("districtId", district.id);
  if (
    requirement &&
    requirement.minAreaValue !== null &&
    requirement.minAreaValue === requirement.maxAreaValue &&
    requirement.areaUnitId
  ) {
    params.set("areaValue", String(requirement.minAreaValue));
    params.set("areaUnitId", requirement.areaUnitId);
  }
  if (lead.budgetMin !== null && lead.budgetMax !== null) {
    if (lead.budgetMin === lead.budgetMax) {
      params.set("priceMode", "EXACT_TOTAL");
      params.set("priceAmount", String(lead.budgetMin));
    } else {
      params.set("priceMode", "PRICE_RANGE");
      params.set("priceMinimum", String(lead.budgetMin));
      params.set("priceMaximum", String(lead.budgetMax));
    }
  }
  return `/admin/properties/new?${params.toString()}`;
}
