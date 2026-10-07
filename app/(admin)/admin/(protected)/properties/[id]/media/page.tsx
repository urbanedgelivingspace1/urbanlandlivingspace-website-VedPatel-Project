import { notFound } from "next/navigation";

import { PropertyMediaManager } from "@/components/admin/property-media-manager";
import { PropertyWorkflow } from "@/components/admin/property-workflow";
import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import { getAdminProperty } from "@/server/services/property-drafts";
import { getAdminPropertyVisualMedia } from "@/server/services/property-media";

import {
  approveMediaAction,
  archiveMediaAction,
  reorderMediaAction,
  saveGoogleDriveBrochureAction,
  setCoverAction,
  updateMediaMetadataAction,
  uploadImagesAction,
} from "./actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PropertyMediaPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  await requireActiveAdminPage();
  const [property, media] = await Promise.all([
    getAdminProperty(id),
    getAdminPropertyVisualMedia(id),
  ]);
  if (!property) notFound();
  const activeMedia = media.filter((asset) => !asset.archivedAt);
  const stepMedia = activeMedia.filter(
    (asset) => asset.mediaType === "IMAGE" || asset.mediaType === "BROCHURE",
  );
  return (
    <div className="mx-auto max-w-6xl">
      <PropertyWorkflow
        currentStep="media"
        propertyId={id}
        isPublished={property.property.publication_status === "PUBLISHED"}
      >
        <header>
          <p className="text-xs font-bold tracking-widest text-[var(--brand-gold-deep)] uppercase">
            {property.property.property_code}
          </p>
          <h1 className="font-display text-3xl font-semibold">Photos &amp; Brochure</h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload property photos and optionally connect a brochure from Google Drive. Each
            completed action is saved immediately.
          </p>
        </header>
        <PropertyMediaManager
          propertyId={id}
          media={stepMedia}
          activeMediaIds={activeMedia
            .sort((left, right) => left.sortOrder - right.sortOrder)
            .map((asset) => asset.id)}
          uploadImagesAction={uploadImagesAction.bind(null, id)}
          saveBrochureAction={saveGoogleDriveBrochureAction.bind(null, id)}
          updateMetadataAction={updateMediaMetadataAction}
          reorderAction={reorderMediaAction}
          setCoverAction={setCoverAction}
          approveAction={approveMediaAction}
          archiveMediaAction={archiveMediaAction}
        />
      </PropertyWorkflow>
    </div>
  );
}
