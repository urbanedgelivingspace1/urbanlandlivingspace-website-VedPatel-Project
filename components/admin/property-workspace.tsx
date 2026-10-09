"use client";

import Link from "next/link";

import { DeleteDraftButton } from "@/components/admin/delete-draft-button";
import { PropertyPublicationPanel } from "@/components/admin/property-publication-panel";
import type { PropertyInterestedBuyers } from "@/features/crm/domain/contracts";
import { leadStatusLabel } from "@/features/crm/domain/pipeline";
import type { AdminMediaAssetDto } from "@/features/media/domain/contracts";
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
}>;

export function PropertyWorkspace({
  property,
  readiness,
  initialTab = "overview",
  mediaList = [],
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
}: Props) {
  const activeTab = initialTab;

  const row = property.property;
  const id = row.id;
  const photoAndBrochureMedia = mediaList.filter(
    (asset) => !asset.archivedAt && (asset.mediaType === "IMAGE" || asset.mediaType === "BROCHURE"),
  );

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
              {friendly(row.land_category)} · {adminTransactionLabel(row.primary_transaction_type)}
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
            <Link href="/admin/properties" className="button button-secondary">
              ← Properties
            </Link>
            <Link href={`/admin/properties/${id}/media`} className="button button-secondary">
              Add Photos / Brochure
            </Link>
            {row.publication_status !== "ARCHIVED" ? (
              <Link href={`/admin/properties/${id}/edit`} className="button button-primary">
                Edit
              </Link>
            ) : null}
            <Link href={`/admin/properties/${id}/preview`} className="button button-secondary">
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
          Changes saved successfully.
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
            aria-current={activeTab === "overview" ? "page" : undefined}
            className="admin-tab"
          >
            Overview
          </Link>
          <Link
            href={`/admin/properties/${id}?tab=media`}
            aria-current={activeTab === "media" ? "page" : undefined}
            className="admin-tab"
          >
            Photos &amp; brochure
          </Link>
          <Link
            href={`/admin/properties/${id}?tab=buyers`}
            aria-current={activeTab === "buyers" ? "page" : undefined}
            className="admin-tab"
          >
            Leads & visits{activeTab === "buyers" ? ` (${matchesCount + visitsCount})` : ""}
          </Link>
          <Link
            href={`/admin/properties/${id}?tab=activity`}
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
                Photos &amp; Brochure ({photoAndBrochureMedia.length})
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Property photos and an optional Google Drive brochure.
              </p>
            </div>
            <Link href={`/admin/properties/${id}/media`} className="button button-primary">
              Add or Manage Photos
            </Link>
          </div>

          {photoAndBrochureMedia.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm font-medium text-slate-600">
                No property photos or brochure have been added yet.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Add at least one photo and choose a cover before publishing the property.
              </p>
              <Link href={`/admin/properties/${id}/media`} className="button button-primary mt-4">
                Upload photos now
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {photoAndBrochureMedia.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs"
                >
                  <div className="relative aspect-4/3 w-full bg-slate-100">
                    {asset.previewUrl &&
                    (asset.mediaType === "IMAGE" || asset.mediaType === "MAP_IMAGE") ? (
                      // Admin previews may be short-lived signed URLs from the private media
                      // bucket, so they cannot be represented by a static Next image allowlist.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.previewUrl}
                        alt={asset.altText || "Property asset"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center text-slate-500">
                        <span className="text-2xl" aria-hidden="true">
                          {asset.mediaType === "BROCHURE" ? "↓" : "□"}
                        </span>
                        <span className="text-xs font-bold">
                          {asset.mediaType === "BROCHURE" ? "Property brochure" : "Property photo"}
                        </span>
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
                      {asset.processingStatus === "APPROVED"
                        ? "Added"
                        : asset.processingStatus === "FAILED"
                          ? "Needs attention"
                          : "Processing"}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-xs font-semibold text-slate-800">
                      {asset.caption ||
                        asset.altText ||
                        (asset.mediaType === "BROCHURE" ? "Property brochure" : "Property photo")}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {asset.mediaType === "BROCHURE" ? "Brochure" : "Photo"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
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

function adminTransactionLabel(value: string | null | undefined) {
  return value === "BUY" ? "Sell" : friendly(value);
}
