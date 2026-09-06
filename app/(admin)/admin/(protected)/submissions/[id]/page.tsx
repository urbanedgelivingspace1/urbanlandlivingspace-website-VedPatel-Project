import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatIndiaDateTime } from "@/features/crm/domain/follow-ups";
import type { OwnerSubmissionStatus } from "@/features/owner-submissions/domain/contracts";
import { ownerSubmissionMachine } from "@/features/workflows/domain/state-machines";
import { getOwnerSubmissionWorkspace } from "@/server/services/owner-submissions";

import {
  addOwnerSubmissionNoteAction,
  assignOwnerSubmissionAction,
  transitionOwnerSubmissionAction,
} from "../actions";

export const metadata: Metadata = { title: "Owner submission" };

function JsonClaims({ value }: Readonly<{ value: unknown }>) {
  const record =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return Object.keys(record).length ? (
    <dl className="grid gap-3 sm:grid-cols-2">
      {Object.entries(record).map(([key, item]) => (
        <div key={key}>
          <dt className="text-xs font-bold uppercase text-slate-500">
            {key.replaceAll(/([A-Z])/g, " $1")}
          </dt>
          <dd className="mt-1">{String(item)}</dd>
        </div>
      ))}
    </dl>
  ) : (
    <p className="text-slate-500">No additional claims supplied.</p>
  );
}

export default async function OwnerSubmissionDetailPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}>) {
  const { id } = await params;
  const flash = await searchParams;
  const workspace = await getOwnerSubmissionWorkspace(id);
  if (!workspace) notFound();
  const {
    submission,
    party,
    district,
    areaUnit,
    documents,
    consents,
    events,
    convertedProperty,
    assignedAdmin,
    duplicateSubmissions,
    possibleProperties,
    activeAdmins,
  } = workspace;
  const transitions = ownerSubmissionMachine[
    submission.status as OwnerSubmissionStatus
  ] as readonly OwnerSubmissionStatus[];
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link className="text-sm font-semibold text-slate-600" href="/admin/submissions">
            ← Owner submissions
          </Link>
          <h1 className="font-display mt-2 text-4xl font-semibold">
            {submission.submission_reference}
          </h1>
          <p className="mt-2 text-slate-600">
            Private owner claim · {submission.status.replaceAll("_", " ")}
          </p>
        </div>
        {submission.status === "APPROVED" ? (
          <Link className="button button-primary" href={`/admin/submissions/${id}/convert`}>
            Convert to draft
          </Link>
        ) : null}
      </div>
      {flash.saved ? (
        <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
          {flash.saved}
        </p>
      ) : null}
      {flash.error ? (
        <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-red-900">
          {flash.error}
        </p>
      ) : null}
      {convertedProperty ? (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <strong>Converted draft:</strong>{" "}
          <Link className="underline" href={`/admin/properties/${convertedProperty.id}`}>
            {convertedProperty.property_code}
          </Link>{" "}
          · {convertedProperty.publication_status}
        </div>
      ) : null}
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <div className="space-y-6">
          {duplicateSubmissions.length || possibleProperties.length ? (
            <article className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
              <h2 className="font-display text-2xl">Possible duplicates — review only</h2>
              <p className="mt-2 text-sm">
                Similarity never merges records or blocks a legitimate corrected submission
                automatically.
              </p>
              <ul className="mt-4 space-y-3">
                {duplicateSubmissions.map((candidate) => (
                  <li key={candidate.id}>
                    <Link
                      className="font-bold underline"
                      href={`/admin/submissions/${candidate.id}`}
                    >
                      {candidate.submission_reference}
                    </Link>
                    <span className="ml-2 text-sm">{candidate.signals.join(" · ")}</span>
                  </li>
                ))}
                {possibleProperties.map((property) => (
                  <li key={property.id}>
                    <Link className="font-bold underline" href={`/admin/properties/${property.id}`}>
                      {property.property_code}
                    </Link>
                    <span className="ml-2 text-sm">
                      {property.listing_title} · Same owner/contact
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-display text-2xl">Owner and request</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase text-slate-500">Owner</dt>
                <dd>{party?.display_name}</dd>
                <dd>{party?.phone}</dd>
                <dd>{party?.email ?? "No email"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase text-slate-500">
                  Relationship / contact
                </dt>
                <dd>{submission.owner_relationship.replaceAll("_", " ")}</dd>
                <dd>{submission.preferred_contact}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase text-slate-500">Land</dt>
                <dd>
                  {submission.owner_intent} · {submission.land_category}
                </dd>
                <dd>
                  {submission.approximate_area_value} {areaUnit?.symbol ?? areaUnit?.display_name}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase text-slate-500">Location</dt>
                <dd>
                  {submission.village_text}, {submission.taluka_text}, {district?.name}
                </dd>
                <dd>Owner preference: {submission.location_visibility_preference}</dd>
              </div>
            </dl>
            <p className="mt-5 whitespace-pre-wrap leading-7">{submission.source_description}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-display text-2xl">Owner-provided claims</h2>
            <div className="mt-4">
              <JsonClaims value={submission.category_claims} />
            </div>
            <p className="mt-5 text-sm text-amber-800">
              Unverified input. Do not use as a verification outcome or public statement without
              review.
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-display text-2xl">Private attachments</h2>
            <ul className="mt-4 divide-y divide-slate-200">
              {documents.map((document) => (
                <li className="flex items-center justify-between gap-4 py-3" key={document.id}>
                  <div>
                    <strong>{document.original_file_name ?? document.document_type}</strong>
                    <span className="block text-xs text-slate-500">
                      {document.mime_type} · {document.scan_status}
                    </span>
                  </div>
                  {document.scan_status === "CLEAN" ? (
                    <a
                      className="button button-outline"
                      href={`/admin/submissions/${id}/documents/${document.id}`}
                    >
                      Download (60s)
                    </a>
                  ) : (
                    <span className="text-sm font-bold text-amber-700">Quarantined</span>
                  )}
                </li>
              ))}
            </ul>
            {!documents.length ? <p className="mt-3 text-slate-500">No attachments.</p> : null}
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-display text-2xl">Timeline</h2>
            <ol className="mt-4 space-y-4">
              {events.map((event) => (
                <li key={event.id} className="border-l-2 border-slate-200 pl-4">
                  <strong>{event.event_type.replaceAll("_", " ")}</strong>
                  <span className="ml-2 text-xs text-slate-500">
                    {formatIndiaDateTime(event.occurred_at)}
                  </span>
                  <p className="text-sm text-slate-600">
                    {event.from_status
                      ? `${event.from_status} → ${event.to_status}`
                      : event.to_status}
                  </p>
                  {event.note ? <p className="mt-1 whitespace-pre-wrap">{event.note}</p> : null}
                </li>
              ))}
            </ol>
          </article>
        </div>
        <aside className="space-y-6">
          <form
            action={assignOwnerSubmissionAction.bind(null, id)}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <h2 className="font-display text-xl">Review assignment</h2>
            <p className="mt-1 text-sm text-slate-600">
              Current: {assignedAdmin?.display_name ?? "Unassigned"}
            </p>
            <input type="hidden" name="expectedVersion" value={submission.version} />
            <select
              className="mt-4 w-full rounded-lg border border-slate-300 p-2"
              name="assignedTo"
              defaultValue={submission.assigned_to ?? ""}
            >
              <option value="">Unassigned</option>
              {activeAdmins.map((admin) => (
                <option key={admin.user_id} value={admin.user_id}>
                  {admin.display_name}
                </option>
              ))}
            </select>
            <button className="button button-outline mt-3" type="submit">
              Update assignment
            </button>
          </form>
          <form
            action={transitionOwnerSubmissionAction.bind(null, id)}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <h2 className="font-display text-xl">Move workflow</h2>
            <input type="hidden" name="expectedVersion" value={submission.version} />
            <label className="mt-4 grid gap-1 text-sm font-semibold">
              Next status
              <select name="nextStatus" required className="rounded-lg border border-slate-300 p-2">
                <option value="">Choose</option>
                {transitions
                  .filter((status) => status !== "CONVERTED")
                  .map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
              </select>
            </label>
            <label className="mt-3 grid gap-1 text-sm font-semibold">
              Private note
              <textarea
                className="rounded-lg border border-slate-300 p-2"
                name="note"
                rows={4}
                maxLength={5000}
              />
            </label>
            <label className="mt-3 grid gap-1 text-sm font-semibold">
              Next action (optional)
              <input
                className="rounded-lg border border-slate-300 p-2"
                name="nextActionAt"
                type="datetime-local"
              />
            </label>
            <button className="button button-primary mt-4" type="submit">
              Record transition
            </button>
          </form>
          <form
            action={addOwnerSubmissionNoteAction.bind(null, id)}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <h2 className="font-display text-xl">Add private note</h2>
            <input type="hidden" name="expectedVersion" value={submission.version} />
            <textarea
              className="mt-4 w-full rounded-lg border border-slate-300 p-2"
              name="note"
              required
              minLength={2}
              maxLength={5000}
              rows={5}
            />
            <button className="button button-outline mt-3" type="submit">
              Add note
            </button>
          </form>
          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-display text-xl">Consent record</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {consents.map((consent) => (
                <li key={consent.purpose}>
                  ✓ {consent.purpose.replaceAll("_", " ")}
                  <span className="block text-xs text-slate-500">
                    {consent.privacy_notice_version}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </aside>
      </div>
    </section>
  );
}
