import "server-only";

import type { PostgrestSingleResponse, SupabaseClient } from "@supabase/supabase-js";

import type {
  AdminPropertyListItemDto,
  AdminPropertyReferenceData,
} from "@/features/admin/contracts";
import {
  adminPropertyDraftSchema,
  PropertyDraftConflictError,
  type AdminPropertyDraftInput,
} from "@/features/properties/domain/admin-property-draft";
import { requireActiveAdmin } from "@/server/auth/authorization";
import { createPrivilegedServerClient } from "@/server/supabase/privileged";
import type { AvailabilityStatus } from "@/types/database";
import type {
  Database as GeneratedDatabase,
  Json as GeneratedJson,
} from "@/types/database.generated";

type Db = SupabaseClient<GeneratedDatabase>;
type PropertyRow = GeneratedDatabase["public"]["Tables"]["properties"]["Row"];
const privilegedClient = () => createPrivilegedServerClient() as unknown as Db;

export type AdminPropertyDraftRecord = Readonly<{
  property: PropertyRow;
  districtName: string;
  areaUnitName: string;
  location: GeneratedDatabase["public"]["Tables"]["property_locations"]["Row"] | null;
  offer: GeneratedDatabase["public"]["Tables"]["property_offers"]["Row"] | null;
  parcel:
    | (GeneratedDatabase["public"]["Tables"]["property_parcels"]["Row"] & {
        identifier: GeneratedDatabase["public"]["Tables"]["parcel_identifiers"]["Row"] | null;
      })
    | null;
  planning: GeneratedDatabase["public"]["Tables"]["property_planning_context"]["Row"] | null;
  agricultural: GeneratedDatabase["public"]["Tables"]["property_agricultural"]["Row"] | null;
  na: GeneratedDatabase["public"]["Tables"]["property_na"]["Row"] | null;
  industrial: GeneratedDatabase["public"]["Tables"]["property_industrial"]["Row"] | null;
  partyLink: GeneratedDatabase["public"]["Tables"]["property_parties"]["Row"] | null;
  sourceLink: GeneratedDatabase["public"]["Tables"]["property_source_links"]["Row"] | null;
  mediaCount: number;
  verificationCount: number;
}>;

function translateMutationError(error: { code?: string; message: string }): never {
  if (error.code === "P0409" || error.message.includes("changed since")) {
    throw new PropertyDraftConflictError();
  }
  throw new Error(error.message);
}

export async function persistPropertyDraft(
  client: Db,
  actorId: string,
  input: AdminPropertyDraftInput,
  existing?: Readonly<{ id: string; expectedUpdatedAt: string }>,
): Promise<string> {
  const payload = adminPropertyDraftSchema.parse(input);
  const args = {
    requested_actor_id: actorId,
    requested_payload: payload as unknown as GeneratedJson,
    ...(existing
      ? {
          requested_property_id: existing.id,
          requested_expected_updated_at: existing.expectedUpdatedAt,
        }
      : {}),
  } as GeneratedDatabase["public"]["Functions"]["save_property_draft"]["Args"];
  const { data, error } = await client.rpc("save_property_draft", args);
  if (error) translateMutationError(error);
  return data;
}

export async function createPropertyDraft(input: AdminPropertyDraftInput): Promise<string> {
  const admin = await requireActiveAdmin();
  return persistPropertyDraft(privilegedClient(), admin.userId, input);
}

export async function updatePropertyDraft(
  propertyId: string,
  expectedUpdatedAt: string,
  input: AdminPropertyDraftInput,
): Promise<string> {
  const admin = await requireActiveAdmin();
  return persistPropertyDraft(privilegedClient(), admin.userId, input, {
    id: propertyId,
    expectedUpdatedAt,
  });
}

async function runLifecycleMutation(
  operation: "archive_property_draft" | "restore_property_draft",
  propertyId: string,
  expectedUpdatedAt: string,
): Promise<void> {
  const admin = await requireActiveAdmin();
  const { error } = await privilegedClient().rpc(operation, {
    requested_actor_id: admin.userId,
    requested_expected_updated_at: expectedUpdatedAt,
    requested_property_id: propertyId,
  });
  if (error) translateMutationError(error);
}

export async function archivePropertyDraft(propertyId: string, expectedUpdatedAt: string) {
  return runLifecycleMutation("archive_property_draft", propertyId, expectedUpdatedAt);
}

export async function restorePropertyDraft(propertyId: string, expectedUpdatedAt: string) {
  return runLifecycleMutation("restore_property_draft", propertyId, expectedUpdatedAt);
}

