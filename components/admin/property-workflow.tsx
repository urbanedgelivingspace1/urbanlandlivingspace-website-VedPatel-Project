import Link from "next/link";

import {
  humanizePublicationIssue,
  type PublicationReadiness,
} from "@/features/properties/domain/publication";

export const propertyWorkflowSteps = ["details", "media", "preview", "publish"] as const;

export type PropertyWorkflowStep = (typeof propertyWorkflowSteps)[number];

const stepLabels: Record<PropertyWorkflowStep, string> = {
  details: "Property Details",
  media: "Photos & Documents",
  preview: "Preview",
  publish: "Publish",
};

function stepHref(propertyId: string, step: PropertyWorkflowStep) {
  if (step === "details") return `/admin/properties/${propertyId}/edit`;
  return `/admin/properties/${propertyId}/${step}`;
}

export function PropertyWorkflow({
  currentStep,
  propertyId,
  isPublished = false,
  children,
}: Readonly<{
  currentStep: PropertyWorkflowStep;
  propertyId?: string;
  isPublished?: boolean;
  children: React.ReactNode;
}>) {
  const currentIndex = propertyWorkflowSteps.indexOf(currentStep);

  return (
    <div className="space-y-6">
      <nav aria-label="Property publishing workflow">
        <ol className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-4 sm:p-4">
          {propertyWorkflowSteps.map((step, index) => {
            const isCurrent = step === currentStep;
            const isComplete = index < currentIndex || (step === "publish" && isPublished);
            const content = (
              <>
                <span
                  aria-hidden="true"
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                    isComplete
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                        ? "bg-[var(--brand-gold-deep)] text-white"
                        : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isComplete ? "✓" : index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold leading-tight sm:text-sm">
                    {stepLabels[step]}
                  </span>
                  <span className="mt-0.5 block text-[0.6875rem] font-medium opacity-75">
                    {isComplete ? "Completed" : isCurrent ? "Current step" : "Upcoming"}
                  </span>
                </span>
              </>
            );
            const className = `flex min-h-14 items-center gap-2 rounded-lg px-2.5 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-gold-deep)] ${
              isCurrent
                ? "bg-[#02066f] text-white"
                : isComplete
                  ? "bg-emerald-50 text-emerald-950 hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-500"
            }`;

            return (
              <li key={step}>
                {isComplete && !isCurrent && propertyId ? (
                  <Link className={className} href={stepHref(propertyId, step)}>
                    {content}
                  </Link>
                ) : (
                  <div className={className} aria-current={isCurrent ? "step" : undefined}>
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {children}
    </div>
  );
}

export function PropertyWorkflowNavigation({
  previousHref,
  previousLabel = "Previous",
  secondaryHref,
  secondaryLabel,
  nextHref,
  nextLabel,
  nextDisabledReason,
}: Readonly<{
  previousHref: string;
  previousLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  nextHref?: string;
  nextLabel?: string;
  nextDisabledReason?: string;
}>) {
  return (
    <nav
      aria-label="Workflow actions"
      className="flex flex-col-reverse gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <Link className="button button-secondary justify-center" href={previousHref}>
        ← {previousLabel}
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {secondaryHref && secondaryLabel ? (
          <Link className="button button-secondary justify-center" href={secondaryHref}>
            {secondaryLabel}
          </Link>
        ) : null}
        {nextHref && nextLabel ? (
          nextDisabledReason ? (
            <div>
              <button
                className="button button-primary w-full justify-center disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                type="button"
                disabled
                aria-describedby="workflow-next-disabled-reason"
              >
                {nextLabel} →
              </button>
              <p
                id="workflow-next-disabled-reason"
                role="status"
                className="mt-1 max-w-xs text-xs text-slate-600"
              >
                {nextDisabledReason}
              </p>
            </div>
          ) : (
            <Link className="button button-primary justify-center" href={nextHref}>
              {nextLabel} →
            </Link>
          )
        ) : null}
      </div>
    </nav>
  );
}

export function PropertyReadinessSummary({
  readiness,
}: Readonly<{ readiness: PublicationReadiness }>) {
  return (
    <section
      className={`rounded-xl border p-5 ${
        readiness.ready ? "border-emerald-200 bg-emerald-50/70" : "border-amber-200 bg-amber-50/70"
      }`}
      aria-labelledby="workflow-readiness-heading"
    >
      <h2 id="workflow-readiness-heading" className="text-lg font-bold text-slate-950">
        {readiness.ready
          ? "Ready to publish"
          : `${readiness.blockers.length} ${readiness.blockers.length === 1 ? "thing" : "things"} left before publishing`}
      </h2>
      {readiness.ready ? (
        <p className="mt-2 text-sm text-slate-700">
          The saved listing currently passes all publishing requirements.
        </p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-slate-800">
          {readiness.blockers.map((issue) => {
            const href =
              issue.group === "MEDIA"
                ? `/admin/properties/${readiness.propertyId}/media`
                : `/admin/properties/${readiness.propertyId}/edit`;
            return (
              <li key={`${issue.code}-${issue.checkCode ?? "general"}`} className="flex gap-2">
                <span aria-hidden="true" className="font-bold text-amber-700">
                  •
                </span>
                <span>
                  {humanizePublicationIssue(issue.message)}{" "}
                  <Link className="font-bold underline" href={href}>
                    Fix this
                  </Link>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
