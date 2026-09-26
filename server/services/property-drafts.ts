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
const privilegedClient = () => createPrivilegedServerClient() as unknown as Db;

import type { AdminPropertyDraftRecord } from "@/features/properties/domain/contracts";
import type { PropertyActivityItem } from "@/features/properties/domain/contracts";
import { unpublishPropertyWithClient } from "./property-publication";
export type { AdminPropertyDraftRecord };

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

export async function deletePropertyDraft(
  propertyId: string,
  expectedUpdatedAt?: string,
): Promise<void> {
  const admin = await requireActiveAdmin();
  const client = privilegedClient();

  const { data: property, error: fetchError } = await client
    .from("properties")
    .select(
      "id, publication_status, availability_status, updated_at, property_code, listing_title, archived_at, archived_by",
    )
    .eq("id", propertyId)
    .is("deleted_at", null)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!property) throw new Error("Property not found or already deleted.");

  if (expectedUpdatedAt && property.updated_at !== expectedUpdatedAt) {
    throw new PropertyDraftConflictError();
  }

  if (property.publication_status === "PUBLISHED") {
    throw new Error(
      "Published properties cannot be deleted directly. Unpublish the property first.",
    );
  }

  const now = new Date().toISOString();

  // Database check constraints require:
  // - check (deleted_at is null or publication_status = 'ARCHIVED')
  // - check (publication_status <> 'ARCHIVED' or availability_status = 'OFF_MARKET')
  const { error: updateError } = await client
    .from("properties")
    .update({
      deleted_at: now,
      deleted_by: admin.userId,
      publication_status: "ARCHIVED",
      availability_status: "OFF_MARKET",
      archived_at: property.archived_at ?? now,
      archived_by: property.archived_by ?? admin.userId,
      updated_by: admin.userId,
    })
    .eq("id", propertyId)
    .is("deleted_at", null);

  if (updateError) throw updateError;

  const { error: auditError } = await client.from("audit_logs").insert({
    actor_admin_id: admin.userId,
    action: "DELETE",
    entity_type: "property",
    entity_id: propertyId,
    changed_fields: ["deleted_at", "deleted_by", "publication_status", "availability_status"],
    before_state: {
      publicationStatus: property.publication_status,
      availabilityStatus: property.availability_status,
    },
    after_state: {
      deletedAt: now,
      deletedBy: admin.userId,
      publicationStatus: "ARCHIVED",
      availabilityStatus: "OFF_MARKET",
    },
    reason: `Property draft ${property.property_code ?? propertyId} deleted by admin`,
  });
  if (auditError) {
    console.warn("deletePropertyDraft audit logging warning:", auditError);
  }
}

export async function deleteProperty(
  propertyId: string,
  expectedUpdatedAt?: string,
): Promise<void> {
  const admin = await requireActiveAdmin();
  const client = privilegedClient();

  const { data: property, error: fetchError } = await client
    .from("properties")
    .select(
      "id, publication_status, availability_status, updated_at, property_code, listing_title, archived_at, archived_by",
    )
    .eq("id", propertyId)
    .is("deleted_at", null)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!property) throw new Error("Property not found or already deleted.");

  if (expectedUpdatedAt && property.updated_at !== expectedUpdatedAt) {
    throw new PropertyDraftConflictError();
  }

  // If the property is currently published, unpublish it first so public indexes and cache are cleared safely
  if (property.publication_status === "PUBLISHED") {
    await unpublishPropertyWithClient(
      client,
      admin.userId,
      propertyId,
      property.updated_at,
      "Property removed and unpublished by admin",
    );
  }

  const now = new Date().toISOString();

  const { error: updateError } = await client
    .from("properties")
    .update({
      deleted_at: now,
      deleted_by: admin.userId,
      publication_status: "ARCHIVED",
      availability_status: "OFF_MARKET",
      archived_at: property.archived_at ?? now,
      archived_by: property.archived_by ?? admin.userId,
      updated_by: admin.userId,
    })
    .eq("id", propertyId)
    .is("deleted_at", null);

  if (updateError) throw updateError;

  const { error: auditError } = await client.from("audit_logs").insert({
    actor_admin_id: admin.userId,
    action: "DELETE",
    entity_type: "property",
    entity_id: propertyId,
    changed_fields: ["deleted_at", "deleted_by", "publication_status", "availability_status"],
    before_state: {
      publicationStatus: property.publication_status,
      availabilityStatus: property.availability_status,
    },
    after_state: {
      deletedAt: now,
      deletedBy: admin.userId,
      publicationStatus: "ARCHIVED",
      availabilityStatus: "OFF_MARKET",
    },
    reason: `Property ${property.property_code ?? propertyId} deleted by admin`,
  });
  if (auditError) {
    console.warn("deleteProperty audit logging warning:", auditError);
  }
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

