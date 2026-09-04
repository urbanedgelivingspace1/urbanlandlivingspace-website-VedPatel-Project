"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type {
  AdminVerificationDetail,
  AdminVerificationCheck,
  VerificationFormState,
} from "@/features/verification/domain/contracts";
import { evidenceTypes } from "@/features/verification/domain/contracts";

type StatefulAction = (
  state: VerificationFormState,
  data: FormData,
) => Promise<VerificationFormState>;
type BoundAction = (state: VerificationFormState) => Promise<VerificationFormState>;
const EMPTY: VerificationFormState = { ok: false, message: "" };

type Props = Readonly<{
  detail: AdminVerificationDetail;
  initializeAction: BoundAction;
  transitionAction: StatefulAction;
  linkEvidenceAction: StatefulAction;
  advanceEvidenceAction: StatefulAction;
  applicabilityAction: StatefulAction;
  exceptionAction: StatefulAction;
  professionalReviewAction: StatefulAction;
  recordSourceAction: StatefulAction;
  retireEvidenceAction: StatefulAction;
  resolveExceptionAction: StatefulAction;
  updateProfessionalReviewAction: StatefulAction;
}>;

function Submit({ children }: Readonly<{ children: React.ReactNode }>) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="rounded-lg bg-[var(--brand-navy)] px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
    >
      {pending ? "Working…" : children}
    </button>
  );
}

function State({ value }: Readonly<{ value: VerificationFormState }>) {
  return value.message ? (
    <p role="status" className={`text-sm ${value.ok ? "text-emerald-700" : "text-red-700"}`}>
      {value.message}
    </p>
  ) : null;
}

