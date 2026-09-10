"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import type {
  AdminVerificationCheck,
  AdminVerificationDetail,
  VerificationFormState,
} from "@/features/verification/domain/contracts";
import { evidenceTypes } from "@/features/verification/domain/contracts";
import {
  formatEvidenceTypeLabel,
  formatProvenanceLabel,
  formatStatusLabel,
  getCheckGuidance,
  getCheckNextAction,
} from "@/features/verification/domain/guided-verification-config";
import {
  CHECK_SCOPE_TEMPLATES,
  categorizeVerificationChecks,
  isCheckRelevantForCategory,
} from "@/features/verification/domain/publication-gate-rules";

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
  uploadDocumentAction?: StatefulAction;
}>;

function Submit({
  children,
  className = "",
  disabled = false,
}: Readonly<{ children: React.ReactNode; className?: string; disabled?: boolean }>) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={disabled || pending}
      className={`rounded-lg bg-[var(--brand-navy)] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {pending ? "Saving…" : children}
    </button>
  );
}

function StateNotice({ value }: Readonly<{ value: VerificationFormState }>) {
  return value.message ? (
    <p
      role="status"
      className={`rounded-md p-2 text-xs font-medium ${
        value.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
      }`}
    >
      {value.message}
    </p>
  ) : null;
}

export function VerificationWorkspace(props: Props) {
  const [initialization, initialize] = useActionState(props.initializeAction, EMPTY);
  const [showLegalNotice, setShowLegalNotice] = useState(false);
  const [showOptionalChecks, setShowOptionalChecks] = useState(false);
  const [activeCheckId, setActiveCheckId] = useState<string | null>(null);

  const property = props.detail.property;
  const propertyCategory = property.category;
  const relevantChecks = props.detail.checks.filter((check) =>
    isCheckRelevantForCategory(check.definition.categoryScope, propertyCategory),
  );
  const applicableChecks = relevantChecks.filter((check) => check.applicability === "APPLICABLE");
  const completedChecks = applicableChecks.filter((c) => c.status.startsWith("PASSED"));
  const issueChecks = applicableChecks.filter(
    (c) =>
      c.status === "FAILED" ||
      c.status === "REQUIRES_REVIEW" ||
      c.status === "EXPIRED" ||
      c.exceptions.some((e) => e.status === "OPEN"),
  );

  const { publicationGateChecks, diligenceChecks } = categorizeVerificationChecks(
    relevantChecks,
    propertyCategory,
    property.title,
  );

  // M20 keeps this field for contract compatibility; every relevant check is
  // classified as optional diligence and none can gate marketing publication.
  void publicationGateChecks;

  return (
    <div className="space-y-6">
      {/* 1. Executive Metrics Bar */}
      <section aria-label="Verification summary" className="grid gap-3 sm:grid-cols-4">
        <Metric label="Relevant checks" value={applicableChecks.length} />
        <Metric label="Completed" value={completedChecks.length} accent="text-emerald-700" />
        <Metric
          label="Needs attention"
          value={issueChecks.length}
          accent={issueChecks.length > 0 ? "text-amber-700" : "text-slate-700"}
        />
        <Metric
          label="Public statements"
          value={applicableChecks.filter((c) => c.publicVisible).length}
        />
      </section>

      {/* 2. Contextual Help & Statutory Disclosure */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium text-slate-800">
            Verification helps UrbanEdge record what we actually checked. It does NOT mean the
            entire property has a guaranteed clear title.
          </p>
          <button
            type="button"
            onClick={() => setShowLegalNotice(!showLegalNotice)}
            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline"
            aria-expanded={showLegalNotice}
          >
            {showLegalNotice ? "Hide details" : "Learn more"}
          </button>
        </div>
        {showLegalNotice && (
          <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-600 space-y-1">
            <p>
              A completed check means only that its recorded scope was reviewed using its recorded
              evidence and reviewer on its recorded date.
            </p>
            <p>
              Marketing publication is evaluated separately from this workspace. Public verification
              copy remains disabled without a lawyer-approved policy.
            </p>
          </div>
        )}
      </section>

      {/* 3. Empty State: Check Initialization */}
      {props.detail.checks.length === 0 ? (
        <form
          action={initialize}
          className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center"
        >
          <h2 className="font-display text-xl font-semibold text-slate-900">
            Set up property verification requirements
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            Click below to initialize the standard verification checklist tailored for this{" "}
            <strong>{propertyCategory}</strong> property.
          </p>
          <div className="mt-5">
            <Submit>Set up verification checks</Submit>
          </div>
          <StateNotice value={initialization} />
        </form>
      ) : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Independent legal due diligence
            </h2>
            <p className="mt-1 text-sm text-slate-700">
              These checks preserve detailed review history and evidence when a transaction needs
              it. They are not required to market or publish the property.
            </p>
            <Link
              href={`/admin/properties/${property.id}?tab=review`}
              className="mt-3 inline-flex rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs font-bold text-blue-900"
            >
              Return to marketing readiness
            </Link>
          </section>

          {/* 6. Optional Due Diligence Section (Phase 6: Collapsed by Default) */}
          {diligenceChecks.length > 0 && (
            <section
              aria-labelledby="optional-diligence-heading"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 uppercase">
                    OPTIONAL DUE DILIGENCE
                  </span>
                  <h3
                    id="optional-diligence-heading"
                    className="mt-1 font-display text-xl font-bold text-slate-900"
                  >
                    Extended Diligence Checks
                  </h3>
                  <p className="text-sm text-slate-600">
                    Not required to publish. Complete these when appropriate during active
                    marketing, buyer diligence or legal review.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowOptionalChecks(!showOptionalChecks)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  aria-expanded={showOptionalChecks}
                >
                  {showOptionalChecks
                    ? "Hide optional checks"
                    : `View ${diligenceChecks.length} optional checks`}
                </button>
              </div>

              {/* Collapsed Compact Rows when opened */}
              {showOptionalChecks && (
                <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                  {diligenceChecks.map((check) => (
                    <GuidedVerificationCheckCard
                      key={check.id}
                      check={check}
                      isGateCheck={false}
                      isOpen={activeCheckId === check.id}
                      onToggleOpen={() =>
                        setActiveCheckId(activeCheckId === check.id ? null : check.id)
                      }
                      {...props}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 7. Official Source References Drawer */}
          <SourceReferenceForm action={props.recordSourceAction} />

          {/* 8. Verification History Log */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-display text-lg font-semibold text-slate-900">
              Verification history
            </h3>
            {props.detail.history.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No workflow events recorded.</p>
            ) : (
              <ol className="mt-3 space-y-2 text-sm">
                {props.detail.history.slice(0, 30).map((item) => (
                  <li key={item.id} className="border-l-2 border-slate-200 pl-3">
                    <strong>{item.eventType.replaceAll("_", " ")}</strong>
                    {item.fromStatus || item.toStatus
                      ? ` · ${item.fromStatus ? formatStatusLabel(item.fromStatus) : "—"} → ${item.toStatus ? formatStatusLabel(item.toStatus) : "—"}`
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
      )}
    </div>
  );
}

// =============================================================================
// GUIDED VERIFICATION CHECK CARD
// =============================================================================

function GuidedVerificationCheckCard({
  check,
  detail,
  isGateCheck,
  isOpen,
  onToggleOpen,
  transitionAction,
  linkEvidenceAction,
  advanceEvidenceAction,
  applicabilityAction,
  exceptionAction,
  professionalReviewAction,
  retireEvidenceAction,
  resolveExceptionAction,
  updateProfessionalReviewAction,
  uploadDocumentAction,
}: Props &
  Readonly<{
    check: AdminVerificationCheck;
    isGateCheck: boolean;
    isOpen: boolean;
    onToggleOpen: () => void;
  }>) {
  const [guidedStep, setGuidedStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [evidenceRef, setEvidenceRef] = useState<string>("");
  const [showUploadInline, setShowUploadInline] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<
    "REVIEWED" | "SOURCE_VERIFIED" | "PROFESSIONALLY_REVIEWED"
  >(check.definition.minimumProvenance === "SOURCE_VERIFIED" ? "SOURCE_VERIFIED" : "REVIEWED");
  const [selectedOutcome, setSelectedOutcome] = useState<
    "PASSED" | "PASSED_WITH_NOTE" | "IN_REVIEW" | "NOT_APPLICABLE"
  >("PASSED");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [transitionState, transition] = useActionState(transitionAction, EMPTY);
  const [evidenceState, linkEvidence] = useActionState(linkEvidenceAction, EMPTY);
  const [applicabilityState, setApplicability] = useActionState(applicabilityAction, EMPTY);
  const [exceptionState, recordException] = useActionState(exceptionAction, EMPTY);
  const [professionalState, requestProfessional] = useActionState(professionalReviewAction, EMPTY);

  const guidance = getCheckGuidance(check.definition.code);
  const nextAction = getCheckNextAction(check, isGateCheck);
  const isComplete = check.status === "PASSED" || check.status === "PASSED_WITH_NOTE";
  const defaultScope =
    check.scope || CHECK_SCOPE_TEMPLATES[check.definition.code] || guidance.shortSummary;

  // Active eligible evidence attached to this check
  const activeEvidence = check.evidence.filter(
    (e) => e.supportsCheck && !["SUPERSEDED", "REVOKED"].includes(e.provenance),
  );

  return (
    <article
      id={`check-card-${check.id}`}
      className={`rounded-2xl border bg-white transition-shadow ${
        isGateCheck ? "border-amber-200 shadow-xs" : "border-slate-200"
      }`}
      aria-labelledby={`check-heading-${check.id}`}
    >
      {/* ----------------- COLLAPSED SUMMARY VIEW ----------------- */}
      <div className="p-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-[var(--brand-gold-deep)] uppercase">
                {guidance.title}
              </span>
              {isGateCheck ? (
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 uppercase tracking-wide">
                  Required before publishing
                </span>
              ) : (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                  Optional due diligence
                </span>
              )}
            </div>

            <h4
              id={`check-heading-${check.id}`}
              className="font-display text-lg font-bold text-slate-900"
            >
              {check.definition.name}
            </h4>

            <p className="max-w-2xl text-sm text-slate-600">{guidance.shortSummary}</p>

            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="font-semibold text-slate-500">Status:</span>
              <span className={`rounded-full px-2.5 py-0.5 font-bold ${statusTone(check.status)}`}>
                {formatStatusLabel(check.status)}
              </span>
              {!isComplete && (
                <span className="font-medium text-amber-800">· {nextAction.text}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleOpen}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                isComplete
                  ? "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  : check.status === "NOT_STARTED"
                    ? "bg-[var(--brand-navy)] text-white hover:opacity-90"
                    : "bg-amber-600 text-white hover:bg-amber-700"
              }`}
              aria-expanded={isOpen}
            >
              {isOpen
                ? "Close"
                : isComplete
                  ? "View details"
                  : check.status === "NOT_STARTED"
                    ? "Start check"
                    : "Continue check"}
            </button>
          </div>
        </header>

        {/* Completed Check Badge Summary */}
        {isComplete && !isOpen && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-2.5 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <span className="font-bold">✓ Check completed</span>
              {check.reviewedAt && (
                <span className="text-emerald-800">
                  · {new Date(check.reviewedAt).toLocaleDateString()}
                </span>
              )}
              {activeEvidence[0] && (
                <span className="text-emerald-800">
                  · {formatProvenanceLabel(activeEvidence[0].provenance)}
                </span>
              )}
            </div>
            <span className="font-bold text-emerald-800">Publication requirement: COMPLETE</span>
          </div>
        )}
      </div>

      {/* ----------------- EXPANDED GUIDED WORKFLOW ----------------- */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-6">
          {/* Step Progress Tracker */}
          <nav
            aria-label="Check progression"
            className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4"
          >
            {[
              { num: 1 as const, label: "1. What to check" },
              { num: 2 as const, label: "2. Documents & proof" },
              { num: 3 as const, label: "3. How was it checked" },
              { num: 4 as const, label: "4. Review outcome" },
              { num: 5 as const, label: "5. Save review" },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setGuidedStep(s.num)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  guidedStep === s.num
                    ? "bg-[var(--brand-navy)] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>

          {/* STEP 1: EXPLAIN WHAT TO DO */}
          {guidedStep === 1 && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Step 1 of 5 · Understanding the check
              </span>
              <h5 className="font-display text-xl font-bold text-slate-900">{guidance.title}</h5>

              <div className="space-y-3 text-sm text-slate-700">
                <div>
                  <h6 className="font-bold text-slate-900">Why are we checking this?</h6>
                  <p className="mt-1 text-slate-600">{guidance.purpose}</p>
                </div>

                <div>
                  <h6 className="font-bold text-slate-900">What should you check?</h6>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-600">
                    {guidance.checklist.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h6 className="font-bold text-slate-900">What documents can you use?</h6>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-600">
                    {guidance.suggestedDocuments.map((doc, i) => (
                      <li key={i}>{doc}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setGuidedStep(2)}
                  className="rounded-lg bg-[var(--brand-navy)] px-4 py-2 text-sm font-bold text-white shadow-xs hover:opacity-90"
                >
                  Continue to proof →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DOCUMENTS / PROOF */}
          {guidedStep === 2 && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Step 2 of 5 · Add proof
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Required proof: {formatProvenanceLabel(check.definition.minimumProvenance)}
                </span>
              </div>

              <h5 className="font-display text-xl font-bold text-slate-900">Documents & proof</h5>

              {/* Attached Evidence List */}
              {activeEvidence.length > 0 ? (
                <div className="space-y-2">
                  <h6 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Currently linked proof ({activeEvidence.length})
                  </h6>
                  <ul className="space-y-2 text-sm">
                    {activeEvidence.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3"
                      >
                        <div>
                          <p className="font-bold text-slate-900">
                            {item.privateDocumentName ||
                              item.sourceName ||
                              item.reference ||
                              "Recorded observation"}
                          </p>
                          <p className="text-xs text-slate-600">
                            {formatEvidenceTypeLabel(item.evidenceType)} ·{" "}
                            <span className="font-semibold text-emerald-800">
                              {formatProvenanceLabel(item.provenance)}
                            </span>
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                          Proof attached
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                /* Actionable Empty State (Phase 12) */
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-950">
                  <p className="font-bold">No supporting document added yet.</p>
                  <p className="mt-1 text-xs text-amber-900">For this check, you can use:</p>
                  <ul className="mt-1 list-disc pl-5 text-xs text-amber-900">
                    {guidance.suggestedDocuments.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Select Existing Property Document Form */}
              <form action={linkEvidence} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                <input type="hidden" name="verificationId" value={check.id} />
                <h6 className="text-xs font-bold text-slate-700 uppercase">
                  Attach or link a document for this check
                </h6>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`doc-${check.id}`}
                      className="block text-xs font-semibold text-slate-600 mb-1"
                    >
                      Available property documents
                    </label>
                    <select
                      id={`doc-${check.id}`}
                      name="privateDocumentId"
                      value={selectedDocId}
                      onChange={(e) => {
                        const docId = e.target.value;
                        setSelectedDocId(docId);
                        const doc = detail.documents.find((d) => d.id === docId);
                        if (doc && !evidenceRef) {
                          setEvidenceRef(doc.name || doc.documentType);
                        }
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">
                        {detail.documents.length === 0
                          ? "No uploaded documents found for this property"
                          : `Choose an uploaded document (${detail.documents.length} available)…`}
                      </option>
                      {detail.documents.map((doc) => (
                        <option
                          key={doc.id}
                          value={doc.id}
                          disabled={doc.scanStatus !== "CLEAN" || Boolean(doc.archivedAt)}
                        >
                          {doc.name || doc.documentType} ({doc.documentType.replaceAll("_", " ")})
                          {doc.scanStatus !== "CLEAN" ? ` [${doc.scanStatus}]` : ""}
                        </option>
                      ))}
                    </select>
                    {detail.documents.length === 0 && (
                      <p className="mt-1 text-xs text-amber-700">
                        No private documents uploaded yet for this property.
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor={`source-${check.id}`}
                      className="block text-xs font-semibold text-slate-600 mb-1"
                    >
                      Official source reference (optional)
                    </label>
                    <select
                      id={`source-${check.id}`}
                      name="sourceReferenceId"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">No source reference (or select one…)</option>
                      {detail.sources.map((src) => (
                        <option key={src.id} value={src.id}>
                          {src.authority} · {src.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`type-${check.id}`}
                      className="block text-xs font-semibold text-slate-600 mb-1"
                    >
                      Document / evidence type
                    </label>
                    <select
                      id={`type-${check.id}`}
                      name="evidenceType"
                      defaultValue={check.definition.evidenceTypes[0] ?? "OFFICIAL_RECORD"}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      {evidenceTypes.map((type) => (
                        <option key={type} value={type}>
                          {formatEvidenceTypeLabel(type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor={`ref-${check.id}`}
                      className="block text-xs font-semibold text-slate-600 mb-1"
                    >
                      Document / reference number (optional)
                    </label>
                    <input
                      id={`ref-${check.id}`}
                      name="evidenceReference"
                      value={evidenceRef}
                      onChange={(e) => setEvidenceRef(e.target.value)}
                      placeholder="e.g. Survey 42/1 or Reg #9876"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`date-${check.id}`}
                      className="block text-xs font-semibold text-slate-600 mb-1"
                    >
                      Observed date
                    </label>
                    <input
                      id={`date-${check.id}`}
                      name="observedDate"
                      type="date"
                      defaultValue={new Date().toISOString().slice(0, 10)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`notes-${check.id}`}
                      className="block text-xs font-semibold text-slate-600 mb-1"
                    >
                      Internal review notes (optional)
                    </label>
                    <input
                      id={`notes-${check.id}`}
                      name="evidenceNotes"
                      placeholder="e.g. Verified against official land records"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Hidden safe defaults */}
                <input type="hidden" name="sourceClass" value={check.definition.sourceClass} />
                <input type="hidden" name="supportsCheck" value="on" />
                <input
                  type="hidden"
                  name="advanceTo"
                  value={
                    check.definition.minimumProvenance === "SOURCE_VERIFIED"
                      ? "SOURCE_VERIFIED"
                      : "REVIEWED"
                  }
                />

                <div className="flex items-center justify-between pt-2">
                  <Submit>Link document as proof</Submit>
                  <StateNotice value={evidenceState} />
                </div>
              </form>

              {uploadDocumentAction && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUploadInline(!showUploadInline)}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900"
                    >
                      {showUploadInline
                        ? "− Cancel document upload"
                        : "+ Upload a new private document for this property"}
                    </button>
                    <Link
                      href={`/admin/properties/${detail.property.id}/media`}
                      className="text-xs text-slate-500 hover:text-slate-700 underline"
                      target="_blank"
                    >
                      Manage private document storage ↗
                    </Link>
                  </div>
                  {showUploadInline && (
                    <UploadPrivateDocumentInlineForm action={uploadDocumentAction} />
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <button
                  type="button"
                  onClick={() => setGuidedStep(1)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setGuidedStep(3)}
                  className="rounded-lg bg-[var(--brand-navy)] px-4 py-2 text-sm font-bold text-white shadow-xs hover:opacity-90"
                >
                  Continue to review method →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: HOW WAS IT CHECKED? */}
          {guidedStep === 3 && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Step 3 of 5 · Review method
              </span>
              <h5 className="font-display text-xl font-bold text-slate-900">
                How did you check this information?
              </h5>

              <div className="space-y-3">
                {[
                  {
                    value: "REVIEWED",
                    label: "I reviewed the document",
                    desc: "Checked the owner-provided file or document copy directly.",
                  },
                  {
                    value: "SOURCE_VERIFIED",
                    label: "I checked it against an official source",
                    desc: "Verified against AnyRoR, Garvi, e-Courts, Revenue portal or certifying authority.",
                  },
                  {
                    value: "PROFESSIONALLY_REVIEWED",
                    label: "A qualified professional reviewed it",
                    desc: "A licensed advocate, surveyor, or certified engineer reviewed and signed off.",
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                      selectedMethod === opt.value
                        ? "border-indigo-600 bg-indigo-50/40"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`method-${check.id}`}
                      value={opt.value}
                      checked={selectedMethod === opt.value}
                      onChange={() =>
                        setSelectedMethod(
                          opt.value as "REVIEWED" | "SOURCE_VERIFIED" | "PROFESSIONALLY_REVIEWED",
                        )
                      }
                      className="mt-1"
                    />
                    <div>
                      <span className="block text-sm font-bold text-slate-900">{opt.label}</span>
                      <span className="text-xs text-slate-600">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Coaching Note: Guide rather than error (Prompt Phase 3 Step 3) */}
              {check.definition.minimumProvenance === "SOURCE_VERIFIED" &&
                selectedMethod === "REVIEWED" && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950">
                    <strong>Coaching note:</strong> This is saved, but one more step is required
                    before this check can allow publication: verify it against an official source
                    (such as AnyRoR or the official revenue portal).
                  </div>
                )}

              {/* If evidence is attached but still at RECEIVED, allow advancing it */}
              {activeEvidence.length > 0 &&
                activeEvidence.some((e) => e.provenance === "RECEIVED") && (
                  <EvidenceAdvanceQuickAction
                    evidence={activeEvidence.find((e) => e.provenance === "RECEIVED")!}
                    targetProvenance={selectedMethod}
                    advanceAction={advanceEvidenceAction}
                  />
                )}

              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <button
                  type="button"
                  onClick={() => setGuidedStep(2)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setGuidedStep(4)}
                  className="rounded-lg bg-[var(--brand-navy)] px-4 py-2 text-sm font-bold text-white shadow-xs hover:opacity-90"
                >
                  Continue to review outcome →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW OUTCOME */}
          {guidedStep === 4 && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Step 4 of 5 · Review outcome
              </span>
              <h5 className="font-display text-xl font-bold text-slate-900">What did you find?</h5>

              <div className="space-y-3">
                {[
                  {
                    value: "PASSED",
                    label: "✅ Everything looks consistent",
                    desc: "The documentation and details correspond properly to this property.",
                  },
                  {
                    value: "PASSED_WITH_NOTE",
                    label: "⚠️ Something needs attention",
                    desc: "Consistent overall, but there is a note, condition, or pending clarification.",
                  },
                  {
                    value: "IN_REVIEW",
                    label: "⏳ I cannot complete this check yet",
                    desc: "Awaiting documents, official confirmation, or ongoing review.",
                  },
                  {
                    value: "NOT_APPLICABLE",
                    label: "🚫 This check does not apply",
                    desc: "This check is not relevant to this property type or transaction.",
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                      selectedOutcome === opt.value
                        ? "border-indigo-600 bg-indigo-50/40"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`outcome-${check.id}`}
                      value={opt.value}
                      checked={selectedOutcome === opt.value}
                      onChange={() =>
                        setSelectedOutcome(
                          opt.value as
                            "PASSED" | "PASSED_WITH_NOTE" | "IN_REVIEW" | "NOT_APPLICABLE",
                        )
                      }
                      className="mt-1"
                    />
                    <div>
                      <span className="block text-sm font-bold text-slate-900">{opt.label}</span>
                      <span className="text-xs text-slate-600">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <button
                  type="button"
                  onClick={() => setGuidedStep(3)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setGuidedStep(5)}
                  className="rounded-lg bg-[var(--brand-navy)] px-4 py-2 text-sm font-bold text-white shadow-xs hover:opacity-90"
                >
                  Continue to summary & save →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SAVE REVIEW */}
          {guidedStep === 5 && (
            <form
              action={transition}
              className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
            >
              <span className="text-xs font-bold text-slate-500 uppercase">
                Step 5 of 5 · Review Summary & Confirmation
              </span>
              <h5 className="font-display text-xl font-bold text-slate-900">
                {guidance.title} Review Summary
              </h5>

              {/* Summary Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Document / proof:</span>
                  <span className="font-semibold text-slate-900">
                    {activeEvidence[0]?.privateDocumentName ??
                      activeEvidence[0]?.reference ??
                      "Attached property record"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">How was it checked:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedMethod === "SOURCE_VERIFIED"
                      ? "Checked against official source"
                      : selectedMethod === "PROFESSIONALLY_REVIEWED"
                        ? "Reviewed by a professional"
                        : "Document reviewed"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Review outcome:</span>
                  <span className="font-bold text-slate-900">
                    {selectedOutcome === "PASSED"
                      ? "✅ Everything looks consistent"
                      : selectedOutcome === "PASSED_WITH_NOTE"
                        ? "⚠️ Something needs attention"
                        : selectedOutcome === "IN_REVIEW"
                          ? "⏳ I cannot complete this check yet"
                          : "🚫 Does not apply"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reviewer:</span>
                  <span className="font-medium text-slate-800">Current administrator</span>
                </div>
              </div>

              {/* What are you checking (pre-filled scope statement) */}
              <div>
                <label
                  htmlFor={`scope-${check.id}`}
                  className="block text-xs font-bold text-slate-700 uppercase mb-1"
                >
                  What are you checking?
                </label>
                <textarea
                  id={`scope-${check.id}`}
                  name="scopeStatement"
                  defaultValue={defaultScope}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                  placeholder="Briefly describe what records, parcel, and sources were reviewed"
                />
              </div>

              {/* Note input if Something needs attention is selected */}
              {selectedOutcome === "PASSED_WITH_NOTE" && (
                <div>
                  <label
                    htmlFor={`notes-${check.id}`}
                    className="block text-xs font-bold text-slate-700 uppercase mb-1"
                  >
                    Note explaining what needs attention (required)
                  </label>
                  <textarea
                    id={`notes-${check.id}`}
                    name="notes"
                    defaultValue={check.reviewerNotes ?? ""}
                    required
                    rows={2}
                    placeholder="Describe the note, pending clarification, or condition"
                    className="w-full rounded-lg border border-amber-300 bg-amber-50/30 p-2.5 text-sm"
                  />
                </div>
              )}

              {/* Hidden State Values for Backend RPC */}
              <input type="hidden" name="verificationId" value={check.id} />
              <input type="hidden" name="currentStatus" value={check.status} />
              <input
                type="hidden"
                name="target"
                value={selectedOutcome === "NOT_APPLICABLE" ? "IN_REVIEW" : selectedOutcome}
              />
              <input type="hidden" name="riskLevel" value={check.riskLevel} />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGuidedStep(4)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onToggleOpen}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <Submit>Save review</Submit>
                </div>
              </div>
              <StateNotice value={transitionState} />
            </form>
          )}

          {/* ----------------- ADVANCED OPTIONS (Phase 7) ----------------- */}
          <div className="border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              aria-expanded={showAdvanced}
            >
              <span>{showAdvanced ? "▾" : "▸"}</span>
              <span>Advanced options (exceptions, referrals, relevance & disclosure)</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 grid gap-4 lg:grid-cols-2 rounded-xl border border-slate-200 bg-white p-4">
                {/* 1. Relevance / Applicability */}
                <form
                  action={setApplicability}
                  className="space-y-2 rounded-lg border border-slate-200 p-3"
                >
                  <h6 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Is this check relevant?
                  </h6>
                  <input type="hidden" name="verificationId" value={check.id} />
                  <select
                    name="applicability"
                    defaultValue={check.applicability}
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-sm"
                  >
                    <option value="APPLICABLE">Relevant for this property</option>
                    <option value="NOT_APPLICABLE">Not relevant</option>
                    <option value="UNDETERMINED">Under evaluation</option>
                  </select>
                  <input
                    name="reason"
                    required
                    minLength={10}
                    defaultValue={check.applicabilityReason ?? ""}
                    placeholder="Reason for applicability change"
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-sm"
                  />
                  <Submit>Save relevance</Submit>
                  <StateNotice value={applicabilityState} />
                </form>

                {/* 2. Record an Issue / Exception */}
                <form
                  action={recordException}
                  className="space-y-2 rounded-lg border border-slate-200 p-3"
                >
                  <h6 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Record an issue found
                  </h6>
                  <input type="hidden" name="verificationId" value={check.id} />
                  <select
                    name="severity"
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm"
                  >
                    <option value="LOW">Low severity</option>
                    <option value="MEDIUM">Medium severity</option>
                    <option value="HIGH">High severity</option>
                    <option value="CRITICAL">Critical severity</option>
                  </select>
                  <textarea
                    name="summary"
                    required
                    minLength={10}
                    placeholder="Describe specific issue or mismatch found"
                    className="w-full rounded border border-slate-300 p-2 text-sm"
                  />
                  <label className="flex gap-2 text-xs text-slate-700">
                    <input type="checkbox" name="blocksPublicDisclosure" defaultChecked />
                    Blocks public website disclosure
                  </label>
                  <Submit>Record issue</Submit>
                  <StateNotice value={exceptionState} />
                </form>

                {/* 3. Professional Review Request */}
                <form
                  action={requestProfessional}
                  className="space-y-2 rounded-lg border border-slate-200 p-3"
                >
                  <h6 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Professional help needed?
                  </h6>
                  <input type="hidden" name="verificationId" value={check.id} />
                  <select
                    name="professionalType"
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm"
                  >
                    <option value="LAWYER">Lawyer / Advocate</option>
                    <option value="SURVEYOR">Licensed Surveyor</option>
                    <option value="PLANNER">Urban Planner</option>
                    <option value="ENGINEER">Chartered Engineer</option>
                    <option value="OTHER">Other Professional</option>
                  </select>
                  <textarea
                    name="professionalScope"
                    required
                    minLength={20}
                    placeholder="Specific issue and material for the professional to review"
                    className="w-full rounded border border-slate-300 p-2 text-sm"
                  />
                  <Submit>Request professional review</Submit>
                  <StateNotice value={professionalState} />
                </form>

                {/* 4. Public Website Disclosure Status */}
                <div className="rounded-lg border border-slate-200 p-3 text-sm space-y-1">
                  <h6 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Public website statement
                  </h6>
                  <p className="text-xs text-slate-600">
                    {check.publicCopyApproved
                      ? check.publicDisclosureEligible
                        ? "Revenue records reviewed statement active on website."
                        : "Not eligible under current result/evidence/issue rules."
                      : "Public website: No verification statement will be shown."}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Private documents, notes, risk levels and owner PII are never displayed
                    publicly.
                  </p>
                </div>

                {/* 5. Existing Issues Resolution */}
                {check.exceptions.length > 0 && (
                  <div className="space-y-2 rounded-lg border border-slate-200 p-3 sm:col-span-2">
                    <h6 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Recorded issues ({check.exceptions.length})
                    </h6>
                    {check.exceptions.map((ex) => (
                      <ExceptionItem
                        key={ex.id}
                        exception={ex}
                        resolveAction={resolveExceptionAction}
                      />
                    ))}
                  </div>
                )}

                {/* 6. Existing Professional Reviews Update */}
                {check.professionalReviews.length > 0 && (
                  <div className="space-y-2 rounded-lg border border-slate-200 p-3 sm:col-span-2">
                    <h6 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Professional reviews ({check.professionalReviews.length})
                    </h6>
                    {check.professionalReviews.map((rev) => (
                      <ProfessionalItem
                        key={rev.id}
                        review={rev}
                        updateAction={updateProfessionalReviewAction}
                      />
                    ))}
                  </div>
                )}

                {/* 7. Revoke Evidence */}
                {activeEvidence.length > 0 && (
                  <div className="space-y-2 rounded-lg border border-slate-200 p-3 sm:col-span-2">
                    <h6 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Revoke proof
                    </h6>
                    {activeEvidence.map((ev) => (
                      <EvidenceRevokeItem
                        key={ev.id}
                        evidence={ev}
                        retireAction={retireEvidenceAction}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function ExceptionItem({
  exception,
  resolveAction,
}: Readonly<{
  exception: AdminVerificationCheck["exceptions"][number];
  resolveAction: StatefulAction;
}>) {
  const [state, formAction] = useActionState(resolveAction, EMPTY);
  return (
    <div className="rounded-lg bg-amber-50 p-3 text-xs text-slate-800 space-y-2">
      <div className="flex justify-between font-bold">
        <span>
          {exception.severity} severity · {exception.status}
        </span>
      </div>
      <p>{exception.summary}</p>
      {exception.status === "OPEN" && (
        <form action={formAction} className="mt-2 flex flex-wrap gap-2 items-center">
          <input type="hidden" name="exceptionId" value={exception.id} />
          <select
            name="resolutionStatus"
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
          >
            <option value="RESOLVED">Resolved</option>
            <option value="ACCEPTED_LIMITATION">Accepted limitation</option>
          </select>
          <input
            name="resolution"
            required
            minLength={10}
            placeholder="Resolution explanation"
            className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs min-w-40"
          />
          <button className="rounded bg-[var(--brand-navy)] px-2.5 py-1 text-xs font-bold text-white">
            Record resolution
          </button>
          <StateNotice value={state} />
        </form>
      )}
    </div>
  );
}

function ProfessionalItem({
  review,
  updateAction,
}: Readonly<{
  review: AdminVerificationCheck["professionalReviews"][number];
  updateAction: StatefulAction;
}>) {
  const [state, formAction] = useActionState(updateAction, EMPTY);
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-800 space-y-2">
      <div className="flex justify-between font-bold">
        <span>
          {review.professionalType} · {review.status.replaceAll("_", " ")}
        </span>
        {review.reviewDate && <span>{review.reviewDate}</span>}
      </div>
      <p className="text-slate-600">{review.scope}</p>
      {review.status !== "SUPERSEDED" && (
        <form action={formAction} className="mt-2 grid gap-2 sm:grid-cols-2">
          <input type="hidden" name="professionalReviewId" value={review.id} />
          <select
            name="professionalStatus"
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
          >
            <option value="IN_REVIEW">In review</option>
            <option value="COMPLETED">Completed</option>
            <option value="PARTIALLY_COMPLETED">Partially completed</option>
            <option value="REQUIRES_MORE_INFORMATION">Requires more info</option>
            <option value="SUPERSEDED">Superseded</option>
          </select>
          <input
            name="professionalName"
            defaultValue={review.professionalName ?? ""}
            placeholder="Professional name"
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
          />
          <input
            name="professionalOutcome"
            defaultValue={review.outcome ?? ""}
            placeholder="Outcome summary"
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs sm:col-span-2"
          />
          <div className="sm:col-span-2 flex items-center justify-between">
            <button className="rounded bg-[var(--brand-navy)] px-2.5 py-1 text-xs font-bold text-white">
              Update review
            </button>
            <StateNotice value={state} />
          </div>
        </form>
      )}
    </div>
  );
}

function EvidenceRevokeItem({
  evidence,
  retireAction,
}: Readonly<{
  evidence: AdminVerificationCheck["evidence"][number];
  retireAction: StatefulAction;
}>) {
  const [state, formAction] = useActionState(retireAction, EMPTY);
  return (
    <form
      action={formAction}
      className="flex flex-wrap items-center justify-between gap-2 rounded bg-slate-50 p-2 text-xs"
    >
      <input type="hidden" name="evidenceId" value={evidence.id} />
      <span>{evidence.privateDocumentName || evidence.reference || "Proof item"}</span>
      <div className="flex items-center gap-2">
        <input
          name="reason"
          required
          minLength={10}
          placeholder="Revocation reason"
          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
        />
        <button className="rounded border border-red-300 bg-white px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-50">
          Revoke
        </button>
      </div>
      <StateNotice value={state} />
    </form>
  );
}

function EvidenceAdvanceQuickAction({
  evidence,
  targetProvenance,
  advanceAction,
}: Readonly<{
  evidence: AdminVerificationCheck["evidence"][number];
  targetProvenance: "REVIEWED" | "SOURCE_VERIFIED" | "PROFESSIONALLY_REVIEWED";
  advanceAction: StatefulAction;
}>) {
  const [state, formAction] = useActionState(advanceAction, EMPTY);

  return (
    <form
      action={formAction}
      className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-3"
    >
      <input type="hidden" name="evidenceId" value={evidence.id} />
      <input type="hidden" name="state" value={targetProvenance} />
      <span className="text-xs text-blue-900">
        Advance <strong>{evidence.privateDocumentName || "Attached document"}</strong> to{" "}
        <strong>{formatProvenanceLabel(targetProvenance)}</strong>?
      </span>
      <button className="rounded-lg bg-[var(--brand-navy)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90">
        Update proof status
      </button>
      <StateNotice value={state} />
    </form>
  );
}

function UploadPrivateDocumentInlineForm({ action }: Readonly<{ action: StatefulAction }>) {
  const [state, formAction] = useActionState(action, EMPTY);
  return (
    <form
      action={formAction}
      className="mt-3 space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4"
    >
      <div className="flex items-center justify-between">
        <h6 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
          Upload new private document
        </h6>
        <span className="text-[11px] text-indigo-700">Stored in private secure storage</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Document file (PDF, JPEG, PNG)
          </label>
          <input
            type="file"
            name="file"
            required
            accept="application/pdf,image/jpeg,image/png"
            className="w-full text-xs text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-700"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Document category
          </label>
          <select
            name="documentType"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="OWNER_DOCUMENT">
              Owner document (e.g. 7/12, 8-A, Electricity Bill)
            </option>
            <option value="LEGAL_DOCUMENT">
              Legal document (e.g. Sale Deed, Index-II, Title Search)
            </option>
            <option value="VERIFICATION_EVIDENCE">
              Verification evidence (e.g. Survey Map, Tippan)
            </option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <Submit className="bg-indigo-600 hover:bg-indigo-700 text-xs">
          Upload & Scan Document
        </Submit>
        <StateNotice value={state} />
      </div>
    </form>
  );
}

function SourceReferenceForm({ action }: Readonly<{ action: StatefulAction }>) {
  const [state, formAction] = useActionState(action, EMPTY);
  return (
    <details className="rounded-xl border border-slate-200 bg-white p-5">
      <summary className="cursor-pointer font-display text-lg font-semibold text-slate-800 hover:text-slate-900">
        Official source references
      </summary>
      <p className="mt-1 text-xs text-slate-500">
        Record official government portals (e.g. AnyRoR, Garvi, e-Courts) used to verify records.
      </p>
      <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-2">
        <select name="sourceClass" className="rounded border border-slate-300 px-3 py-2 text-sm">
          <option value="OFFICIAL_ADMINISTRATIVE_PRACTICE">Official Administrative Practice</option>
          <option value="LEGAL_OFFICIAL_REQUIREMENT">Legal Official Requirement</option>
          <option value="PROFESSIONAL_DUE_DILIGENCE">Professional Due Diligence</option>
          <option value="URBANEDGE_OPERATIONAL_POLICY">UrbanEdge Operational Policy</option>
        </select>
        <input
          name="authorityName"
          required
          placeholder="Authority name (e.g. Revenue Department / Garvi)"
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="sourceSystem"
          required
          placeholder="Portal or system (e.g. AnyRoR portal)"
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="sourceName"
          required
          placeholder="Document or service (e.g. VF-7/12 signed extract)"
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="officialUrl"
          type="url"
          placeholder="Official HTTPS URL (optional)"
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="referenceNumber"
          placeholder="Search / reference number (optional)"
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="sm:col-span-2 flex items-center justify-between">
          <Submit>Record source reference</Submit>
          <StateNotice value={state} />
        </div>
      </form>
    </details>
  );
}

function statusTone(status: string) {
  if (status.startsWith("PASSED")) {
    return "bg-emerald-100 text-emerald-900";
  }
  if (status === "IN_REVIEW") {
    return "bg-blue-100 text-blue-900";
  }
  if (["FAILED", "REQUIRES_REVIEW", "EXPIRED"].includes(status)) {
    return "bg-amber-100 text-amber-900";
  }
  return "bg-slate-100 text-slate-700";
}

function Metric({
  label,
  value,
  accent = "text-slate-900",
}: Readonly<{ label: string; value: number; accent?: string }>) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
