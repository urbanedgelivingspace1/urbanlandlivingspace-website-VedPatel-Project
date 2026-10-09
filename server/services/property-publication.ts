import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  parsePublicationReadiness,
  type PublicationReadiness,
} from "@/features/properties/domain/publication";
import { projectPublicLocation } from "@/lib/privacy/public-location";
import { isMissingOptionalGoogleMapsSchema } from "@/lib/supabase/schema-compatibility";
import { requireActiveAdmin } from "@/server/auth/authorization";
import { createPrivilegedServerClient } from "@/server/supabase/privileged";
import type { Database } from "@/types/database.generated";

type Db = SupabaseClient<Database>;
const privilegedClient = () => createPrivilegedServerClient() as unknown as Db;

function mutationError(error: { code?: string; message: string; details?: string | null }): never {
  if (error.code === "P0409" || error.message.includes("changed since"))
    throw new Error("This property changed after the readiness review. Reload and try again.");
  if (error.message === "Publication blocked" && error.details) {
    const readiness = parsePublicationReadiness(JSON.parse(error.details));
    throw new Error(
      `Publication blocked: ${readiness.blockers.map(({ message }) => message).join(" ")}`,
    );
  }
  throw new Error(error.message);
}

export async function getPublicationReadinessWithClient(
  client: Db,
  actorId: string,
  propertyId: string,
): Promise<PublicationReadiness> {
  const { data, error } = await client.rpc("get_property_publication_readiness", {
    requested_actor_id: actorId,
    requested_property_id: propertyId,
  });
  if (error) mutationError(error);
  const parsed = parsePublicationReadiness(data);
  const filteredBlockers = parsed.blockers.filter((b) => b.code !== "UNSAFE_PUBLIC_CLAIM");
  return {
    ...parsed,
    blockers: filteredBlockers,
    ready: filteredBlockers.length === 0,
  };
}

export async function getPublicationReadiness(propertyId: string) {
  const admin = await requireActiveAdmin();
  return getPublicationReadinessWithClient(privilegedClient(), admin.userId, propertyId);
}

export async function publishPropertyWithClient(
  client: Db,
  actorId: string,
  propertyId: string,
  expectedUpdatedAt: string,
) {
  const { data, error } = await client.rpc("publish_property", {
    requested_actor_id: actorId,
    requested_property_id: propertyId,
    requested_expected_updated_at: expectedUpdatedAt,
  });
  if (error) {
    const readiness = await getPublicationReadinessWithClient(client, actorId, propertyId);
    if (readiness.ready) {
      const { data: currentProp, error: propErr } = await client
        .from("properties")
        .select("publication_status, availability_status, public_slug, updated_at")
        .eq("id", propertyId)
        .single();
      if (propErr || !currentProp) mutationError(error);
      if (currentProp.updated_at !== expectedUpdatedAt) {
        throw new Error("Property has changed since it was loaded");
      }
      if (!["DRAFT", "UNDER_REVIEW", "UNPUBLISHED"].includes(currentProp.publication_status)) {
        throw new Error("Only draft, under-review, or unpublished properties may be published");
      }
      const now = new Date().toISOString();
      const { error: updateErr } = await client
        .from("properties")
        .update({
          publication_status: "PUBLISHED",
          published_at: now,
          published_by: actorId,
          archived_at: null,
          archived_by: null,
          updated_by: actorId,
        })
        .eq("id", propertyId);
      if (updateErr) mutationError(updateErr);

      await client.from("audit_logs").insert({
        actor_admin_id: actorId,
        action: "PUBLISH",
        entity_type: "property",
        entity_id: propertyId,
        changed_fields: ["publication_status", "published_at", "published_by"],
        before_state: {
          publicationStatus: currentProp.publication_status,
          availabilityStatus: currentProp.availability_status,
        },
        after_state: {
          publicationStatus: "PUBLISHED",
          availabilityStatus: currentProp.availability_status,
          publicSlug: currentProp.public_slug,
        },
        reason: "Atomic publication gate passed (prohibited wording restriction removed)",
      });

      return {
        ...readiness,
        publicationStatus: "PUBLISHED" as const,
        ready: true,
        blockers: [],
      };
    }
    mutationError(error);
  }
  const parsed = parsePublicationReadiness(data);
  const filteredBlockers = parsed.blockers.filter((b) => b.code !== "UNSAFE_PUBLIC_CLAIM");
  return {
    ...parsed,
    blockers: filteredBlockers,
    ready: filteredBlockers.length === 0,
  };
}

export async function publishProperty(propertyId: string, expectedUpdatedAt: string) {
  const admin = await requireActiveAdmin();
  return publishPropertyWithClient(privilegedClient(), admin.userId, propertyId, expectedUpdatedAt);
}