export function VerificationWorkspace(props: Props) {
  const [initialization, initialize] = useActionState(props.initializeAction, EMPTY);
  const applicable = props.detail.checks.filter((check) => check.applicability === "APPLICABLE");
  const blocked = applicable.filter(
    (check) =>
      check.status === "FAILED" ||
      check.status === "REQUIRES_REVIEW" ||
      check.status === "EXPIRED" ||
      check.exceptions.some((exception) => exception.status === "OPEN"),
  );
  return (
    <div className="space-y-6">
      <section aria-label="Verification summary" className="grid gap-3 sm:grid-cols-4">
        <Metric label="Applicable" value={applicable.length} />
        <Metric
          label="Passed (scoped)"
          value={applicable.filter((check) => check.status.startsWith("PASSED")).length}
        />
        <Metric label="Blocked / review" value={blocked.length} />
        <Metric
          label="Public disclosures"
          value={applicable.filter((check) => check.publicVisible).length}
        />
      </section>
      <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        <strong>No universal verification or legal-clearance status exists.</strong> A completed
        check means only that its recorded scope was reviewed using its recorded evidence and
        reviewer on its recorded date. Publication evaluates only the required scoped checks, and
        gated public verification copy remains disabled without a lawyer-approved policy.
      </section>
      {props.detail.checks.length === 0 ? (
        <form
          action={initialize}
          className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center"
        >
          <h2 className="font-display text-xl font-semibold">
            Create the scoped verification plan
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">
            Category and transaction context select candidate checks. Applicability can then be
            refined without changing the check result state.
          </p>
          <div className="mt-4">
            <Submit>Initialize checks</Submit>
          </div>
          <State value={initialization} />
        </form>
      ) : (
        <div className="space-y-4">
          {props.detail.checks.map((check) => (
            <VerificationCheckCard key={check.id} check={check} {...props} />
          ))}
        </div>
      )}
      <SourceReferenceForm action={props.recordSourceAction} />
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-display text-xl font-semibold">Verification history</h2>
        {props.detail.history.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No workflow events recorded.</p>
        ) : (
          <ol className="mt-3 space-y-2 text-sm">
            {props.detail.history.slice(0, 30).map((item) => (
              <li key={item.id} className="border-l-2 border-slate-200 pl-3">
                <strong>{item.eventType.replaceAll("_", " ")}</strong>
                {item.fromStatus || item.toStatus
                  ? ` · ${item.fromStatus ?? "—"} → ${item.toStatus ?? "—"}`
                  : ""}
                <span className="block text-xs text-slate-500">
                  {new Date(item.occurredAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function VerificationCheckCard({
  check,
  detail,
  transitionAction,
  linkEvidenceAction,
  advanceEvidenceAction,
  applicabilityAction,
  exceptionAction,
  professionalReviewAction,
  retireEvidenceAction,
  resolveExceptionAction,
  updateProfessionalReviewAction,
}: Props & Readonly<{ check: AdminVerificationCheck }>) {
  const [transitionState, transition] = useActionState(transitionAction, EMPTY);
  const [evidenceState, linkEvidence] = useActionState(linkEvidenceAction, EMPTY);
  const [applicabilityState, setApplicability] = useActionState(applicabilityAction, EMPTY);
  const [exceptionState, recordException] = useActionState(exceptionAction, EMPTY);
  const [professionalState, requestProfessional] = useActionState(professionalReviewAction, EMPTY);
  const nextStatuses = transitionsFor(check.status);
  return (
    <article
      className="rounded-xl border border-slate-200 bg-white p-5"
      aria-labelledby={`check-${check.id}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-widest text-[var(--brand-gold-deep)] uppercase">
            {check.definition.categoryScope ?? "ALL CATEGORIES"} ·{" "}
            {check.definition.sourceClass.replaceAll("_", " ")}
          </p>
          <h2 id={`check-${check.id}`} className="font-display text-xl font-semibold">
            {check.definition.name}
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">{check.definition.description}</p>
        </div>
        <div className="flex gap-2 text-xs font-bold">
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {check.applicability.replaceAll("_", " ")}
          </span>
          <span className={`rounded-full px-3 py-1 ${statusTone(check.status)}`}>
            {check.status.replaceAll("_", " ")}
          </span>
        </div>
      </header>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Datum
          label="Minimum evidence"
          value={check.definition.minimumProvenance.replaceAll("_", " ")}
        />
        <Datum label="Risk if failed" value={check.definition.riskIfFailed} />
        <Datum
          label="Reviewer / date"
          value={
            check.reviewedAt ? new Date(check.reviewedAt).toLocaleDateString() : "Not reviewed"
          }
        />
        <Datum
          label="Recheck"
          value={check.recheckAt ? new Date(check.recheckAt).toLocaleDateString() : "Not scheduled"}
        />
      </dl>
      {check.scope ? (
        <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
          <strong>Scope:</strong> {check.scope}
        </p>
      ) : null}
      {check.limitations ? (
        <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm">
          <strong>Limitation:</strong> {check.limitations}
        </p>
      ) : null}
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <form
          action={setApplicability}
          className="space-y-2 rounded-lg border border-slate-200 p-3"
        >
          <h3 className="font-semibold">Applicability</h3>
          <input type="hidden" name="verificationId" value={check.id} />
          <select
            name="applicability"
            defaultValue={check.applicability}
            className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
          >
            <option value="APPLICABLE">Applicable</option>
            <option value="NOT_APPLICABLE">Not applicable</option>
            <option value="UNDETERMINED">Undetermined</option>
          </select>
          <input
            name="reason"
            required
            minLength={10}
            defaultValue={check.applicabilityReason ?? ""}
            placeholder="Category, transaction, jurisdiction, facts, or evidence reason"
            className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
          />
          <Submit>Save applicability</Submit>
          <State value={applicabilityState} />
        </form>
        {check.applicability === "APPLICABLE" && nextStatuses.length ? (
          <form action={transition} className="space-y-2 rounded-lg border border-slate-200 p-3">
            <h3 className="font-semibold">Scoped result</h3>
            <input type="hidden" name="verificationId" value={check.id} />
            <select
              name="target"
              className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
            >
              {nextStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <textarea
              name="scopeStatement"
              defaultValue={check.scope ?? ""}
              placeholder="What records, parcel, use, transaction, date range, and source were checked?"
              className="min-h-20 w-full rounded border border-slate-300 px-2 py-2 text-sm"
            />
            <textarea
              name="limitations"
              defaultValue={check.limitations ?? ""}
              placeholder="Explicit limitations"
              className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
            />
            <textarea
              name="notes"
              defaultValue={check.reviewerNotes ?? ""}
              placeholder="Internal notes / exception context"
              className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
            />
            <div className="grid gap-2 sm:grid-cols-3">
              <select
                name="riskLevel"
                defaultValue={check.riskLevel}
                className="rounded border border-slate-300 px-2 py-2 text-sm"
              >
                {["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((risk) => (
                  <option key={risk}>{risk}</option>
                ))}
              </select>
              <input
                name="recheckAt"
                type="datetime-local"
                aria-label="Recheck date"
                className="rounded border border-slate-300 px-2 py-2 text-sm"
              />
              <select
                name="referralType"
                defaultValue={check.referralType ?? ""}
                aria-label="Referral type"
                className="rounded border border-slate-300 px-2 py-2 text-sm"
              >
                <option value="">No referral type</option>
                {["LAWYER", "SURVEYOR", "PLANNER", "ENGINEER", "OTHER"].map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
            <label className="flex gap-2 text-sm">
              <input
                name="referralRequired"
                type="checkbox"
                defaultChecked={check.referralRequired}
              />
              Professional referral required
            </label>
            <Submit>Apply guarded transition</Submit>
            <State value={transitionState} />
          </form>
        ) : null}
      </div>
      {check.applicability === "APPLICABLE" ? (
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <EvidencePanel
            check={check}
            documents={detail.documents}
            sources={detail.sources}
            action={linkEvidence}
            state={evidenceState}
            advanceAction={advanceEvidenceAction}
            retireAction={retireEvidenceAction}
          />
          <div className="space-y-4">
            <ExceptionPanel
              check={check}
              action={recordException}
              state={exceptionState}
              resolveAction={resolveExceptionAction}
            />
            <ProfessionalPanel
              check={check}
              action={requestProfessional}
              state={professionalState}
              updateAction={updateProfessionalReviewAction}
            />
          </div>
        </div>
      ) : null}
      <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
        <h3 className="font-semibold">Public disclosure</h3>
        <p className="mt-1">
          {check.publicCopyApproved
            ? check.publicDisclosureEligible
              ? "Eligible under an approved scoped copy policy."
              : "Not eligible under current result/evidence/exception rules."
            : "Blocked: lawyer-approved public-copy policy is intentionally absent."}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Private evidence, source metadata, reviewer notes, professional identity, risk, owner PII
          and coordinates never enter the public projection.
        </p>
      </section>
    </article>
  );
}

function EvidencePanel({
  check,
  documents,
  sources,
  action,
  state,
  advanceAction,
  retireAction,
}: Readonly<{
  check: AdminVerificationCheck;
  documents: AdminVerificationDetail["documents"];
  sources: AdminVerificationDetail["sources"];
  action: (data: FormData) => void;
  state: VerificationFormState;
  advanceAction: StatefulAction;
  retireAction: StatefulAction;
}>) {
  return (
    <section className="rounded-lg border border-slate-200 p-3">
      <h3 className="font-semibold">Evidence and provenance</h3>
      {check.evidence.length ? (
        <ul className="my-3 space-y-2 text-sm">
          {check.evidence.map((item) => (
            <EvidenceRow
              key={item.id}
              item={item}
              advanceAction={advanceAction}
              retireAction={retireAction}
              professionalReviews={check.professionalReviews}
            />
          ))}
        </ul>
      ) : (
        <p className="my-2 text-sm text-slate-500">
          No evidence linked. An upload alone does not satisfy a check.
        </p>
      )}
      <form action={action} className="space-y-2">
        <input type="hidden" name="verificationId" value={check.id} />
        <div className="grid gap-2 sm:grid-cols-2">
          <select
            name="privateDocumentId"
            aria-label="Private document"
            className="rounded border border-slate-300 px-2 py-2 text-sm"
          >
            <option value="">No private document</option>
            {documents.map((document) => (
              <option
                key={document.id}
                value={document.id}
                disabled={document.scanStatus !== "CLEAN" || Boolean(document.archivedAt)}
              >
                {document.name ?? document.documentType} · {document.scanStatus}
              </option>
            ))}
          </select>
          <select
            name="sourceReferenceId"
            aria-label="Source reference"
            className="rounded border border-slate-300 px-2 py-2 text-sm"
          >
            <option value="">No source reference</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.authority} · {source.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <select name="evidenceType" className="rounded border border-slate-300 px-2 py-2 text-sm">
            {evidenceTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          <select name="sourceClass" className="rounded border border-slate-300 px-2 py-2 text-sm">
            {sourceClasses.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
        <input
          name="evidenceReference"
          placeholder="Evidence/reference number"
          className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
        />
        <input
          name="observedDate"
          aria-label="Evidence observed date"
          type="date"
          className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
        />
        <textarea
          name="evidenceNotes"
          placeholder="Required for a recorded observation without a document/source"
          className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
        />
        <label className="flex gap-2 text-sm">
          <input name="supportsCheck" type="checkbox" defaultChecked />
          Supports this scoped check
        </label>
        <Submit>Link as received</Submit>
        <State value={state} />
      </form>
    </section>
  );
}

function EvidenceRow({
  item,
  advanceAction,
  retireAction,
  professionalReviews,
}: Readonly<{
  item: AdminVerificationCheck["evidence"][number];
  advanceAction: StatefulAction;
  retireAction: StatefulAction;
  professionalReviews: AdminVerificationCheck["professionalReviews"];
}>) {
  const [advanceState, advance] = useActionState(advanceAction, EMPTY);
  const [retireState, retire] = useActionState(retireAction, EMPTY);
  const next =
    item.provenance === "RECEIVED"
      ? "REVIEWED"
      : item.provenance === "REVIEWED"
        ? "SOURCE_VERIFIED"
        : item.provenance === "SOURCE_VERIFIED"
          ? "PROFESSIONALLY_REVIEWED"
          : null;
  return (
    <li className="rounded bg-slate-50 p-2">
      <strong>{item.evidenceType.replaceAll("_", " ")}</strong> ·{" "}
      {item.provenance.replaceAll("_", " ")}
      <span className="block text-xs text-slate-500">
        {item.privateDocumentName ?? item.sourceName ?? item.reference ?? "Recorded observation"} ·{" "}
        {item.sourceClass.replaceAll("_", " ")}
      </span>
      {next ? (
        <form action={advance} className="mt-2 flex flex-wrap gap-2">
          <input type="hidden" name="evidenceId" value={item.id} />
          <input type="hidden" name="state" value={next} />
          {next === "PROFESSIONALLY_REVIEWED" ? (
            <select
              name="professionalReviewId"
              aria-label="Completed professional review"
              className="rounded border border-slate-300 px-2 text-xs"
            >
              <option value="">Select completed review</option>
              {professionalReviews
                .filter((review) => review.status === "COMPLETED")
                .map((review) => (
                  <option key={review.id} value={review.id}>
                    {review.professionalType} · {review.reviewDate}
                  </option>
                ))}
            </select>
          ) : null}
          <button className="rounded border border-slate-300 px-2 py-1 text-xs font-bold">
            Advance to {next.replaceAll("_", " ")}
          </button>
          <State value={advanceState} />
        </form>
      ) : null}
      {!["SUPERSEDED", "REVOKED"].includes(item.provenance) ? (
        <form action={retire} className="mt-2 flex gap-2">
          <input type="hidden" name="evidenceId" value={item.id} />
          <input
            name="reason"
            required
            minLength={10}
            placeholder="Revocation reason"
            className="min-w-0 flex-1 rounded border border-slate-300 px-2 text-xs"
          />
          <button className="rounded border border-red-300 px-2 py-1 text-xs font-bold text-red-800">
            Revoke
          </button>
          <State value={retireState} />
        </form>
      ) : null}
    </li>
  );
}

function ExceptionPanel({
  check,
  action,
  state,
  resolveAction,
}: Readonly<{
  check: AdminVerificationCheck;
  action: (data: FormData) => void;
  state: VerificationFormState;
  resolveAction: StatefulAction;
}>) {
  return (
    <section className="rounded-lg border border-slate-200 p-3">
      <h3 className="font-semibold">Exceptions</h3>
      {check.exceptions.map((exception) => (
        <ExceptionRow key={exception.id} exception={exception} action={resolveAction} />
      ))}
      <form action={action} className="mt-2 space-y-2">
        <input type="hidden" name="verificationId" value={check.id} />
        <select
          name="severity"
          className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
        >
          {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((risk) => (
            <option key={risk}>{risk}</option>
          ))}
        </select>
        <textarea
          name="summary"
          required
          minLength={10}
          placeholder="Specific mismatch, conflict, missing item, or risk"
          className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
        />
        <textarea
          name="limitation"
          placeholder="Limitation created by this exception"
          className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
        />
        <label className="flex gap-2 text-sm">
          <input type="checkbox" name="blocksPublicDisclosure" defaultChecked />
          Blocks public disclosure
        </label>
        <label className="flex gap-2 text-sm">
          <input type="checkbox" name="professionalReferralRequired" />
          Needs professional referral
        </label>
        <Submit>Record exception</Submit>
        <State value={state} />
      </form>
    </section>
  );
}

function ExceptionRow({
  exception,
  action,
}: Readonly<{ exception: AdminVerificationCheck["exceptions"][number]; action: StatefulAction }>) {
  const [state, formAction] = useActionState(action, EMPTY);
  return (
    <div className="mt-2 rounded bg-amber-50 p-2 text-sm">
      <strong>
        {exception.severity} · {exception.status}
      </strong>
      <p>{exception.summary}</p>
      {exception.status === "OPEN" ? (
        <form action={formAction} className="mt-2 space-y-2">
          <input type="hidden" name="exceptionId" value={exception.id} />
          <select
            name="resolutionStatus"
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          >
            <option value="RESOLVED">Resolved</option>
            <option value="ACCEPTED_LIMITATION">Accepted limitation</option>
          </select>
          <input
            name="resolution"
            required
            minLength={10}
            placeholder="Resolution / accepted limitation"
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
          />
          <button className="rounded border border-slate-300 px-2 py-1 text-xs font-bold">
            Record disposition
          </button>
          <State value={state} />
        </form>
      ) : null}
    </div>
  );
}

function ProfessionalPanel({
  check,
  action,
  state,
  updateAction,
}: Readonly<{
  check: AdminVerificationCheck;
  action: (data: FormData) => void;
  state: VerificationFormState;
  updateAction: StatefulAction;
}>) {
  return (
    <section className="rounded-lg border border-slate-200 p-3">
      <h3 className="font-semibold">Professional review</h3>
      {check.professionalReviews.map((review) => (
        <ProfessionalRow key={review.id} review={review} action={updateAction} />
      ))}
      <form action={action} className="mt-2 space-y-2">
        <input type="hidden" name="verificationId" value={check.id} />
        <select
          name="professionalType"
          className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
        >
          {["LAWYER", "SURVEYOR", "PLANNER", "ENGINEER", "OTHER"].map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
        <textarea
          name="professionalScope"
          required
          minLength={20}
          placeholder="Defined issue, material, parcel/use, and scope for the professional"
          className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
        />
        <Submit>Request scoped review</Submit>
        <State value={state} />
      </form>
    </section>
  );
}

function ProfessionalRow({
  review,
  action,
}: Readonly<{
  review: AdminVerificationCheck["professionalReviews"][number];
  action: StatefulAction;
}>) {
  const [state, formAction] = useActionState(action, EMPTY);
  return (
    <div className="mt-2 rounded bg-slate-50 p-2 text-sm">
      <strong>
        {review.professionalType} · {review.status.replaceAll("_", " ")}
      </strong>
      <p className="text-xs text-slate-600">{review.scope}</p>
      {!["SUPERSEDED"].includes(review.status) ? (
        <form action={formAction} className="mt-2 grid gap-2">
          <input type="hidden" name="professionalReviewId" value={review.id} />
          <select
            name="professionalStatus"
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          >
            {professionalTransitions(review.status).map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <input
            name="professionalName"
            placeholder="Qualified professional identity"
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          />
          <input
            name="professionalReference"
            placeholder="Professional reference"
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          />
          <textarea
            name="professionalOutcome"
            placeholder="Scoped outcome (required to complete)"
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          />
          <textarea
            name="professionalLimitations"
            placeholder="Conditions / limitations"
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          />
          <input
            name="professionalReviewDate"
            aria-label="Professional review date"
            type="date"
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          />
          <button className="w-fit rounded border border-slate-300 px-2 py-1 text-xs font-bold">
            Update professional review
          </button>
          <State value={state} />
        </form>
      ) : null}
    </div>
  );
}

function SourceReferenceForm({ action }: Readonly<{ action: StatefulAction }>) {
  const [state, formAction] = useActionState(action, EMPTY);
  return (
    <details className="rounded-xl border border-slate-200 bg-white p-5">
      <summary className="cursor-pointer font-display text-xl font-semibold">
        Record a verification source reference
      </summary>
      <form action={formAction} className="mt-4 grid gap-2 sm:grid-cols-2">
        <select name="sourceClass" className="rounded border border-slate-300 px-2 py-2 text-sm">
          {sourceClasses.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
        <input
          name="authorityName"
          required
          placeholder="Authority / professional source"
          className="rounded border border-slate-300 px-2 py-2 text-sm"
        />
        <input
          name="sourceSystem"
          required
          placeholder="Exact system / portal / process"
          className="rounded border border-slate-300 px-2 py-2 text-sm"
        />
        <input
          name="sourceName"
          required
          placeholder="Document or service name"
          className="rounded border border-slate-300 px-2 py-2 text-sm"
        />
        <input
          name="officialUrl"
          type="url"
          placeholder="Official HTTPS URL (if applicable)"
          className="rounded border border-slate-300 px-2 py-2 text-sm"
        />
        <input
          name="referenceNumber"
          placeholder="Reference number"
          className="rounded border border-slate-300 px-2 py-2 text-sm"
        />
        <input
          name="recordIdentifier"
          placeholder="Record identifier"
          className="rounded border border-slate-300 px-2 py-2 text-sm"
        />
        <input
          name="sourceNotes"
          placeholder="Internal retrieval/certification notes"
          className="rounded border border-slate-300 px-2 py-2 text-sm"
        />
        <div>
          <Submit>Record source</Submit>
        </div>
        <State value={state} />
      </form>
    </details>
  );
}

const sourceClasses = [
  "LEGAL_OFFICIAL_REQUIREMENT",
  "OFFICIAL_ADMINISTRATIVE_PRACTICE",
  "PROFESSIONAL_DUE_DILIGENCE",
  "URBANEDGE_OPERATIONAL_POLICY",
] as const;
function transitionsFor(status: AdminVerificationCheck["status"]) {
  const map = {
    NOT_STARTED: ["IN_REVIEW"],
    IN_REVIEW: ["PASSED", "PASSED_WITH_NOTE", "FAILED", "REQUIRES_REVIEW"],
    PASSED: ["EXPIRED", "REQUIRES_REVIEW"],
    PASSED_WITH_NOTE: ["EXPIRED", "REQUIRES_REVIEW"],
    FAILED: ["IN_REVIEW"],
    REQUIRES_REVIEW: ["IN_REVIEW", "FAILED"],
    EXPIRED: ["IN_REVIEW"],
  } as const;
  return map[status];
}
function professionalTransitions(
  status: AdminVerificationCheck["professionalReviews"][number]["status"],
) {
  const map: Partial<Record<typeof status, readonly string[]>> = {
    REQUESTED: ["MATERIALS_PENDING"],
    MATERIALS_PENDING: ["IN_REVIEW"],
    IN_REVIEW: ["COMPLETED", "PARTIALLY_COMPLETED", "REQUIRES_MORE_INFORMATION"],
    PARTIALLY_COMPLETED: ["IN_REVIEW"],
    REQUIRES_MORE_INFORMATION: ["MATERIALS_PENDING"],
    COMPLETED: ["SUPERSEDED", "REQUIRES_REVIEW"],
  };
  return map[status] ?? [];
}
function statusTone(status: string) {
  return status.startsWith("PASSED")
    ? "bg-emerald-100 text-emerald-900"
    : ["FAILED", "REQUIRES_REVIEW", "EXPIRED"].includes(status)
      ? "bg-red-100 text-red-900"
      : "bg-slate-100 text-slate-800";
}
function Metric({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
function Datum({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <dt className="text-xs font-bold text-slate-500 uppercase">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
