import Link from "next/link";
import { notFound } from "next/navigation";

import { PropertyPublicationPanel } from "@/components/admin/property-publication-panel";
import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import { getAdminProperty } from "@/server/services/property-drafts";
import { getPublicationReadiness } from "@/server/services/property-publication";
import type { AvailabilityStatus } from "@/types/database";

import {
  archivePropertyAction,
  changeAvailabilityAction,
  publishPropertyAction,
  restorePropertyAction,
  unpublishPropertyAction,
} from "../actions";

function nextAvailability(status: AvailabilityStatus): AvailabilityStatus[] {
  if (status === "AVAILABLE")
    return ["UNDER_NEGOTIATION", "SOLD", "RENTED", "LEASED", "OFF_MARKET"];
  if (status === "UNDER_NEGOTIATION")
    return ["AVAILABLE", "SOLD", "RENTED", "LEASED", "OFF_MARKET"];
  if (status === "SOLD") return ["OFF_MARKET"];
  if (status === "RENTED" || status === "LEASED") return ["AVAILABLE", "OFF_MARKET"];
  return [];
}

export default async function AdminPropertyDetailPage({
  params,
  searchParams,
}: Readonly<{ params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }>) {
  const { id } = await params;
  await requireActiveAdminPage();
  const property = await getAdminProperty(id);
  if (!property) notFound();
  const readiness = await getPublicationReadiness(id);
  const { saved } = await searchParams;
  const row = property.property;
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-[var(--brand-gold-deep)] uppercase">
            {row.property_code}
          </p>
          <h1 className="font-display text-3xl font-semibold">
            {row.listing_title || "Untitled property draft"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {row.land_category} · {row.primary_transaction_type} · {property.districtName}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/properties"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold"
          >
            Back to inventory
          </Link>
          <Link
            href={`/admin/properties/${id}/preview`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold"
          >
            Public-safe preview
          </Link>
          <Link
            href={`/admin/properties/${id}/media`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold"
          >
            Manage media
          </Link>
          <Link
            href={`/admin/properties/${id}/verification`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold"
          >
            Verification
          </Link>
          <Link
            href={`/admin/site-visits?q=${encodeURIComponent(row.property_code)}`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold"
          >
            Site visits
          </Link>
          {row.publication_status === "DRAFT" ? (
            <Link
              href={`/admin/properties/${id}/edit`}
              className="rounded-lg bg-[var(--brand-navy)] px-4 py-2 text-sm font-bold text-white"
            >
              Edit draft
            </Link>
          ) : null}
        </div>
      </header>
      {saved ? (
        <p
          role="status"
          className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          Draft saved.
        </p>
      ) : null}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Publication" value={row.publication_status} />
        <Metric label="Availability" value={row.availability_status} />
        <Metric
          label="Media"
          value={property.mediaCount ? `${property.mediaCount} assets` : "No media"}
        />
        <Metric
          label="Verification"
          value={
            property.verificationCount
              ? `${property.verificationCount} scoped checks`
              : "Not started"
          }
        />
      </section>
      <PropertyPublicationPanel
        readiness={readiness}
        expectedUpdatedAt={row.updated_at}
        publishAction={publishPropertyAction}
        unpublishAction={unpublishPropertyAction}
      />
      <section className="grid gap-5 lg:grid-cols-2">
        <DetailSection title="Core">
          <Detail label="Immutable Property ID" value={row.property_code} />
          <Detail label="Public slug" value={row.public_slug} />
          <Detail label="Area" value={`${row.display_area_value} ${property.areaUnitName}`} />
          <Detail label="Public address" value={row.public_address} />
        </DetailSection>
        <DetailSection title="Offer">
          <Detail label="Mode" value={property.offer?.price_mode} />
          <Detail label="Amount" value={property.offer?.price_amount?.toString()} />
          <Detail label="Negotiable" value={property.offer?.is_negotiable ? "Yes" : "No"} />
        </DetailSection>
        <DetailSection title="Public-safe location summary">
          <Detail label="Visibility" value={property.location?.location_visibility} />
          <Detail
            label="Public-safe point"
            value={
              property.location?.public_latitude === null ||
              property.location?.public_latitude === undefined
                ? null
                : `${property.location.public_latitude}, ${property.location.public_longitude}`
            }
          />
        </DetailSection>
        <DetailSection title="Parcel and planning">
          <Detail label="Parcel" value={property.parcel?.parcel_label} />
          <Detail
            label="Identifier"
            value={
              property.parcel?.identifier
                ? `${property.parcel.identifier.identifier_type}: ${property.parcel.identifier.identifier_value}`
                : null
            }
          />
          <Detail label="Reservation" value={property.planning?.reservation_status} />
        </DetailSection>
        <DetailSection title={`${row.land_category} details`}>
          <Detail
            label="Agricultural irrigation"
            value={property.agricultural?.irrigation_status}
          />
          <Detail label="NA status" value={property.na?.na_status} />
          <Detail label="Industrial subtype" value={property.industrial?.industrial_subtype} />
        </DetailSection>
        <DetailSection title="Internal relationships">
          <Detail label="Primary party ID" value={property.partyLink?.party_id} />
          <Detail label="Party role" value={property.partyLink?.role} />
          <Detail
            label="Source"
            value={property.sourceLink?.source_name ?? property.sourceLink?.source_type}
          />
        </DetailSection>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-display text-xl font-semibold">Controlled status actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {row.publication_status !== "ARCHIVED" &&
          nextAvailability(row.availability_status).length ? (
            <form action={changeAvailabilityAction} className="flex gap-2">
              <input type="hidden" name="propertyId" value={id} />
              <input type="hidden" name="expectedUpdatedAt" value={row.updated_at} />
              <label className="sr-only" htmlFor="nextStatus">
                Next availability
              </label>
              <select
                id="nextStatus"
                name="nextStatus"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {nextAvailability(row.availability_status).map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
              <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold">
                Change availability
              </button>
            </form>
          ) : null}
          {row.publication_status !== "PUBLISHED" && row.publication_status !== "ARCHIVED" ? (
            <>
              <form action={archivePropertyAction}>
                <input type="hidden" name="propertyId" value={id} />
                <input type="hidden" name="expectedUpdatedAt" value={row.updated_at} />
                <button className="rounded-lg border border-red-300 px-3 py-2 text-sm font-bold text-red-800">
                  Archive property
                </button>
              </form>
            </>
          ) : row.publication_status === "ARCHIVED" ? (
            <form action={restorePropertyAction}>
              <input type="hidden" name="propertyId" value={id} />
              <input type="hidden" name="expectedUpdatedAt" value={row.updated_at} />
              <button className="rounded-lg border border-emerald-300 px-3 py-2 text-sm font-bold text-emerald-800">
                Restore as draft
              </button>
            </form>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="mt-1 font-semibold">{value.replaceAll("_", " ")}</p>
    </div>
  );
}
function DetailSection({
  title,
  children,
}: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <dl className="mt-3 space-y-2">{children}</dl>
    </section>
  );
}
function Detail({ label, value }: Readonly<{ label: string; value: string | null | undefined }>) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="break-words font-medium">{value || "Not recorded"}</dd>
    </div>
  );
}
