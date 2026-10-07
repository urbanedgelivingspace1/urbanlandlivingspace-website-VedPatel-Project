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
  `${publicListingFields},description,seo_title,seo_description,canonical_path,agricultural_tenure_type,agricultural_use_status,irrigation_status,primary_irrigation_source,borewell_count,well_count,canal_access_status,agricultural_electricity_status,fencing_status,topography,land_shape,agricultural_structure_present,agricultural_road_touch,agricultural_road_width_m,boundary_summary_public,current_cultivation_status,na_status,na_purpose,na_order_reference,na_order_date,development_permission_status,layout_approval_status,na_road_width_m,na_frontage_m,na_corner_plot,na_water_status,na_electricity_status,na_drainage_status,industrial_subtype,industrial_authority_name,industrial_tenure,gidc_estate_name,gidc_plot_number,gidc_shed_number,allotment_status,possession_status,transfer_status,permitted_industrial_use,existing_shed_present,shed_area_value,shed_area_unit_code,open_area_value,open_area_unit_code,industrial_road_width_m,truck_loading_access,power_status,sanctioned_load_kw,transformer_status,industrial_water_status,industrial_drainage_status,cetp_status,etp_status,gas_status,connectivity_summary,planning_notes_public,planning_authority_name,development_plan_zone_name,use_classification,tp_scheme_number,tp_plot_type,tp_plot_number` as const;
const publicMediaFields =
  "id,property_id,media_type,object_path,mime_type,width_px,height_px,duration_seconds,alt_text,caption,is_cover,sort_order,external_url,external_provider,external_media_id,media_subtype" as const;
const publicVerificationFields =
  "id,property_id,check_code,label,explanation,public_status,reviewed_at,check_date,scope,limitation,source_class" as const;
const publicParcelIdentifierFields =
  "property_id,identifier_type,identifier_value,is_primary,sequence_no" as const;

export async function listPublicPropertyCards(
  client: SupabaseClient<Database>,
  limit = 24,
  constraints: Readonly<{
    category?: PublicPropertyCardDto["category"];
    transactionType?: PublicPropertyCardDto["transactionType"];
    featuredOnly?: boolean;
  }> = {},
): Promise<readonly PublicPropertyCardDto[]> {
  const boundedLimit = Math.max(1, Math.min(limit, 60));
  let query = client
    .from("public_property_listings")
    .select(publicListingFields)
    .order("published_at", { ascending: false })
    .limit(boundedLimit);
  if (constraints.category) query = query.eq("land_category", constraints.category);
  if (constraints.transactionType)
    query = query.eq("primary_transaction_type", constraints.transactionType);
  if (constraints.featuredOnly) query = query.eq("featured", true);
  const { data, error } = await query;

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

  const [
    { data: googleMap, error: googleMapError },
    { data: media, error: mediaError },
    { data: verifications, error: verificationError },
    { data: identifiers, error: identifierError },
  ] = await Promise.all([
    client
      .from("public_property_google_maps")
      .select("google_maps_embed_url")
      .eq("property_id", property.id)
      .maybeSingle(),
    client
      .from("public_property_media")
      .select(publicMediaFields)
      .eq("property_id", property.id)
      .order("sort_order"),
    client
      .from("public_property_verification_summaries")
      .select(publicVerificationFields)
      .eq("property_id", property.id),
    client
      .from("public_property_parcel_identifiers")
      .select(publicParcelIdentifierFields)
      .eq("property_id", property.id)
      .order("sequence_no")
      .order("is_primary", { ascending: false }),
  ]);
  if (googleMapError) throw googleMapError;
  if (mediaError) throw mediaError;
  if (verificationError) throw verificationError;
  if (identifierError) throw identifierError;

  return projectPublicPropertyDetail(
    property,
    media,
    verifications,
    identifiers,
    googleMap?.google_maps_embed_url ?? null,
  );
}
