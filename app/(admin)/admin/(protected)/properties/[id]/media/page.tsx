import Link from "next/link";
import { notFound } from "next/navigation";

import { PropertyMediaManager } from "@/components/admin/property-media-manager";
import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import { getAdminProperty } from "@/server/services/property-drafts";
import { getAdminPropertyMedia } from "@/server/services/property-media";

import {
  addExternalMediaAction,
  approveMediaAction,
  archiveDocumentAction,
  archiveMediaAction,
  reorderMediaAction,
  restoreMediaAction,
  setCoverAction,
  updateMediaMetadataAction,
  uploadBrochureAction,
  uploadImageAction,
  uploadPrivateDocumentAction,
} from "./actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PropertyMediaPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  await requireActiveAdminPage();
  const [property, data] = await Promise.all([getAdminProperty(id), getAdminPropertyMedia(id)]);
  if (!property) notFound();
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-[var(--brand-gold-deep)] uppercase">
            {property.property.property_code}
          </p>
          <h1 className="font-display text-3xl font-semibold">
            Property media and private storage
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage staged/public assets separately from private owner, legal and verification
            material.
          </p>
        </div>
        <Link
          href={`/admin/properties/${id}`}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold"
        >
          Back to property
        </Link>
      </header>
      <PropertyMediaManager
        propertyId={id}
        media={data.media}
        documents={data.documents}
        uploadImageAction={uploadImageAction.bind(null, id)}
        uploadBrochureAction={uploadBrochureAction.bind(null, id)}
        uploadPrivateDocumentAction={uploadPrivateDocumentAction.bind(null, id)}
        addExternalMediaAction={addExternalMediaAction.bind(null, id)}
        updateMetadataAction={updateMediaMetadataAction}
        reorderAction={reorderMediaAction}
        setCoverAction={setCoverAction}
        approveAction={approveMediaAction}
        archiveMediaAction={archiveMediaAction}
        restoreMediaAction={restoreMediaAction}
        archiveDocumentAction={archiveDocumentAction}
      />
    </div>
  );
}
