"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";

import { DeleteDraftButton } from "@/components/admin/delete-draft-button";
import { PropertyPublicationPanel } from "@/components/admin/property-publication-panel";
import type { PropertyInterestedBuyers } from "@/features/crm/domain/contracts";
import { leadStatusLabel } from "@/features/crm/domain/pipeline";
import type {
  AdminMediaAssetDto,
  AdminPrivateDocumentDto,
  BatchDocumentUploadResult,
} from "@/features/media/domain/contracts";
import type { AdminPropertyDraftRecord } from "@/features/properties/domain/contracts";
import type { PropertyActivityItem } from "@/features/properties/domain/contracts";
import type {
  PublicationActionState,
  PublicationReadiness,
} from "@/features/properties/domain/publication";
import type { AvailabilityStatus } from "@/types/database";

function nextAvailability(status: AvailabilityStatus): AvailabilityStatus[] {
  if (status === "AVAILABLE") return ["UNDER_NEGOTIATION", "RENTED", "LEASED", "OFF_MARKET"];
  if (status === "UNDER_NEGOTIATION") return ["AVAILABLE", "RENTED", "LEASED", "OFF_MARKET"];
  if (status === "SOLD") return ["OFF_MARKET"];
  if (status === "RENTED" || status === "LEASED") return ["AVAILABLE", "OFF_MARKET"];
  return [];
}

export type PropertyWorkspaceTabKey =
  "overview" | "media" | "documents" | "review" | "buyers" | "activity";

type Props = Readonly<{
  property: AdminPropertyDraftRecord;
  readiness?: PublicationReadiness;
  initialTab?: PropertyWorkspaceTabKey;
  mediaList?: readonly AdminMediaAssetDto[];
  documentList?: readonly AdminPrivateDocumentDto[];
  interestedBuyers?: PropertyInterestedBuyers;
  activity?: readonly PropertyActivityItem[];
  savedNotice?: boolean;
  publishAction: (
    previous: PublicationActionState,
    data: FormData,
  ) => Promise<PublicationActionState>;
  unpublishAction: (
    previous: PublicationActionState,
    data: FormData,
  ) => Promise<PublicationActionState>;
  changeAvailabilityAction: (data: FormData) => Promise<void>;
  markPropertySoldAction?: (data: FormData) => Promise<void>;
  archivePropertyAction: (data: FormData) => Promise<void>;
  restorePropertyAction: (data: FormData) => Promise<void>;
  deletePropertyDraftAction?: (data: FormData) => Promise<void>;
  uploadBatchPropertyDocumentsAction?: (
    propertyId: string,
    data: FormData,
  ) => Promise<BatchDocumentUploadResult>;
  createDocumentSignedUrlAction?: (
    documentId: string,
  ) => Promise<{ ok: boolean; signedUrl?: string; error?: string }>;
}>;

