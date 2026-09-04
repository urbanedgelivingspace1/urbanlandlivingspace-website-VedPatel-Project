import Link from "next/link";
import { notFound } from "next/navigation";

import { VerificationWorkspace } from "@/components/admin/verification-workspace";
import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import { getAdminVerificationDetail } from "@/server/services/verifications";

import {
  advanceEvidenceAction,
  applicabilityAction,
  exceptionAction,
  initializeVerificationAction,
  linkEvidenceAction,
  professionalReviewAction,
  recordSourceAction,
  resolveExceptionAction,
  retireEvidenceAction,
  transitionVerificationAction,
  updateProfessionalReviewAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function VerificationDetailPage({
  params,
}: Readonly<{ params: Promise<{ propertyId: string }> }>) {
  const { propertyId } = await params;
  await requireActiveAdminPage();
  const detail = await getAdminVerificationDetail(propertyId);
  if (!detail) notFound();
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-[var(--brand-gold-deep)] uppercase">
            {detail.property.propertyCode} · {detail.property.category} ·{" "}
            {detail.property.transactionType}
          </p>
          <h1 className="font-display text-3xl font-semibold">Property verification</h1>
          <p className="mt-1 text-sm text-slate-600">
            {detail.property.title || "Untitled property draft"} · publication{" "}
            {detail.property.publicationStatus}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/verification/queue"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold"
          >
            Queue
          </Link>
          <Link
            href={`/admin/properties/${propertyId}`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold"
          >
            Property
          </Link>
          <Link
            href={`/admin/properties/${propertyId}/media`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold"
          >
            Private documents
          </Link>
        </div>
      </header>
      <VerificationWorkspace
        detail={detail}
        initializeAction={initializeVerificationAction.bind(null, propertyId)}
        transitionAction={transitionVerificationAction.bind(null, propertyId)}
        linkEvidenceAction={linkEvidenceAction.bind(null, propertyId)}
        advanceEvidenceAction={advanceEvidenceAction.bind(null, propertyId)}
        applicabilityAction={applicabilityAction.bind(null, propertyId)}
        exceptionAction={exceptionAction.bind(null, propertyId)}
        professionalReviewAction={professionalReviewAction.bind(null, propertyId)}
        recordSourceAction={recordSourceAction.bind(null, propertyId)}
        retireEvidenceAction={retireEvidenceAction.bind(null, propertyId)}
        resolveExceptionAction={resolveExceptionAction.bind(null, propertyId)}
        updateProfessionalReviewAction={updateProfessionalReviewAction.bind(null, propertyId)}
      />
    </div>
  );
}