const FALLBACK_ADMIN_DISTRICTS = [
  { id: "00000000-0000-4000-8000-000000000003", name: "Ahmedabad" },
  { id: "00000000-0000-4000-8000-000000000004", name: "Gandhinagar" },
];

const FALLBACK_ADMIN_UNITS = [
  { id: "10000000-0000-4000-8000-000000000002", code: "sq_ft", name: "Square foot", symbol: "ft²" },
  { id: "10000000-0000-4000-8000-000000000001", code: "sq_m", name: "Square metre", symbol: "m²" },
  { id: "10000000-0000-4000-8000-000000000003", code: "sq_yd", name: "Square yard", symbol: "yd²" },
  { id: "10000000-0000-4000-8000-000000000004", code: "var", name: "Var", symbol: "var" },
  { id: "10000000-0000-4000-8000-000000000005", code: "guntha", name: "Guntha", symbol: "guntha" },
  { id: "10000000-0000-4000-8000-000000000006", code: "acre", name: "Acre", symbol: "ac" },
  { id: "10000000-0000-4000-8000-000000000007", code: "hectare", name: "Hectare", symbol: "ha" },
  { id: "10000000-0000-4000-8000-000000000008", code: "bigha", name: "Bigha", symbol: "bigha" },
  { id: "10000000-0000-4000-8000-000000000009", code: "vigha", name: "Vigha", symbol: "vigha" },
];

const FALLBACK_ADMIN_PARTIES = [
  {
    id: "70000000-0000-4000-8000-000000000001",
    displayName: "UrbanEdge Land Advisory Desk",
    partyType: "COMPANY" as const,
  },
  {
    id: "70000000-0000-4000-8000-000000000002",
    displayName: "UrbanEdge Partner Network",
    partyType: "COMPANY" as const,
  },
];

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

  const rawDistricts =
    !districtsResult.error && districtsResult.data && districtsResult.data.length > 0
      ? districtsResult.data
      : FALLBACK_ADMIN_DISTRICTS;

  const rawUnits =
    !unitsResult.error && unitsResult.data && unitsResult.data.length > 0
      ? unitsResult.data.map((unit) => ({
          id: unit.id,
          code: unit.code,
          name: unit.display_name,
          symbol: unit.symbol,
        }))
      : FALLBACK_ADMIN_UNITS;

  const rawParties =
    !partiesResult.error && partiesResult.data && partiesResult.data.length > 0
      ? partiesResult.data.map((party) => ({
          id: party.id,
          displayName: party.display_name,
          partyType: party.party_type,
        }))
      : FALLBACK_ADMIN_PARTIES;

  return {
    districts: rawDistricts,
    areaUnits: rawUnits,
    parties: rawParties,
  };
}