export function PropertyWorkspace({
  property,
  readiness,
  initialTab = "overview",
  mediaList = [],
  documentList = [],
  interestedBuyers = { matches: [], siteVisits: [] },
  activity = [],
  savedNotice = false,
  publishAction,
  unpublishAction,
  changeAvailabilityAction,
  markPropertySoldAction,
  archivePropertyAction,
  restorePropertyAction,
  deletePropertyDraftAction,
  uploadBatchPropertyDocumentsAction,
  createDocumentSignedUrlAction,
}: Props) {
  const activeTab = initialTab;
  const [isUploading, startUploadTransition] = useTransition();
  const [uploadStatus, setUploadStatus] = useState<BatchDocumentUploadResult | null>(null);
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [queuedFileNames, setQueuedFileNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFiles = useRef(new Map<string, File>());

  const row = property.property;
  const id = row.id;

  const matchesCount = interestedBuyers.matches.length;
  const visitsCount = interestedBuyers.siteVisits.length;
  const displayedPrice =
    property.offer?.price_mode === "PRICE_ON_REQUEST" || !property.offer?.price_amount
      ? "Price on request"
      : new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(property.offer.price_amount);

  const handleDocumentUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadBatchPropertyDocumentsAction) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const queuedFiles = [...selectedFiles.current.values()];
    const files = queuedFiles.length ? queuedFiles : (formData.getAll("documents") as File[]);
    if (!files.length || (files.length === 1 && files[0]?.size === 0)) {
      setUploadStatus({
        ok: false,
        uploaded: 0,
        results: [],
        message: "Please select at least one file to upload.",
      });
      return;
    }
    selectedFiles.current = new Map(files.map((file) => [file.name, file]));
    formData.delete("documents");
    for (const file of files) formData.append("documents", file);

    startUploadTransition(async () => {
      try {
        const result = await uploadBatchPropertyDocumentsAction(id, formData);
        setUploadStatus(result);
        if (result.ok && fileInputRef.current) {
          fileInputRef.current.value = "";
          selectedFiles.current.clear();
          setQueuedFileNames([]);
        }
      } catch (err) {
        setUploadStatus({
          ok: false,
          uploaded: 0,
          results: [],
          message: err instanceof Error ? err.message : "Upload failed. Please try again.",
        });
      }
    });
  };

  const queueDocuments = (files: FileList | readonly File[]) => {
    const next = [...files];
    selectedFiles.current = new Map(next.map((file) => [file.name, file]));
    setQueuedFileNames(next.map((file) => file.name));
  };

  const retryDocumentUpload = (fileName: string) => {
    if (!uploadBatchPropertyDocumentsAction) return;
    const file = selectedFiles.current.get(fileName);
    const form = fileInputRef.current?.form;
    const category = form?.elements.namedItem("documentType");
    if (!file) return;
    const retryData = new FormData();
    retryData.append("documents", file);
    retryData.set("documentType", category instanceof HTMLSelectElement ? category.value : "OTHER");
    startUploadTransition(async () => {
      const result = await uploadBatchPropertyDocumentsAction(id, retryData);
      setUploadStatus(result);
    });
  };

  const handleViewDocument = async (docId: string) => {
    if (!createDocumentSignedUrlAction) return;
    setLoadingDocId(docId);
    setDocError(null);
    try {
      const res = await createDocumentSignedUrlAction(docId);
      if (res.ok && res.signedUrl) {
        window.open(res.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        setDocError(res.error || "Failed to generate access link.");
      }
    } catch (err) {
      setDocError(err instanceof Error ? err.message : "Network error opening document.");
    } finally {
      setLoadingDocId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold tracking-wide text-emerald-800">{row.property_code}</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {row.listing_title || "Untitled property"}
            </h1>
            <p className="text-sm text-slate-600">
              {property.districtName} · {row.display_area_value} {property.areaUnitName} ·{" "}
              {friendly(row.land_category)} · {friendly(row.primary_transaction_type)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="admin-badge admin-badge-blue">
                {friendly(row.publication_status)}
              </span>
              <span className="admin-badge admin-badge-green">
                {friendly(row.availability_status)}
              </span>
              <span className="font-bold text-slate-950">{displayedPrice}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/admin/properties" prefetch={false} className="button button-secondary">
              ← Properties
            </Link>
            <Link
              href={`/admin/properties/${id}?tab=media`}
              prefetch={false}
              className="button button-secondary"
            >
              Add Photos / Documents
            </Link>
            {row.publication_status === "DRAFT" ? (
              <Link
                href={`/admin/properties/${id}/edit`}
                prefetch={false}
                className="button button-primary"
              >
                Edit
              </Link>
            ) : null}
            <Link
              href={`/admin/properties/${id}/preview`}
              prefetch={false}
              className="button button-secondary"
            >
              {row.publication_status === "PUBLISHED" ? "View Live Listing" : "Preview Listing"}
            </Link>
            <details className="relative">
              <summary className="button button-secondary list-none cursor-pointer">
                More actions
              </summary>
              <div className="mt-2 min-w-56 space-y-2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg sm:absolute sm:right-0 sm:z-20">
                <Link
                  href={`/admin/properties/${id}?tab=activity`}
                  prefetch={false}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Change property status
                </Link>
                {deletePropertyDraftAction ? (
                  <DeleteDraftButton
                    propertyId={id}
                    expectedUpdatedAt={row.updated_at}
                    propertyTitle={row.listing_title ?? row.property_code}
                    isPublished={row.publication_status === "PUBLISHED"}
                    action={deletePropertyDraftAction}
                  />
                ) : null}
              </div>
            </details>
          </div>
        </div>
      </header>

      {savedNotice ? (
        <p
          role="status"
          className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-medium text-emerald-900"
        >
          Draft changes saved successfully.
        </p>
      ) : null}

      {readiness ? (
        <PropertyPublicationPanel
          readiness={readiness}
          expectedUpdatedAt={row.updated_at}
          publishAction={publishAction}
          unpublishAction={unpublishAction}
        />
      ) : (
        <p
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
        >
          Publishing status is temporarily unavailable. Your property information is still safe.
        </p>
      )}

      <div className="border-b border-slate-200">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Property sections">
          <Link
            href={`/admin/properties/${id}?tab=overview`}
            prefetch={false}
            aria-current={activeTab === "overview" ? "page" : undefined}
            className="admin-tab"
          >
            Overview
          </Link>
          <Link
            href={`/admin/properties/${id}?tab=media`}
            prefetch={false}
            aria-current={activeTab === "media" ? "page" : undefined}
            className="admin-tab"
          >
            Media & documents ({property.mediaCount + property.documentCount})
          </Link>
          <Link href={`/admin/verification/${id}`} prefetch={false} className="admin-tab">
            Verification
          </Link>
          <Link
            href={`/admin/properties/${id}?tab=buyers`}
            prefetch={false}
            aria-current={activeTab === "buyers" ? "page" : undefined}
            className="admin-tab"
          >
            Leads & visits{activeTab === "buyers" ? ` (${matchesCount + visitsCount})` : ""}
          </Link>
          <Link
            href={`/admin/properties/${id}?tab=activity`}
            prefetch={false}
            aria-current={activeTab === "activity" ? "page" : undefined}
            className="admin-tab"
          >
            Status & history
          </Link>
        </nav>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <section aria-labelledby="overview-heading" className="space-y-6">
          <h2 id="overview-heading" className="sr-only">
            Property Overview
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <DetailSection title="Property Details">
              <Detail label="Property ID" value={row.property_code} />
              <Detail label="Website address" value={row.public_slug} />
              <Detail
                label="Display Area"
                value={`${row.display_area_value} ${property.areaUnitName}`}
              />
              <Detail label="Public address" value={row.public_address} />
            </DetailSection>

            <DetailSection title="Price">
              <Detail label="Price type" value={friendly(property.offer?.price_mode)} />
              <Detail
                label="Price amount"
                value={
                  property.offer?.price_amount
                    ? `₹ ${Number(property.offer.price_amount).toLocaleString("en-IN")}`
                    : property.offer?.price_mode === "PRICE_ON_REQUEST"
                      ? "Price on Request"
                      : null
                }
              />
              <Detail label="Negotiable" value={property.offer?.is_negotiable ? "Yes" : "No"} />
              <Detail label="Commercial terms" value={property.offer?.commercial_terms} />
            </DetailSection>

            <DetailSection title="Location">
              <Detail
                label="Map visibility"
                value={friendly(property.location?.location_visibility)}
              />
              <Detail
                label="Listing coordinates"
                value={
                  property.location?.public_latitude === null ||
                  property.location?.public_latitude === undefined
                    ? null
                    : `${property.location.public_latitude}, ${property.location.public_longitude}`
                }
              />
              <Detail
                label="Accuracy"
                value={
                  property.location?.public_accuracy_m
                    ? `± ${property.location.public_accuracy_m} m`
                    : null
                }
              />
            </DetailSection>

            <DetailSection title="Survey & Planning">
              <Detail label="Parcel label" value={property.parcel?.parcel_label} />
              <Detail
                label="Survey / Identifier"
                value={
                  property.parcel?.identifier
                    ? `${property.parcel.identifier.identifier_type}: ${property.parcel.identifier.identifier_value}`
                    : null
                }
              />
              <Detail label="Reservation status" value={property.planning?.reservation_status} />
              <Detail label="Road reservation" value={property.planning?.road_reservation_status} />
            </DetailSection>

            <DetailSection title={`${friendly(row.land_category)} Details`}>
              <Detail
                label="Agricultural irrigation"
                value={property.agricultural?.irrigation_status}
              />
              <Detail label="Tenure type" value={property.agricultural?.tenure_type} />
              <Detail
                label="Road touch"
                value={
                  property.agricultural?.road_touch !== null &&
                  property.agricultural?.road_touch !== undefined
                    ? property.agricultural.road_touch
                      ? "Yes"
                      : "No"
                    : null
                }
              />
              <Detail label="NA status" value={property.na?.na_status} />
              <Detail label="NA purpose" value={property.na?.na_purpose} />
              <Detail label="Industrial subtype" value={property.industrial?.industrial_subtype} />
              <Detail
                label="Sanctioned load"
                value={
                  property.industrial?.sanctioned_load_kw
                    ? `${property.industrial.sanctioned_load_kw} kW`
                    : null
                }
              />
            </DetailSection>

            <DetailSection title="Owner & Source">
              <Detail label="Owner / contact" value={property.partyLink?.party_id} />
              <Detail label="Relationship" value={friendly(property.partyLink?.role)} />
              <Detail
                label="Source"
                value={property.sourceLink?.source_name ?? property.sourceLink?.source_type}
              />
              <Detail label="Source reference" value={property.sourceLink?.source_reference} />
            </DetailSection>
          </div>
        </section>
      )}

      {activeTab === "media" && (
        <section aria-labelledby="media-heading" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
            <div>
              <h2 id="media-heading" className="font-display text-xl font-bold text-slate-900">
                Photos & Listing Media ({mediaList.length})
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Photos, aerial drone footage, brochures, and site layout plans.
              </p>
            </div>
            <Link
              href={`/admin/properties/${id}/media`}
              className="rounded-lg bg-[var(--brand-navy)] px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-90 transition-opacity"
            >
              Add or Manage Photos
            </Link>
          </div>

          {mediaList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm font-medium text-slate-600">
                No photos or listing media have been added yet.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                A property requires at least one approved cover image for public website display.
              </p>
              <Link
                href={`/admin/properties/${id}/media`}
                className="mt-4 inline-block rounded-lg bg-[var(--brand-navy)] px-4 py-2 text-xs font-bold text-white"
              >
                Upload photos now
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {mediaList.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs"
                >
                  <div className="relative aspect-4/3 w-full bg-slate-100">
                    {asset.previewUrl ? (
                      <Image
                        src={asset.previewUrl}
                        alt={asset.altText || "Property asset"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-bold text-slate-400">
                        {asset.mediaType}
                      </div>
                    )}
                    {asset.isCover && (
                      <span className="absolute top-2 left-2 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-xs">
                        Cover Photo
                      </span>
                    )}
                    <span
                      className={`absolute top-2 right-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold shadow-xs ${
                        asset.processingStatus === "APPROVED"
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-700 text-white"
                      }`}
                    >
                      {asset.processingStatus}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-xs font-semibold text-slate-800">
                      {asset.caption || asset.altText || "Unnamed photo"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {asset.mediaType} · {asset.visibility}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "media" && (
        <section aria-labelledby="documents-heading" className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2
                  id="documents-heading"
                  className="font-display text-xl font-bold text-slate-900"
                >
                  Private Documents ({documentList.length})
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Deeds, 7/12 extracts, title search reports, and legal records.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                Private · Staff access only
              </span>
            </div>

            {/* Batch Document Uploader Form */}
            <form onSubmit={handleDocumentUpload} className="mt-6 border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-slate-900">Add Documents</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Add deeds, land records, plans, and other documents. These files are not shown
                publicly.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="documentType"
                    className="block text-xs font-bold text-slate-700 uppercase"
                  >
                    Document Category
                  </label>
                  <select
                    id="documentType"
                    name="documentType"
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                    defaultValue="OTHER"
                  >
                    <option value="OTHER">No tag / Other</option>
                    <option value="LAND_RECORDS">7/12 &amp; 8A Land Records</option>
                    <option value="TITLE_DEED">Title Deed / Index II / Sale Deed</option>
                    <option value="NA_ORDER_LAYOUT">NA Order &amp; Layout</option>
                    <option value="TP_ZONE_CERTIFICATE">TP Scheme / Zone Certificate</option>
                    <option value="VILLAGE_MAP_DEMARCATION">Village Map / Demarcation</option>
                    <option value="SOIL_WATER_ELECTRICITY">Soil / Water / Electricity</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="documents"
                    className="block text-xs font-bold text-slate-700 uppercase"
                  >
                    Select Files (PDF, JPEG, PNG · Max 20MB each)
                  </label>
                  <div className="mt-1.5 flex items-stretch gap-2">
                    <label
                      htmlFor="documents"
                      className="flex min-h-20 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-center text-xs text-slate-600 hover:border-slate-400"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        queueDocuments(event.dataTransfer.files);
                      }}
                    >
                      <strong className="text-slate-800">
                        Drop documents here or choose files
                      </strong>
                      <span className="mt-1">PDF, JPEG or PNG · up to 20 MB each</span>
                      {queuedFileNames.length ? (
                        <span className="mt-2 font-semibold text-[var(--brand-navy)]">
                          {queuedFileNames.length} file{queuedFileNames.length === 1 ? "" : "s"}{" "}
                          ready
                        </span>
                      ) : null}
                    </label>
                    <input
                      ref={fileInputRef}
                      id="documents"
                      name="documents"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="sr-only"
                      onChange={(event) => {
                        if (event.currentTarget.files) queueDocuments(event.currentTarget.files);
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="shrink-0 rounded-lg bg-[var(--brand-navy)] px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-90 disabled:opacity-50"
                    >
                      {isUploading
                        ? `Uploading ${queuedFileNames.length || "selected"}…`
                        : "Upload files"}
                    </button>
                  </div>
                </div>
              </div>

              {uploadStatus ? (
                <div
                  role="status"
                  className={`mt-3 rounded-lg p-3 text-xs font-medium ${
                    uploadStatus.ok
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                      : "bg-amber-50 text-amber-950 border border-amber-200"
                  }`}
                >
                  <p>{uploadStatus.message}</p>
                  {uploadStatus.results.length ? (
                    <ul className="mt-2 space-y-1">
                      {uploadStatus.results.map((result) => (
                        <li
                          key={result.fileName}
                          className="flex items-center justify-between gap-3"
                        >
                          <span>
                            {result.ok ? "✓" : "!"} {result.fileName}: {result.message}
                          </span>
                          {!result.ok ? (
                            <button
                              type="button"
                              className="rounded border border-amber-400 bg-white px-2 py-1 font-bold"
                              onClick={() => retryDocumentUpload(result.fileName)}
                              disabled={isUploading}
                            >
                              Retry
                            </button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </form>
          </div>

          {/* Document List */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-display text-lg font-bold text-slate-900">Stored Documents</h3>
            {docError ? (
              <p className="mt-2 text-xs font-semibold text-red-600">{docError}</p>
            ) : null}

            {documentList.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                No private documents uploaded yet. Use the uploader above to attach title deeds,
                revenue extracts, or search reports.
              </div>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {documentList.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-800">
                        {doc.originalFileName || doc.documentType}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">
                          {doc.documentType.replaceAll("_", " ")}
                        </span>
                        <span>·</span>
                        <span>{new Date(doc.createdAt).toLocaleDateString("en-IN")}</span>
                        <span>·</span>
                        <span
                          className={`font-semibold ${
                            doc.scanStatus === "CLEAN" ? "text-emerald-700" : "text-amber-700"
                          }`}
                        >
                          Scan: {doc.scanStatus}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleViewDocument(doc.id)}
                      disabled={loadingDocId === doc.id}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {loadingDocId === doc.id ? "Generating link…" : "View document ↗"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Interested leads */}
      {activeTab === "buyers" && (
        <section aria-labelledby="buyers-heading" className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 id="buyers-heading" className="font-display text-xl font-bold text-slate-900">
              Interested Leads & Site Visits
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Matched buyer leads and scheduled on-site inspections for this property.
            </p>
          </div>

          {/* Matched Buyer Leads Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Interested Leads ({matchesCount})
              </h3>
            </div>

            {matchesCount === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No buyer leads are linked to this property yet. Open a lead to add a property match.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {interestedBuyers.matches.map((match) => (
                  <div
                    key={match.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/leads/${match.leadId}`}
                          className="font-mono text-xs font-bold text-[var(--brand-navy)] hover:underline"
                        >
                          {match.leadReference}
                        </Link>
                        <span className="font-semibold text-slate-900">{match.leadName}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                          {leadStatusLabel(match.leadStatus)}
                        </span>
                      </div>
                      {match.leadPhone ? (
                        <p className="mt-0.5 text-xs text-slate-500">{match.leadPhone}</p>
                      ) : null}
                      {match.notes ? (
                        <p className="mt-1 text-xs text-slate-600 italic">“{match.notes}”</p>
                      ) : null}
                    </div>

                    <Link
                      href={`/admin/leads/${match.leadId}`}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Open Lead ↗
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Site Visits Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Site Visits ({visitsCount})
            </h3>

            {visitsCount === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No site visits recorded for this property yet.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {interestedBuyers.siteVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{visit.leadName}</span>
                        <Link
                          href={`/admin/leads/${visit.leadId}`}
                          className="font-mono text-xs font-bold text-slate-500 hover:underline"
                        >
                          {visit.leadReference}
                        </Link>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                          {visit.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Scheduled for: {new Date(visit.scheduledAt).toLocaleString("en-IN")}
                      </p>
                      {visit.notes ? (
                        <p className="mt-1 text-xs text-slate-600 italic">“{visit.notes}”</p>
                      ) : null}
                    </div>

                    <Link
                      href="/admin/site-visits"
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Site Visits Queue ↗
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tab 6: Activity & Availability */}
      {activeTab === "activity" && (
        <section aria-labelledby="activity-heading" className="space-y-6">
          <h2 id="activity-heading" className="sr-only">
            Property Activity & Availability
          </h2>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-display text-xl font-semibold text-slate-900">Property Status</h3>
            <p className="mt-1 text-sm text-slate-600">
              Current availability is{" "}
              <strong className="rounded bg-slate-100 px-2 py-0.5 text-slate-900 font-bold">
                {row.availability_status.replaceAll("_", " ")}
              </strong>
              . Publication status is{" "}
              <strong className="rounded bg-slate-100 px-2 py-0.5 text-slate-900 font-bold">
                {row.publication_status}
              </strong>
              .
            </p>

            {/* Explicit Mark Property Sold Action */}
            {(row.availability_status === "AVAILABLE" ||
              row.availability_status === "UNDER_NEGOTIATION") &&
            markPropertySoldAction ? (
              <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50/60 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="font-display text-base font-bold text-purple-950">
                      Mark this property as sold
                    </h4>
                    <p className="mt-1 text-xs text-purple-900">
                      Use this after the transaction has completed. The property will no longer
                      appear as available.
                    </p>
                  </div>
                  <form
                    action={markPropertySoldAction}
                    onSubmit={(event) => {
                      if (!window.confirm("Mark this property as sold?")) event.preventDefault();
                    }}
                  >
                    <input type="hidden" name="propertyId" value={id} />
                    <input type="hidden" name="expectedUpdatedAt" value={row.updated_at} />
                    <button
                      type="submit"
                      className="rounded-lg bg-purple-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-purple-800 transition-colors"
                    >
                      Mark Property Sold
                    </button>
                  </form>
                </div>
              </div>
            ) : null}

            {/* General Availability Dropdown */}
            <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-5">
              {row.publication_status !== "ARCHIVED" &&
              nextAvailability(row.availability_status).length ? (
                <form action={changeAvailabilityAction} className="flex flex-wrap gap-2">
                  <input type="hidden" name="propertyId" value={id} />
                  <input type="hidden" name="expectedUpdatedAt" value={row.updated_at} />
                  <label className="sr-only" htmlFor="nextStatus">
                    Next availability
                  </label>
                  <select
                    id="nextStatus"
                    name="nextStatus"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
                  >
                    {nextAvailability(row.availability_status).map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                  <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors">
                    Change availability
                  </button>
                </form>
              ) : null}

              {row.publication_status === "DRAFT" ? (
                <form action={archivePropertyAction}>
                  <input type="hidden" name="propertyId" value={id} />
                  <input type="hidden" name="expectedUpdatedAt" value={row.updated_at} />
                  <button className="rounded-lg border border-red-300 bg-red-50/50 px-4 py-2 text-sm font-bold text-red-800 hover:bg-red-100 transition-colors">
                    Archive property
                  </button>
                </form>
              ) : row.publication_status === "ARCHIVED" ? (
                <form action={restorePropertyAction}>
                  <input type="hidden" name="propertyId" value={id} />
                  <input type="hidden" name="expectedUpdatedAt" value={row.updated_at} />
                  <button className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-100 transition-colors">
                    Restore as draft
                  </button>
                </form>
              ) : null}

              {deletePropertyDraftAction ? (
                <DeleteDraftButton
                  propertyId={id}
                  expectedUpdatedAt={row.updated_at}
                  propertyTitle={row.listing_title ?? row.property_code}
                  isPublished={row.publication_status === "PUBLISHED"}
                  action={deletePropertyDraftAction}
                  variant="danger-button"
                  buttonText={
                    row.publication_status === "PUBLISHED"
                      ? "Unpublish & delete permanently"
                      : "Delete draft permanently"
                  }
                  className="px-4 py-2 text-sm"
                />
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-display text-xl font-semibold text-slate-900">Activity</h3>
            <p className="mt-1 text-sm text-slate-600">
              A readable history of property, document, buyer, and visit updates.
            </p>
            {activity.length ? (
              <ol className="mt-5 divide-y divide-slate-100">
                {activity.map((item) => (
                  <li key={item.id} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr]">
                    <time className="text-xs text-slate-500" dateTime={item.at}>
                      {new Intl.DateTimeFormat("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Kolkata",
                      }).format(new Date(item.at))}
                    </time>
                    <div>
                      <p className="text-sm font-bold capitalize text-slate-900">{item.label}</p>
                      {item.detail ? (
                        <p className="mt-0.5 text-xs text-slate-600">{item.detail}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-5 rounded-lg border border-dashed border-slate-200 p-5 text-sm text-slate-500">
                No activity has been recorded yet.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function DetailSection({
  title,
  children,
}: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
      <dl className="mt-3 space-y-2.5">{children}</dl>
    </section>
  );
}

function Detail({ label, value }: Readonly<{ label: string; value: string | null | undefined }>) {
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="break-words font-medium text-slate-900">{value || "Not recorded"}</dd>
    </div>
  );
}

function friendly(value: string | null | undefined) {
  return value
    ? value
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/^./, (letter) => letter.toUpperCase())
    : null;
}
