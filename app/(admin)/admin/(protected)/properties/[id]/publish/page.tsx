import Link from "next/link";
import { notFound } from "next/navigation";

import { PropertyPublicationPanel } from "@/components/admin/property-publication-panel";
import { PropertyWorkflow, PropertyWorkflowNavigation } from "@/components/admin/property-workflow";
import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import { getAdminProperty } from "@/server/services/property-drafts";
import { getPublicationReadiness } from "@/server/services/property-publication";

import { publishPropertyAction, unpublishPropertyAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function PropertyPublishPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  await requireActiveAdminPage();
  const [record, readiness] = await Promise.all([
    getAdminProperty(id),
    getPublicationReadiness(id),
  ]);
  if (!record) notFound();

  const row = record.property;
  const isPublished = readiness.publicationStatus === "PUBLISHED";

  return (
    <div className="mx-auto max-w-5xl">
      <PropertyWorkflow currentStep="publish" propertyId={id} isPublished={isPublished}>
        <header>
          <p className="text-xs font-bold tracking-widest text-[var(--brand-gold-deep)] uppercase">
            {row.property_code}
          </p>
          <h1 className="font-display text-3xl font-semibold">Publish</h1>
          <p className="mt-2 text-sm text-slate-600">
            Review the authoritative readiness result and publish this same property when every
            requirement is complete.
          </p>
        </header>

        <PropertyPublicationPanel
          readiness={readiness}
          expectedUpdatedAt={row.updated_at}
          publishAction={publishPropertyAction}
          unpublishAction={unpublishPropertyAction}
        />

        {isPublished ? (
          <section
            role="status"
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-300 bg-emerald-50 p-5"
          >
            <div>
              <h2 className="text-lg font-bold text-emerald-950">
                Property published successfully
              </h2>
              <p className="mt-1 text-sm text-emerald-900">
                The approved public listing is now available on the website.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {readiness.publicSlug ? (
                <Link
                  className="button button-primary"
                  href={`/properties/${readiness.publicSlug}`}
                >
                  View Live Listing
                </Link>
              ) : null}
              <Link className="button button-secondary" href="/admin/properties">
                Back to Properties
              </Link>
            </div>
          </section>
        ) : null}

        <PropertyWorkflowNavigation
          previousHref={`/admin/properties/${id}/preview`}
          previousLabel="Preview"
          secondaryHref={isPublished ? "/admin/properties" : `/admin/properties/${id}`}
          secondaryLabel={isPublished ? "Back to Properties" : "Keep as Draft"}
        />
      </PropertyWorkflow>
    </div>
  );
}