export async function changePropertyAvailability(
  propertyId: string,
  expectedUpdatedAt: string,
  nextStatus: AvailabilityStatus,
): Promise<void> {
  const admin = await requireActiveAdmin();
  const { error } = await privilegedClient().rpc("change_property_availability", {
    requested_actor_id: admin.userId,
    requested_expected_updated_at: expectedUpdatedAt,
    requested_next_status: nextStatus,
    requested_property_id: propertyId,
  });
  if (error) translateMutationError(error);
}

export async function getAdminReferenceData(): Promise<AdminPropertyReferenceData> {
  await requireActiveAdmin();
  const client = privilegedClient();
  const [districtsResult, unitsResult, partiesResult] = await Promise.all([
    client.from("districts").select("id,name").eq("is_active", true).order("name"),
    client.from("area_units").select("id,code,display_name,symbol").order("display_name"),
    client
      .from("parties")
      .select("id,display_name,party_type")
      .eq("is_active", true)
      .is("archived_at", null)
      .order("display_name"),
  ]);
  if (districtsResult.error) throw districtsResult.error;
  if (unitsResult.error) throw unitsResult.error;
  if (partiesResult.error) throw partiesResult.error;
  return {
    districts: districtsResult.data,
    areaUnits: unitsResult.data.map((unit) => ({
      id: unit.id,
      code: unit.code,
      name: unit.display_name,
      symbol: unit.symbol,
    })),
    parties: partiesResult.data.map((party) => ({
      id: party.id,
      displayName: party.display_name,
      partyType: party.party_type,
    })),
  };
}

export async function listAdminProperties(
  filters?: Readonly<{ query?: string; category?: string }>,
) {
  await requireActiveAdmin();
  const client = privilegedClient();
  let query = client
    .from("properties")
    .select(
      "id,property_code,listing_title,land_category,primary_transaction_type,district_id,display_area_value,display_area_unit_id,availability_status,publication_status,updated_at",
    )
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (filters?.query?.trim()) {
    const safe = filters.query.trim().replaceAll(/[,%()]/g, "");
    query = query.or(`property_code.ilike.%${safe}%,listing_title.ilike.%${safe}%`);
  }
  if (["AGRICULTURAL", "NA", "INDUSTRIAL"].includes(filters?.category ?? "")) {
    query = query.eq("land_category", filters?.category as "AGRICULTURAL" | "NA" | "INDUSTRIAL");
  }
  const { data: properties, error } = await query;
  if (error) throw error;
  if (properties.length === 0) return [] satisfies AdminPropertyListItemDto[];
  const ids = properties.map((property) => property.id);
  const districtIds = [...new Set(properties.map((property) => property.district_id))];
  const unitIds = [...new Set(properties.map((property) => property.display_area_unit_id))];
  const [districts, units, offers, media, verifications] = await Promise.all([
    client.from("districts").select("id,name").in("id", districtIds),
    client.from("area_units").select("id,display_name,symbol").in("id", unitIds),
    client
      .from("property_offers")
      .select("property_id,price_mode,price_amount")
      .in("property_id", ids)
      .eq("is_primary", true)
      .is("archived_at", null),
    client
      .from("media_assets")
      .select("property_id")
      .in("property_id", ids)
      .is("archived_at", null),
    client.from("property_verifications").select("property_id").in("property_id", ids),
  ]);
  for (const result of [districts, units, offers, media, verifications]) {
    if (result.error) throw result.error;
  }
  const districtMap = new Map((districts.data ?? []).map((row) => [row.id, row.name]));
  const unitMap = new Map(
    (units.data ?? []).map((row) => [
      row.id,
      row.symbol ? `${row.display_name} (${row.symbol})` : row.display_name,
    ]),
  );
  return properties.map((property): AdminPropertyListItemDto => {
    const offer = (offers.data ?? []).find((row) => row.property_id === property.id);
    return {
      id: property.id,
      propertyCode: property.property_code,
      title: property.listing_title,
      category: property.land_category,
      transactionType: property.primary_transaction_type,
      districtName: districtMap.get(property.district_id) ?? "Unknown district",
      areaValue: property.display_area_value,
      areaUnit: unitMap.get(property.display_area_unit_id) ?? "Unknown unit",
      priceMode: offer?.price_mode ?? "PRICE_ON_REQUEST",
      priceAmount: offer?.price_amount ?? null,
      availabilityStatus: property.availability_status,
      publicationStatus: property.publication_status,
      mediaCount: (media.data ?? []).filter((row) => row.property_id === property.id).length,
      verificationCount: (verifications.data ?? []).filter((row) => row.property_id === property.id)
        .length,
      updatedAt: property.updated_at,
    };
  });
}

