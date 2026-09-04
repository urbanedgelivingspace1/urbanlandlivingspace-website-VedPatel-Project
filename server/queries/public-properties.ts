import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  PublicPropertyCardDto,
  PublicPropertyDetailDto,
} from "@/features/properties/domain/contracts";
import {
  projectPublicPropertyCard,
  projectPublicPropertyDetail,
} from "@/features/properties/queries/public-property-projector";
import type { Database } from "@/types/database";

const publicListingFields =
  "id,property_code,public_slug,land_category,primary_transaction_type,listing_title,short_description,availability_status,featured,published_at,district_id,district_name,subdistrict_id,subdistrict_name,place_id,place_name,locality_id,locality_name,landmark_text,public_address,display_area_value,display_area_unit_code,display_area_unit_name,display_area_unit_symbol,location_visibility,public_latitude,public_longitude,public_accuracy_m,offer_transaction_type,price_mode,currency_code,price_amount,price_min,price_max,price_per_unit,price_unit_code,is_negotiable,cover_media_id,cover_object_path,cover_alt_text,cover_width_px,cover_height_px" as const;
const publicDetailFields =
  `${publicListingFields},description,seo_title,seo_description,canonical_path` as const;
const publicMediaFields =
  "id,property_id,media_type,object_path,mime_type,width_px,height_px,duration_seconds,alt_text,caption,is_cover,sort_order,external_url,external_provider,external_media_id,media_subtype" as const;
const publicVerificationFields =
  "id,property_id,check_code,label,explanation,public_status,reviewed_at,check_date,scope,limitation,source_class" as const;

export async function listPublicPropertyCards(
  client: SupabaseClient<Database>,
  limit = 24,
): Promise<readonly PublicPropertyCardDto[]> {
  const boundedLimit = Math.max(1, Math.min(limit, 60));
  const { data, error } = await client
    .from("public_property_listings")
    .select(publicListingFields)
    .order("published_at", { ascending: false })
    .limit(boundedLimit);

  if (error) throw error;
  return data.map(projectPublicPropertyCard);
}

export async function getPublicPropertyDetail(
  client: SupabaseClient<Database>,
  slug: string,
): Promise<PublicPropertyDetailDto | null> {
  const { data: property, error: propertyError } = await client
    .from("public_property_details")
    .select(publicDetailFields)
    .eq("public_slug", slug)
    .maybeSingle();
  if (propertyError) throw propertyError;
  if (!property) return null;

  const [{ data: media, error: mediaError }, { data: verifications, error: verificationError }] =
    await Promise.all([
      client
        .from("public_property_media")
        .select(publicMediaFields)
        .eq("property_id", property.id)
        .order("sort_order"),
      client
        .from("public_property_verification_summaries")
        .select(publicVerificationFields)
        .eq("property_id", property.id),
    ]);
  if (mediaError) throw mediaError;
  if (verificationError) throw verificationError;

  return projectPublicPropertyDetail(property, media, verifications);
}
