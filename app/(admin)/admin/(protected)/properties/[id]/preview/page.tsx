import { PropertyVideos } from "@/components/media/property-videos";
import { getAdminPropertyVisualMedia } from "@/server/services/property-media";
import { propertyVideosEnabled } from "@/lib/media/property-video";
import { getRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  PropertyReadinessSummary,
  PropertyWorkflow,
  PropertyWorkflowNavigation,
} from "@/components/admin/property-workflow";
import { GoogleMapsEmbed } from "@/components/public/google-maps-embed";
import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import {
  getPublicationPreview,
  getPublicationReadiness,
} from "@/server/services/property-publication";

export const metadata: Metadata = {
  title: "Preview listing",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function PropertyPublicationPreviewPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  await requireActiveAdminPage();
  const [preview, readiness] = await Promise.all([
    getPublicationPreview(id),
    getPublicationReadiness(id),
  ]);
  if (!preview) notFound();
  const media = propertyVideosEnabled() ? await getAdminPropertyVisualMedia(id) : [];
  const locale = await getRequestLocale();
  const videos = media
    .filter(
      (v) =>
        v.mediaType === "VIDEO" &&
        !v.archivedAt &&
        v.visibility === "PUBLIC" &&
        v.processingStatus === "APPROVED",
    )
    .map((v) => ({
      id: v.id,
      mediaType: v.mediaType,
      objectPath: null,
      externalProvider: v.externalProvider,
      externalMediaId: v.externalMediaId,
      driveResourceKey: v.driveResourceKey,
      videoTitle: v.videoTitle,
      caption: v.caption,
      mediaSubtype: v.mediaSubtype,
      videoPosterPath: v.videoPosterId
        ? `properties/${id}/video-posters/${v.videoPosterId}.webp`
        : media.find(
            (p) =>
              p.id === v.videoPhotoId &&
              !p.archivedAt &&
              p.visibility === "PUBLIC" &&
              p.processingStatus === "APPROVED",
          )?.objectPath,
      altText: null,
      width: null,
      height: null,
    }));
  return (
    <div className="mx-auto max-w-5xl">
      <PropertyWorkflow
        currentStep="preview"
        propertyId={id}
        isPublished={readiness.publicationStatus === "PUBLISHED"}
      >
        <header>
          <p className="text-xs font-bold tracking-widest text-[var(--brand-gold-deep)] uppercase">
            {preview.propertyCode}
          </p>
          <h1 className="font-display text-3xl font-semibold">Preview</h1>
          <p className="mt-2 text-sm text-slate-600">
            Review the saved public projection. Owner information, internal notes, and private
            documents are excluded.
          </p>
        </header>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">Listing title</p>
          <h2 className="mt-1 font-display text-2xl font-semibold">
            {preview.title ?? "Untitled property"}
          </h2>
        </section>
        <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2">
          <Preview label="Property ID" value={preview.propertyCode} />
          <Preview label="Website address" value={preview.slug} />
          <Preview label="Category" value={friendly(preview.category)} />
          <Preview label="Transaction" value={friendly(preview.transactionType)} />
          <Preview label="Availability" value={friendly(preview.availability)} />
          <Preview label="Area" value={preview.area} />
          <Preview label="Price" value={friendly(preview.priceMode)} />
          <Preview
            label="Listing location"
            value={preview.publicAddress ?? preview.location.label}
          />
          <Preview label="Cover image description" value={preview.cover?.altText} />
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-display text-xl font-semibold">Listing Description</h2>
          <p className="mt-2 font-semibold">{preview.summary ?? "No summary recorded."}</p>
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
            {preview.description ?? "No description recorded."}
          </p>
        </section>
        <PropertyVideos videos={videos} coverPath={preview.cover?.objectPath} locale={locale} />
        {preview.googleMapsEmbedUrl ? (
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-display text-xl font-semibold">Location</h2>
            <p className="mt-2 font-semibold">{preview.publicAddress ?? preview.location.label}</p>
            <div className="mt-4">
              <GoogleMapsEmbed
                url={preview.googleMapsEmbedUrl}
                title={preview.publicAddress ?? preview.title ?? "Property location"}
              />
            </div>
          </section>
        ) : null}
        <PropertyReadinessSummary readiness={readiness} />
        <PropertyWorkflowNavigation
          previousHref={`/admin/properties/${id}/media`}
          previousLabel="Photos, Videos & Brochure"
          secondaryHref={`/admin/properties/${id}`}
          secondaryLabel="Return to Workspace"
          nextHref={`/admin/properties/${id}/publish`}
          nextLabel="Continue to Publish"
        />
      </PropertyWorkflow>
    </div>
  );
}

function friendly(value: string | null | undefined) {
  return value
    ? value
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/^./, (letter) => letter.toUpperCase())
    : value;
}

function Preview({ label, value }: Readonly<{ label: string; value: string | null | undefined }>) {
  return (
    <div>
      <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value || "Not recorded"}</p>
    </div>
  );
}
