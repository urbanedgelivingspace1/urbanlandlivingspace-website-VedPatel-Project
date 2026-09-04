"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  issuesForGroup,
  publicationGroups,
  type PublicationActionState,
  type PublicationReadiness,
} from "@/features/properties/domain/publication";

const EMPTY: PublicationActionState = { ok: false, message: "" };
type Action = (state: PublicationActionState, data: FormData) => Promise<PublicationActionState>;

function Submit({
  children,
  disabled = false,
}: Readonly<{ children: React.ReactNode; disabled?: boolean }>) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={disabled || pending}
      className="rounded-lg bg-[var(--brand-navy)] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
    >
      {pending ? "Working…" : children}
    </button>
  );
}

function Result({ state }: Readonly<{ state: PublicationActionState }>) {
  return state.message ? (
    <p role="status" className={`text-sm ${state.ok ? "text-emerald-800" : "text-red-800"}`}>
      {state.message}
    </p>
  ) : null;
}

export function PropertyPublicationPanel({
  readiness,
  expectedUpdatedAt,
  publishAction,
  unpublishAction,
}: Readonly<{
  readiness: PublicationReadiness;
  expectedUpdatedAt: string;
  publishAction: Action;
  unpublishAction: Action;
}>) {
  const [publishState, publishFormAction] = useActionState(publishAction, EMPTY);
  const [unpublishState, unpublishFormAction] = useActionState(unpublishAction, EMPTY);
  const isPublished = readiness.publicationStatus === "PUBLISHED";
  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-5"
      aria-labelledby="publication-readiness-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="publication-readiness-heading" className="font-display text-xl font-semibold">
            Publication readiness
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {readiness.ready
              ? "All current blockers are cleared. Warnings remain visible for an informed decision."
              : `${readiness.blockers.length} blocker${readiness.blockers.length === 1 ? "" : "s"} must be resolved.`}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${readiness.ready ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-950"}`}
        >
          {readiness.ready ? "NO BLOCKERS" : "BLOCKED"}
        </span>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {publicationGroups.map((group) => {
          const issues = issuesForGroup(readiness, group);
          const status = issues.blockers.length
            ? "Blocked"
            : issues.warnings.length
              ? "Warning"
              : "Passed";
          return (
            <section key={group} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold">{group.replaceAll("_", " / ")}</h3>
                <span className="text-xs font-semibold text-slate-600">{status}</span>
              </div>
              {[...issues.blockers, ...issues.warnings].length ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {[...issues.blockers, ...issues.warnings].map((issue) => (
                    <li key={`${issue.code}-${issue.checkCode ?? "general"}-${issue.message}`}>
                      {issue.message}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-emerald-800">Current authoritative data passes.</p>
              )}
            </section>
          );
        })}
      </div>
      <div className="mt-5 border-t border-slate-200 pt-5">
        {isPublished ? (
          <form action={unpublishFormAction} className="space-y-3">
            <input type="hidden" name="propertyId" value={readiness.propertyId} />
            <input type="hidden" name="expectedUpdatedAt" value={expectedUpdatedAt} />
            <input type="hidden" name="publicSlug" value={readiness.publicSlug ?? ""} />
            <label className="block max-w-xl text-sm font-semibold">
              Reason for unpublishing
              <input
                name="reason"
                minLength={10}
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                placeholder="Operational reason recorded in the audit"
              />
            </label>
            <Submit>Unpublish property</Submit>
            <Result state={unpublishState} />
          </form>
        ) : (
          <form action={publishFormAction} className="space-y-3">
            <input type="hidden" name="propertyId" value={readiness.propertyId} />
            <input type="hidden" name="expectedUpdatedAt" value={expectedUpdatedAt} />
            <label className="flex max-w-3xl items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="confirmation"
                value="PUBLISH"
                required
                className="mt-1"
              />
              <span>
                I reviewed every readiness group and understand publication is not a legal
                guarantee.
              </span>
            </label>
            <Submit disabled={!readiness.ready}>Publish property</Submit>
            <Result state={publishState} />
          </form>
        )}
      </div>
    </section>
  );
}