async function maybeSingle<Row>(
  request: PromiseLike<PostgrestSingleResponse<Row>>,
): Promise<Row | null> {
  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return data;
}

export async function getAdminProperty(
  propertyId: string,
  options: Readonly<{ includePrivateLocation?: boolean }> = {},
): Promise<AdminPropertyDraftRecord | null> {
  const admin = await requireActiveAdmin();
  const client = privilegedClient();
  const { data: property, error } = await client
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!property) return null;
  const locationRequest = options.includePrivateLocation
    ? client.from("property_locations").select("*").eq("property_id", propertyId).maybeSingle()
    : client
        .from("property_locations")
        .select(
          "property_id,public_latitude,public_longitude,location_visibility,public_accuracy_m,location_source_reference_id,created_at,updated_at",
        )
        .eq("property_id", propertyId)
        .maybeSingle();
  const [
    district,
    unit,
    location,
    offer,
    parcel,
    planning,
    agricultural,
    na,
    industrial,
    partyLink,
    sourceLink,
    media,
    verification,
  ] = await Promise.all([
    maybeSingle(
      client.from("districts").select("name").eq("id", property.district_id).maybeSingle(),
    ),
    maybeSingle(
      client
        .from("area_units")
        .select("display_name,symbol")
        .eq("id", property.display_area_unit_id)
        .maybeSingle(),
    ),
    maybeSingle(locationRequest),
    maybeSingle(
      client
        .from("property_offers")
        .select("*")
        .eq("property_id", propertyId)
        .eq("is_primary", true)
        .is("archived_at", null)
        .maybeSingle(),
    ),
    maybeSingle(
      client
        .from("property_parcels")
        .select("*")
        .eq("property_id", propertyId)
        .is("archived_at", null)
        .order("sequence_no")
        .limit(1)
        .maybeSingle(),
    ),
    maybeSingle(
      client
        .from("property_planning_context")
        .select("*")
        .eq("property_id", propertyId)
        .is("archived_at", null)
        .maybeSingle(),
    ),
    maybeSingle(
      client.from("property_agricultural").select("*").eq("property_id", propertyId).maybeSingle(),
    ),
    maybeSingle(client.from("property_na").select("*").eq("property_id", propertyId).maybeSingle()),
    maybeSingle(
      client.from("property_industrial").select("*").eq("property_id", propertyId).maybeSingle(),
    ),
    maybeSingle(
      client
        .from("property_parties")
        .select("*")
        .eq("property_id", propertyId)
        .eq("is_primary", true)
        .is("archived_at", null)
        .maybeSingle(),
    ),
    maybeSingle(
      client
        .from("property_source_links")
        .select("*")
        .eq("property_id", propertyId)
        .order("created_at")
        .limit(1)
        .maybeSingle(),
    ),
    client
      .from("media_assets")
      .select("id", { count: "exact", head: true })
      .eq("property_id", propertyId)
      .is("archived_at", null),
    client
      .from("property_verifications")
      .select("id", { count: "exact", head: true })
      .eq("property_id", propertyId),
  ]);
  const identifier = parcel
    ? await maybeSingle(
        client
          .from("parcel_identifiers")
          .select("*")
          .eq("parcel_id", parcel.id)
          .eq("is_primary", true)
          .maybeSingle(),
      )
    : null;
  if (options.includePrivateLocation && location) {
    const { error: auditError } = await client.from("audit_logs").insert({
      actor_admin_id: admin.userId,
      action: "EXACT_LOCATION_ACCESS",
      entity_type: "property_location",
      entity_id: propertyId,
      changed_fields: ["private_coordinates"],
      reason: "Protected property edit loaded the private location",
    });
    if (auditError) throw auditError;
  }
  const exactLocation = options.includePrivateLocation
    ? (location as AdminPropertyDraftRecord["location"])
    : null;
  const protectedLocation: AdminPropertyDraftRecord["location"] = location
    ? {
        ...location,
        private_latitude: exactLocation?.private_latitude ?? null,
        private_longitude: exactLocation?.private_longitude ?? null,
        private_accuracy_m: exactLocation?.private_accuracy_m ?? null,
        location_notes: exactLocation?.location_notes ?? null,
      }
    : null;
  return {
    property,
    districtName: district?.name ?? "Unknown district",
    areaUnitName: unit
      ? unit.symbol
        ? `${unit.display_name} (${unit.symbol})`
        : unit.display_name
      : "Unknown unit",
    location: protectedLocation,
    offer,
    parcel: parcel ? { ...parcel, identifier } : null,
    planning,
    agricultural,
    na,
    industrial,
    partyLink,
    sourceLink,
    mediaCount: media.count ?? 0,
    verificationCount: verification.count ?? 0,
  };
}
