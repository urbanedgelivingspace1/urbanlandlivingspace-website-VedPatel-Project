import type {
  PublicMediaDto,
  PublicPropertyCardDto,
  PublicPropertyDetailDto,
  PublicVerificationSummaryDto,
} from "@/features/properties/domain/contracts";
import { projectPublicLocation } from "@/lib/privacy/public-location";
import { assertSafePublicVerificationCopy } from "@/features/verification/domain/verification-policy";
import type {
  PublicMediaRow,
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

function projectCover(row: PublicPropertyListingRow): PublicMediaDto | null {
  if (!row.cover_media_id || !row.cover_object_path) return null;
  return {
    id: row.cover_media_id,
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
    mediaSubtype: row.media_subtype,
    altText: row.alt_text,
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
): PublicPropertyDetailDto {
  return {
    ...projectPublicPropertyCard(row),
    description: row.description,
    seo: {
      title: row.seo_title,
      description: row.seo_description,
      canonicalPath: row.canonical_path,
    },
    media: media.map(projectPublicMedia),
    verifications: verifications.map(projectPublicVerification),
  };
}
