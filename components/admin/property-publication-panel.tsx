"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type {
  PublicationActionState,
  PublicationReadiness,
} from "@/features/properties/domain/publication";
import { humanizePublicationIssue } from "@/features/properties/domain/publication";

const EMPTY: PublicationActionState = { ok: false, message: "" };
type Action = (state: PublicationActionState, data: FormData) => Promise<PublicationActionState>;

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
      className={`rounded-xl border p-5 ${isPublished || readiness.ready ? "border-emerald-200 bg-emerald-50/70" : "border-amber-200 bg-amber-50/70"}`}
      aria-labelledby="publishing-status-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`grid h-7 w-7 place-items-center rounded-full text-sm font-bold ${isPublished || readiness.ready ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"}`}
            >
              {isPublished || readiness.ready ? "✓" : "!"}
            </span>
            <h2 id="publishing-status-heading" className="text-lg font-bold text-slate-950">
              {isPublished
                ? "Published"
                : readiness.ready
                  ? "Ready to publish"
                  : `${readiness.blockers.length} ${readiness.blockers.length === 1 ? "item" : "items"} before publishing`}
            </h2>
          </div>
          {isPublished ? (
            <p className="mt-2 text-sm text-slate-700">This property is live on the website.</p>
          ) : readiness.ready ? (
            <p className="mt-2 text-sm text-slate-700">
              All required listing information is complete.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2 text-sm text-slate-800 md:grid-cols-2">
              {readiness.blockers.map((issue) => (
                <li key={`${issue.code}-${issue.checkCode ?? "general"}`} className="flex gap-2">
                  <span aria-hidden="true" className="font-bold text-amber-700">
                    ○
                  </span>
                  <span>{humanizePublicationIssue(issue.message)}</span>
                </li>
              ))}
            </ul>
          )}
          {readiness.warnings.length ? (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-bold text-slate-700">
                {readiness.warnings.length} optional{" "}
                {readiness.warnings.length === 1 ? "note" : "notes"}
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {readiness.warnings.map((issue) => (
                  <li key={`${issue.code}-${issue.message}`}>
                    {humanizePublicationIssue(issue.message)}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
        <div className="shrink-0">
          {isPublished ? (
            <details className="relative">
              <summary className="button button-secondary list-none cursor-pointer">
                Publishing options
              </summary>
              <form
                action={unpublishFormAction}
                className="mt-3 w-full min-w-72 space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-lg sm:absolute sm:right-0 sm:z-10"
              >
                <input type="hidden" name="propertyId" value={readiness.propertyId} />
                <input type="hidden" name="expectedUpdatedAt" value={expectedUpdatedAt} />
                <input type="hidden" name="publicSlug" value={readiness.publicSlug ?? ""} />
                <label className="block text-sm font-semibold">
                  Reason for unpublishing
                  <input name="reason" minLength={10} required className="admin-control" />
                </label>
                <Submit>Unpublish</Submit>
                <Result state={unpublishState} />
              </form>
            </details>
          ) : (
            <form action={publishFormAction} className="space-y-2">
              <input type="hidden" name="propertyId" value={readiness.propertyId} />
              <input type="hidden" name="expectedUpdatedAt" value={expectedUpdatedAt} />
              <label className="flex max-w-xs items-start gap-2 text-sm text-slate-700">
                <input
                  className="mt-1"
                  type="checkbox"
                  name="confirmation"
                  value="PUBLISH"
                  required
                />
                I’ve reviewed this listing and want to publish it.
              </label>
              <Submit disabled={!readiness.ready}>Publish Property</Submit>
              <Result state={publishState} />
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Submit({
  children,
  disabled = false,
}: Readonly<{ children: React.ReactNode; disabled?: boolean }>) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={disabled || pending}
      className="button button-primary disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
    >
      {pending ? "Saving…" : children}
    </button>
  );
}
function Result({ state }: Readonly<{ state: PublicationActionState }>) {
  return state.message ? (
    <p
      role="status"
      className={`max-w-xs text-sm ${state.ok ? "text-emerald-800" : "text-red-800"}`}
    >
      {state.message}
    </p>
  ) : null;
}
