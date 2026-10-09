import { notFound } from "next/navigation";

import { isNonProductionEnvironment } from "@/config/environment-schema";
import { PropertyDraftForm } from "@/components/admin/property-draft-form";
import { PropertyWorkflow } from "@/components/admin/property-workflow";
import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import { getAdminProperty, getAdminReferenceData } from "@/server/services/property-drafts";

import { deletePropertyDraftAction, updatePropertyDraftAction } from "../../actions";

export default async function EditPropertyPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  await requireActiveAdminPage();
  const [record, references] = await Promise.all([getAdminProperty(id), getAdminReferenceData()]);
  if (!record) notFound();
  if (record.property.publication_status === "ARCHIVED") {
    return (
      <section className="rounded-xl border border-amber-300 bg-amber-50 p-6">
        <h1 className="text-2xl font-bold">Editing is unavailable</h1>
        <p className="mt-2 text-sm">Restore this archived property before editing it.</p>
      </section>
    );
  }
  const row = record.property;
  const isPublished = row.publication_status === "PUBLISHED";
  const action = updatePropertyDraftAction.bind(
    null,
    id,
    row.updated_at,
    isPublished,
    row.public_slug,
  );
  const category = record.agricultural ?? record.na ?? record.industrial;
  const values = {
    landCategory: row.land_category,
    primaryTransactionType:
      row.primary_transaction_type === "BUY" ? "SELL" : row.primary_transaction_type,
    listingTitle: row.listing_title,
    publicSlug: row.public_slug,
    shortDescription: row.short_description,
    description: row.description,
    districtId: row.district_id,
    publicAddress: row.public_address,
    googleMapsEmbedUrl: row.google_maps_embed_url,
    landmarkText: row.landmark_text,
    displayAreaValue: row.display_area_value,
    displayAreaUnitId: row.display_area_unit_id,
    priceMode: record.offer?.price_mode,
    priceAmount: record.offer?.price_amount,
    priceMinimum: record.offer?.price_min,
    priceMaximum: record.offer?.price_max,
    pricePerUnit: record.offer?.price_per_unit,
    priceUnitId: record.offer?.price_unit_id,
    negotiable: record.offer?.is_negotiable,
    commercialTerms: record.offer?.commercial_terms,
    parcelLabel: record.parcel?.parcel_label,
    parcelAreaValue: record.parcel?.display_area_value,
    parcelAreaUnitId: record.parcel?.display_area_unit_id,
    identifierType: record.parcel?.identifier?.identifier_type,
    identifierValue: record.parcel?.identifier?.identifier_value,
    identifierVisibility: record.parcel?.identifier?.public_visibility,
    parcelNotesInternal: record.parcel?.notes_internal,
    reservationStatus: record.planning?.reservation_status,
    roadReservationStatus: record.planning?.road_reservation_status,
    planningPublicNotes: record.planning?.planning_notes_public,
    planningInternalNotes: record.planning?.planning_notes_internal,
    tenureType: record.agricultural?.tenure_type,
    irrigationStatus: record.agricultural?.irrigation_status,
    currentCultivationStatus: record.agricultural?.current_cultivation_status,
    roadTouch: record.agricultural?.road_touch,
    naStatus: record.na?.na_status,
    naPurpose: record.na?.na_purpose,
    developmentPermissionStatus: record.na?.development_permission_status,
    frontageMetres: record.na?.frontage_m,
    cornerPlot: record.na?.corner_plot,
    restrictionSummary: record.na?.restriction_summary,
    industrialSubtype: record.industrial?.industrial_subtype,
    industrialAuthorityName: record.industrial?.industrial_authority_name,
    industrialTenure: record.industrial?.industrial_tenure,
    gidcPlotNumber: record.industrial?.gidc_plot_number,
    existingShedPresent: record.industrial?.existing_shed_present,
    powerStatus: record.industrial?.power_status,
    connectivitySummary: record.industrial?.connectivity_summary,
    categoryRoadWidthMetres: category?.road_width_m,
    partyId: record.partyLink?.party_id,
    partyRole: record.partyLink?.role,
    ownershipSharePercent: record.partyLink?.ownership_share_percent,
    partyNotesInternal: record.partyLink?.notes_internal,
    sourceType: record.sourceLink?.source_type,
    sourceName: record.sourceLink?.source_name,
    sourceReference: record.sourceLink?.source_reference,
    sourceNotesInternal: record.sourceLink?.notes_internal,
    expectedUpdatedAt: row.updated_at,
  };
  return (
    <div className="mx-auto max-w-5xl">
      <PropertyWorkflow currentStep="details" propertyId={id}>
        <header>
          <p className="text-xs font-bold tracking-widest text-[var(--brand-gold-deep)] uppercase">
            {row.property_code}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Edit Property</h1>
          <p className="mt-1 text-sm text-slate-600">
            Update the information you have now. Other details can remain blank until they are
            known.
          </p>
        </header>
        {isPublished ? (
          <p
            role="note"
            className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-950"
          >
            This property is published. Changes will update the live listing when saved.
          </p>
        ) : null}
        <PropertyDraftForm
          action={action}
          references={references}
          initialValues={values}
          submitLabel={isPublished ? "Save Changes" : "Save Draft"}
          allowTestPresets={isNonProductionEnvironment()}
          propertyId={row.id}
          isPublished={isPublished}
          deleteAction={deletePropertyDraftAction}
        />
      </PropertyWorkflow>
    </div>
  );
}
