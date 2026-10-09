import type {
  PublicMediaDto,
  PublicCategoryDetailsDto,
  PublicParcelIdentifierDto,
  PublicPropertyCardDto,
  PublicPropertyDetailDto,
  PublicVerificationSummaryDto,
} from "@/features/properties/domain/contracts";
import { projectPublicLocation } from "@/lib/privacy/public-location";
import { assertSafePublicVerificationCopy } from "@/features/verification/domain/verification-policy";
import type {
  PublicMediaRow,
  PublicParcelIdentifierRow,
  PublicPropertyDetailRow,
  PublicPropertyListingRow,
  PublicVerificationSummaryRow,
} from "@/types/database";

function projectPrice(row: PublicPropertyListingRow): PublicPropertyCardDto["price"] {
  if (!row.offer_transaction_type || !row.price_mode || !row.currency_code) return null;
  return {
    transactionType: row.offer_transaction_type,
    mode: row.price_mode,
    currency: row.currency_code,
    amount: row.price_amount,
    minimum: row.price_min,
    maximum: row.price_max,
    perUnit: row.price_per_unit,
    unitCode: row.price_unit_code,
    negotiable: row.is_negotiable ?? false,
  };
}

function projectCategoryDetails(row: PublicPropertyDetailRow): PublicCategoryDetailsDto {
  if (row.land_category === "AGRICULTURAL") {
    return {
      category: "AGRICULTURAL",
      tenureType: row.agricultural_tenure_type,
      agriculturalUseStatus: row.agricultural_use_status,
      irrigationStatus: row.irrigation_status,
      primaryIrrigationSource: row.primary_irrigation_source,
      borewellCount: row.borewell_count,
      wellCount: row.well_count,
      canalAccessStatus: row.canal_access_status,
      electricityStatus: row.agricultural_electricity_status,
      fencingStatus: row.fencing_status,
      topography: row.topography,
      landShape: row.land_shape,
      structurePresent: row.agricultural_structure_present,
      roadTouch: row.agricultural_road_touch,
      roadWidthMetres: row.agricultural_road_width_m,
      boundarySummary: row.boundary_summary_public,
      currentCultivationStatus: row.current_cultivation_status,
    };
  }
  if (row.land_category === "NA") {
    return {
      category: "NA",
      status: row.na_status,
      purpose: row.na_purpose,
      orderReference: row.na_order_reference,
      orderDate: row.na_order_date,
      developmentPermissionStatus: row.development_permission_status,
      layoutApprovalStatus: row.layout_approval_status,
      roadWidthMetres: row.na_road_width_m,
      frontageMetres: row.na_frontage_m,
      cornerPlot: row.na_corner_plot,
      waterStatus: row.na_water_status,
      electricityStatus: row.na_electricity_status,
      drainageStatus: row.na_drainage_status,
    };
  }
  return {
    category: "INDUSTRIAL",
    subtype: row.industrial_subtype,
    authorityName: row.industrial_authority_name,
    tenure: row.industrial_tenure,
    gidcEstateName: row.gidc_estate_name,
    gidcPlotNumber: row.gidc_plot_number,
    gidcShedNumber: row.gidc_shed_number,
    allotmentStatus: row.allotment_status,
    possessionStatus: row.possession_status,
    transferStatus: row.transfer_status,
    permittedUse: row.permitted_industrial_use,
    existingShedPresent: row.existing_shed_present,
    shedArea:
      row.shed_area_value === null
        ? null
        : { value: row.shed_area_value, unitCode: row.shed_area_unit_code },
    openArea:
      row.open_area_value === null
        ? null
        : { value: row.open_area_value, unitCode: row.open_area_unit_code },
    roadWidthMetres: row.industrial_road_width_m,
    truckLoadingAccess: row.truck_loading_access,
    powerStatus: row.power_status,
    sanctionedLoadKw: row.sanctioned_load_kw,
    transformerStatus: row.transformer_status,
    waterStatus: row.industrial_water_status,
    drainageStatus: row.industrial_drainage_status,
    cetpStatus: row.cetp_status,
    etpStatus: row.etp_status,
    gasStatus: row.gas_status,
    connectivitySummary: row.connectivity_summary,
  };
}