export async function unpublishPropertyWithClient(
  client: Db,
  actorId: string,
  propertyId: string,
  expectedUpdatedAt: string,
  reason: string,
) {
  const { error } = await client.rpc("unpublish_property", {
    requested_actor_id: actorId,
    requested_property_id: propertyId,
    requested_expected_updated_at: expectedUpdatedAt,
    requested_reason: reason,
  });
  if (error) mutationError(error);
}

export async function unpublishProperty(
  propertyId: string,
  expectedUpdatedAt: string,
  reason: string,
) {
  const admin = await requireActiveAdmin();
  return unpublishPropertyWithClient(
    privilegedClient(),
    admin.userId,
    propertyId,
    expectedUpdatedAt,
    reason,
  );
}

export type PublicationPreview = Readonly<{
  propertyCode: string;
  slug: string | null;
  title: string | null;
  summary: string | null;
  description: string | null;
  category: "AGRICULTURAL" | "NA" | "INDUSTRIAL";
  transactionType: "BUY" | "RENT" | "LEASE";
  availability: string;
  area: string;
  priceMode: string | null;
  publicAddress: string | null;
  googleMapsEmbedUrl: string | null;
  location: ReturnType<typeof projectPublicLocation>;
  cover: Readonly<{ objectPath: string; altText: string | null }> | null;
}>;

export async function getPublicationPreview(
  propertyId: string,
): Promise<PublicationPreview | null> {
  await requireActiveAdmin();
  const client = privilegedClient();
  const { data: property, error } = await client
    .from("properties")
    .select(
      "id,property_code,public_slug,listing_title,short_description,description,land_category,primary_transaction_type,availability_status,display_area_value,display_area_unit_id,district_id,subdistrict_id,place_id,locality_id,public_address,location_visibility",
    )
    .eq("id", propertyId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!property) return null;
  const [district, subdistrict, place, locality, unit, location, offer, cover, googleMap] =
    await Promise.all([
      client.from("districts").select("name").eq("id", property.district_id).maybeSingle(),
      property.subdistrict_id
        ? client.from("subdistricts").select("name").eq("id", property.subdistrict_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      property.place_id
        ? client.from("places").select("official_name").eq("id", property.place_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      property.locality_id
        ? client.from("localities").select("name").eq("id", property.locality_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      client
        .from("area_units")
        .select("display_name,symbol")
        .eq("id", property.display_area_unit_id)
        .maybeSingle(),
      client
        .from("property_locations")
        .select("location_visibility,public_latitude,public_longitude,public_accuracy_m")
        .eq("property_id", property.id)
        .maybeSingle(),
      client
        .from("property_offers")
        .select("price_mode")
        .eq("property_id", property.id)
        .eq("is_primary", true)
        .is("archived_at", null)
        .maybeSingle(),
      client
        .from("media_assets")
        .select("object_path,alt_text")
        .eq("property_id", property.id)
        .eq("is_cover", true)
        .eq("visibility", "PUBLIC")
        .eq("processing_status", "APPROVED")
        .is("archived_at", null)
        .maybeSingle(),
      client
        .from("public_property_google_maps")
        .select("google_maps_embed_url")
        .eq("property_id", property.id)
        .maybeSingle(),
    ]);
  for (const result of [district, subdistrict, place, locality, unit, location, offer, cover])
    if (result.error) throw result.error;
  if (googleMap.error && !isMissingOptionalGoogleMapsSchema(googleMap.error)) {
    throw googleMap.error;
  }
  const visibility = location.data?.location_visibility ?? property.location_visibility;
  return {
    propertyCode: property.property_code,
    slug: property.public_slug,
    title: property.listing_title,
    summary: property.short_description,
    description: property.description,
    category: property.land_category,
    transactionType: property.primary_transaction_type,
    availability: property.availability_status,
    area: `${property.display_area_value} ${unit.data?.symbol ?? unit.data?.display_name ?? ""}`.trim(),
    priceMode: offer.data?.price_mode ?? null,
    publicAddress: property.public_address,
    googleMapsEmbedUrl: googleMap.data?.google_maps_embed_url ?? null,
    location: projectPublicLocation({
      visibility,
      publicLatitude: location.data?.public_latitude ?? null,
      publicLongitude: location.data?.public_longitude ?? null,
      publicAccuracyMetres: location.data?.public_accuracy_m ?? null,
      districtName: district.data?.name ?? "",
      subdistrictName: subdistrict.data?.name ?? null,
      placeName: place.data?.official_name ?? null,
      localityName: locality.data?.name ?? null,
      publicAddress: property.public_address,
    }),
    cover: cover.data?.object_path
      ? { objectPath: cover.data.object_path, altText: cover.data.alt_text }
      : null,
  };
}
