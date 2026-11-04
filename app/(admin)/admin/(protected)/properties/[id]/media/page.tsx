import { propertyVideosEnabled } from "@/lib/media/property-video";
import { getRequestLocale } from "@/lib/i18n/server";
import { notFound } from "next/navigation";

import { AdminTopNotification } from "@/components/admin/admin-top-notification";
import { PropertyMediaManager } from "@/components/admin/property-media-manager";
import { PropertyWorkflow } from "@/components/admin/property-workflow";
import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import { getAdminProperty } from "@/server/services/property-drafts";
import { getAdminPropertyVisualMedia } from "@/server/services/property-media";

import {
  archiveMediaAction,
  manageVideoAction,
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
  searchParams,
}: Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}>) {
  const { id } = await params;
  const query = await searchParams;
  await requireActiveAdminPage();
  const [property, media] = await Promise.all([
    getAdminProperty(id),
    getAdminPropertyVisualMedia(id),
  ]);
  if (!property) notFound();
  const locale = await getRequestLocale();
  const activeMedia = media.filter((asset) => !asset.archivedAt);
  const stepMedia = activeMedia.filter(
    (asset) => asset.mediaType === "IMAGE" || asset.mediaType === "BROCHURE",
  );
  return (
    <div className="mx-auto max-w-6xl">
      {query.saved === "1" ? (
        <AdminTopNotification
          type="success"
          title="Changes saved successfully."
          message="Your updates have been recorded."
        />
      ) : null}
      <PropertyWorkflow
        currentStep="media"
        propertyId={id}
        isPublished={property.property.publication_status === "PUBLISHED"}
      >
        <header>
          <p className="text-xs font-bold tracking-widest text-[var(--brand-gold-deep)] uppercase">
            {property.property.property_code}
          </p>
          <h1 className="font-display text-3xl font-semibold">Photos, Videos &amp; Brochure</h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload property photos and optionally connect videos or a Google Drive brochure. Each
            completed action is saved immediately.
          </p>
        </header>
        <PropertyMediaManager
          propertyId={id}
          media={propertyVideosEnabled() ? media : stepMedia}
          videoAction={propertyVideosEnabled() ? manageVideoAction.bind(null, id) : undefined}
          published={property.property.publication_status === "PUBLISHED"}
          locale={locale}
          activeMediaIds={activeMedia
            .sort((left, right) => left.sortOrder - right.sortOrder)
            .map((asset) => asset.id)}
          uploadImagesAction={uploadImagesAction.bind(null, id)}
          saveBrochureAction={saveGoogleDriveBrochureAction.bind(null, id)}
          updateMetadataAction={updateMediaMetadataAction}
          reorderAction={reorderMediaAction}
          setCoverAction={setCoverAction}
          archiveMediaAction={archiveMediaAction}
        />
      </PropertyWorkflow>
    </div>
  );
}