export function projectPublicParcelIdentifier(
  row: PublicParcelIdentifierRow,
): PublicParcelIdentifierDto {
  return {
    type: row.identifier_type,
    value: row.identifier_value,
    primary: row.is_primary,
    parcelSequence: row.sequence_no,
  };
}

function projectCover(row: PublicPropertyListingRow): PublicMediaDto | null {
  if (!row.cover_media_id || !row.cover_object_path) return null;
  return {
    id: row.cover_media_id,
    mediaType: "IMAGE",
    objectPath: row.cover_object_path,
    altText: row.cover_alt_text,
    width: row.cover_width_px,
    height: row.cover_height_px,
  };
}

export function projectPublicPropertyCard(row: PublicPropertyListingRow): PublicPropertyCardDto {
  if (!row.public_slug || !row.listing_title || !row.published_at) {
    throw new Error("Public projection returned an incomplete published property.");
  }

  return {
    id: row.id,
    propertyCode: row.property_code,
    slug: row.public_slug,
    title: row.listing_title,
    summary: row.short_description,
    category: row.land_category,
    transactionType: row.primary_transaction_type,
    availability: row.availability_status,
    featured: row.featured,
    publishedAt: row.published_at,
    area: {
      value: row.display_area_value,
      unitCode: row.display_area_unit_code,
      unitLabel: row.display_area_unit_name,
      symbol: row.display_area_unit_symbol,
    },
    location: projectPublicLocation({
      visibility: row.location_visibility,
      publicLatitude: row.public_latitude,
      publicLongitude: row.public_longitude,
      publicAccuracyMetres: row.public_accuracy_m,
      districtName: row.district_name,
      subdistrictName: row.subdistrict_name,
      placeName: row.place_name,
      localityName: row.locality_name,
      publicAddress: row.public_address,
    }),
    price: projectPrice(row),
    cover: projectCover(row),
  };
}

export function projectPublicMedia(row: PublicMediaRow): PublicMediaDto {
  if (!row.object_path && (!row.external_url || !row.external_provider)) {
    throw new Error("Public media projection returned no safe locator.");
  }
  return {
    id: row.id,
    mediaType: row.media_type,
    objectPath: row.object_path,
    externalUrl: row.external_url,
    externalProvider: row.external_provider,
    externalMediaId: row.external_media_id,
    mediaSubtype: row.media_subtype,
    altText: row.alt_text,
    caption: row.caption,
    width: row.width_px,
    height: row.height_px,
  };
}

export function projectPublicVerification(
  row: PublicVerificationSummaryRow,
): PublicVerificationSummaryDto {
  if (!row.label || !row.public_status || !row.scope || !row.limitation) {
    throw new Error("A public verification requires approved, scoped, limited copy.");
  }
  const safe = assertSafePublicVerificationCopy({
    label: row.label,
    explanation: row.explanation ?? "",
    scope: row.scope,
    limitation: row.limitation,
    sourceClass: row.source_class,
  });
  return {
    code: row.check_code,
    label: safe.label,
    explanation: safe.explanation,
    status: row.public_status,
    reviewedAt: row.reviewed_at,
    checkDate: row.check_date,
    scope: safe.scope,
    limitation: safe.limitation,
    sourceClass: safe.sourceClass,
  };
}

export function projectPublicPropertyDetail(
  row: PublicPropertyDetailRow,
  media: readonly PublicMediaRow[],
  verifications: readonly PublicVerificationSummaryRow[],
  identifiers: readonly PublicParcelIdentifierRow[] = [],
  googleMapsEmbedUrl: string | null = null,
): PublicPropertyDetailDto {
  return {
    ...projectPublicPropertyCard(row),
    publicAddress: row.public_address,
    description: row.description,
    googleMapsEmbedUrl,
    seo: {
      title: row.seo_title,
      description: row.seo_description,
      canonicalPath: row.canonical_path,
    },
    media: media.map(projectPublicMedia),
    verifications: verifications.map(projectPublicVerification),
    categoryDetails: projectCategoryDetails(row),
    planning: {
      authorityName: row.planning_authority_name,
      zoneName: row.development_plan_zone_name,
      useClassification: row.use_classification,
      tpSchemeNumber: row.tp_scheme_number,
      tpPlotType: row.tp_plot_type,
      tpPlotNumber: row.tp_plot_number,
      publicNotes: row.planning_notes_public,
    },
    parcelIdentifiers: identifiers.map(projectPublicParcelIdentifier),
  };
}