export async function listAdminProperties(
  filters: Readonly<{
    query?: string;
    category?: string;
    publication?: string;
    availability?: string;
    districtId?: string;
    sort?: string;
    page?: number;
  }> = {},
) {
  await requireActiveAdmin();
  const client = privilegedClient();
  const pageSize = 24;
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const from = (page - 1) * pageSize;
  let query = client
    .from("properties")
    .select(
      "id,property_code,listing_title,land_category,primary_transaction_type,district_id,display_area_value,display_area_unit_id,availability_status,publication_status,updated_at",
      { count: "exact" },
    )
    .is("deleted_at", null);
  if (filters.query?.trim()) {
    const safe = filters.query.trim().replaceAll(/[,%()]/g, "");
    query = query.or(`property_code.ilike.%${safe}%,listing_title.ilike.%${safe}%`);
  }
  if (["AGRICULTURAL", "NA", "INDUSTRIAL"].includes(filters.category ?? "")) {
    query = query.eq("land_category", filters.category as "AGRICULTURAL" | "NA" | "INDUSTRIAL");
  }
  if (
    ["DRAFT", "UNDER_REVIEW", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"].includes(
      filters.publication ?? "",
    )
  ) {
    query = query.eq(
      "publication_status",
      filters.publication as GeneratedDatabase["public"]["Enums"]["property_publication_status"],
    );
  }
  if (
    ["AVAILABLE", "UNDER_NEGOTIATION", "SOLD", "RENTED", "LEASED", "OFF_MARKET"].includes(
      filters.availability ?? "",
    )
  ) {
    query = query.eq(
      "availability_status",
      filters.availability as GeneratedDatabase["public"]["Enums"]["property_availability_status"],
    );
  }
  if (filters.districtId) query = query.eq("district_id", filters.districtId);
  if (filters.sort === "oldest") query = query.order("updated_at", { ascending: true });
  else if (filters.sort === "code") query = query.order("property_code", { ascending: true });
  else query = query.order("updated_at", { ascending: false });
  const { data: properties, error, count } = await query.range(from, from + pageSize - 1);
  if (error) throw error;
  const total = count ?? 0;
  if (properties.length === 0) {
    return {
      items: [] as AdminPropertyListItemDto[],
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }
  const ids = properties.map((property) => property.id);
  const districtIds = [
    ...new Set(
      properties.map((property) => property.district_id).filter((id): id is string => Boolean(id)),
    ),
  ];
  const unitIds = [
    ...new Set(
      properties
        .map((property) => property.display_area_unit_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const [districts, units, offers, media, documents] = await Promise.all([
    districtIds.length > 0
      ? client.from("districts").select("id,name").in("id", districtIds)
      : Promise.resolve({ data: [], error: null }),
    unitIds.length > 0
      ? client.from("area_units").select("id,display_name,symbol").in("id", unitIds)
      : Promise.resolve({ data: [], error: null }),
    ids.length > 0
      ? client
          .from("property_offers")
          .select("property_id,price_mode,price_amount")
          .in("property_id", ids)
          .eq("is_primary", true)
          .is("archived_at", null)
      : Promise.resolve({ data: [], error: null }),
    ids.length > 0
      ? client
          .from("media_assets")
          .select("property_id")
          .in("property_id", ids)
          .eq("media_type", "IMAGE")
          .is("archived_at", null)
      : Promise.resolve({ data: [], error: null }),
    ids.length > 0
      ? client
          .from("private_documents")
          .select("property_id")
          .in("property_id", ids)
          .is("archived_at", null)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (districts.error) {
    console.warn("listAdminProperties: failed to enrich districts", districts.error);
  }
  if (units.error) {
    console.warn("listAdminProperties: failed to enrich units", units.error);
  }
  if (offers.error) {
    console.warn("listAdminProperties: failed to enrich offers", offers.error);
  }
  if (media.error) {
    console.warn("listAdminProperties: failed to enrich media", media.error);
  }
  if (documents.error) {
    console.warn("listAdminProperties: failed to enrich documents", documents.error);
  }
  const districtMap = new Map((districts.data ?? []).map((row) => [row.id, row.name]));
  const unitMap = new Map(
    (units.data ?? []).map((row) => [
      row.id,
      row.symbol ? `${row.display_name} (${row.symbol})` : row.display_name,
    ]),
  );
  const items = properties.map((property): AdminPropertyListItemDto => {
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
      documentCount: (documents.data ?? []).filter((row) => row.property_id === property.id).length,
      updatedAt: property.updated_at,
    };
  });
  return { items, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getAdminPropertyFilterOptions() {
  await requireActiveAdmin();
  try {
    const { data, error } = await privilegedClient()
      .from("districts")
      .select("id,name")
      .eq("is_active", true)
      .order("name");
    if (error || !data || data.length === 0) {
      return { districts: FALLBACK_ADMIN_DISTRICTS };
    }
    return { districts: data };
  } catch (err) {
    console.warn("getAdminPropertyFilterOptions failed, using fallbacks:", err);
    return { districts: FALLBACK_ADMIN_DISTRICTS };
  }
}

export async function getDashboardPropertyMetrics() {
  await requireActiveAdmin();
  const result = await privilegedClient()
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("publication_status", "DRAFT")
    .is("deleted_at", null);
  if (result.error) throw result.error;
  return { draftCount: result.count ?? 0 };
}

async function maybeSingle<Row>(
  request: PromiseLike<PostgrestSingleResponse<Row>>,
): Promise<Row | null> {
  try {
    const { data, error } = await request;
    if (error) {
      console.warn("maybeSingle query warning:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("maybeSingle query caught exception:", err);
    return null;
  }
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
    approvedCover,
    documents,
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
      .from("media_assets")
      .select("id", { count: "exact", head: true })
      .eq("property_id", propertyId)
      .eq("media_type", "IMAGE")
      .eq("is_cover", true)
      .eq("processing_status", "APPROVED")
      .is("archived_at", null),
    client
      .from("private_documents")
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
    hasApprovedCover: (approvedCover.count ?? 0) > 0,
    documentCount: documents.count ?? 0,
    verificationCount: verification.count ?? 0,
  };
}

export async function getPropertyActivity(propertyId: string): Promise<PropertyActivityItem[]> {
  await requireActiveAdmin();
  const client = privilegedClient();
  const [audits, documents, leadEvents, visits, verifications] = await Promise.all([
    client
      .from("audit_logs")
      .select("id,action,occurred_at,reason,changed_fields")
      .eq("entity_type", "property")
      .eq("entity_id", propertyId)
      .order("occurred_at", { ascending: false })
      .limit(100),
    client
      .from("private_documents")
      .select("id,original_file_name,document_type,created_at")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false })
      .limit(50),
    client
      .from("lead_activities")
      .select("id,activity_type,activity_at,note")
      .eq("property_id", propertyId)
      .order("activity_at", { ascending: false })
      .limit(50),
    client
      .from("site_visits")
      .select("id,visit_reference,status,created_at")
      .eq("property_id", propertyId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(50),
    client.from("property_verifications").select("id").eq("property_id", propertyId),
  ]);
  if (audits.error) console.warn("getPropertyActivity audits warning:", audits.error);
  if (documents.error) console.warn("getPropertyActivity documents warning:", documents.error);
  if (leadEvents.error) console.warn("getPropertyActivity leadEvents warning:", leadEvents.error);
  if (visits.error) console.warn("getPropertyActivity visits warning:", visits.error);
  if (verifications.error)
    console.warn("getPropertyActivity verifications warning:", verifications.error);

  const verificationIds = (verifications.data ?? []).map((row) => row.id);
  let reviewsData: {
    id: string | number;
    event_type: string;
    occurred_at: string;
    reason: string | null;
    from_status: string | null;
    to_status: string | null;
  }[] = [];
  if (verificationIds.length) {
    const reviews = await client
      .from("verification_history")
      .select("id,event_type,occurred_at,reason,from_status,to_status")
      .in("property_verification_id", verificationIds)
      .order("occurred_at", { ascending: false })
      .limit(50);
    if (reviews.error) {
      console.warn("getPropertyActivity reviews warning:", reviews.error);
    } else if (reviews.data) {
      reviewsData = reviews.data;
    }
  }
  const items: PropertyActivityItem[] = [
    ...(audits.data ?? []).map((row) => ({
      id: `audit-${row.id}`,
      at: row.occurred_at,
      label: propertyAuditLabel(row.action, row.changed_fields),
      detail: row.reason,
    })),
    ...(documents.data ?? []).map((row) => ({
      id: `document-${row.id}`,
      at: row.created_at,
      label: "Document uploaded",
      detail: row.original_file_name ?? row.document_type.replaceAll("_", " "),
    })),
    ...(leadEvents.data ?? []).map((row) => ({
      id: `lead-${row.id}`,
      at: row.activity_at,
      label: row.activity_type.replaceAll("_", " ").toLowerCase(),
      detail: row.note,
    })),
    ...(visits.data ?? []).map((row) => ({
      id: `visit-${row.id}`,
      at: row.created_at,
      label: "Site visit scheduled",
      detail: `${row.visit_reference} · ${row.status.replaceAll("_", " ")}`,
    })),
    ...reviewsData.map((row) => ({
      id: `review-${row.id}`,
      at: row.occurred_at,
      label: "Review updated",
      detail:
        row.reason ??
        [row.from_status, row.to_status].filter(Boolean).join(" → ").replaceAll("_", " ") ??
        row.event_type.replaceAll("_", " "),
    })),
  ];
  return items.sort((left, right) => Date.parse(right.at) - Date.parse(left.at));
}

function propertyAuditLabel(
  action: GeneratedDatabase["public"]["Enums"]["audit_action"],
  changedFields: readonly string[] | null,
) {
  if (action === "UPDATE" && changedFields?.some((field) => /price|offer/i.test(field))) {
    return "Price changed";
  }
  const labels: Partial<Record<GeneratedDatabase["public"]["Enums"]["audit_action"], string>> = {
    CREATE: "Property created",
    UPDATE: "Property updated",
    PUBLISH: "Published to website",
    UNPUBLISH: "Removed from website",
    ARCHIVE: "Property archived",
    RESTORE: "Property restored",
    STATUS_CHANGE: "Availability changed",
    DELETE: "Property deleted",
  };
  return labels[action] ?? action.replaceAll("_", " ").toLowerCase();
}
