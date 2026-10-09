import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { beforeAll, describe, expect, it, vi } from "vitest";

import type { AdminPropertyDraftInput } from "@/features/properties/domain/admin-property-draft";
import type { Database } from "@/types/database.generated";
import type { Database as PublicDatabase } from "@/types/database";

vi.mock("server-only", () => ({}));

let database: SupabaseClient<Database>;
let anonymousClient: SupabaseClient<Database>;
let actorId: string;
let propertyId: string;
let identityCheckId: string;
let revenueCheckId: string;

const districtId = "00000000-0000-4000-8000-000000000003";
const unitId = "10000000-0000-4000-8000-000000000006";

const draft: AdminPropertyDraftInput = {
  landCategory: "AGRICULTURAL",
  primaryTransactionType: "BUY",
  listingTitle: "Synthetic M9 publication property",
  shortDescription: "A complete synthetic public summary for the M9 gate.",
  description:
    "A complete synthetic public description used to prove controlled publication without legal guarantees.",
  publicSlug: `synthetic-m9-publication-${Date.now()}`,
  publicAddress: "Synthetic public area, Ahmedabad district",
  districtId,
  displayAreaValue: 2,
  displayAreaUnitId: unitId,
  location: {
    visibility: "HIDDEN",
    privateLatitude: 23.022505,
    privateLongitude: 72.571365,
    publicLatitude: null,
    publicLongitude: null,
    publicAccuracyMetres: null,
    locationNotes: "PRIVATE_M9_LOCATION_CANARY",
  },
  offer: {
    transactionType: "BUY",
    currencyCode: "INR",
    priceMode: "PRICE_ON_REQUEST",
    negotiable: false,
  },
  categoryDetails: {
    landCategory: "AGRICULTURAL",
    tenureType: "Recorded tenure",
    irrigationStatus: "Recorded irrigation context",
    roadTouch: false,
  },
  sourceLink: { sourceType: "SYNTHETIC_INTEGRATION", sourceName: "M9 fixture" },
};
const draftPublicSlug = draft.publicSlug as string;

function currentClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Local M9 integration environment is missing.");
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function updatedAt() {
  const result = await database
    .from("properties")
    .select("updated_at")
    .eq("id", propertyId)
    .single();
  if (result.error) throw result.error;
  return result.data.updated_at;
}

async function advanceEvidence(evidenceId: string, state: "REVIEWED" | "SOURCE_VERIFIED") {
  const result = await database.rpc("advance_verification_evidence", {
    requested_actor_id: actorId,
    requested_evidence_id: evidenceId,
    requested_state: state,
  });
  if (result.error) throw result.error;
}

beforeAll(async () => {
  database = currentClient();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Local M9 anonymous environment is missing.");
  anonymousClient = createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const created = await database.auth.admin.createUser({
    email: `m9-integration-${unique}@example.invalid`,
    password: `Synthetic-${unique}-Only!`,
    email_confirm: true,
  });
  if (created.error || !created.data.user)
    throw created.error ?? new Error("M9 actor creation failed.");
  actorId = created.data.user.id;
  const profile = await database.from("admin_profiles").insert({
    user_id: actorId,
    display_name: "Synthetic M9 publisher",
    role: "ADMIN",
    is_active: true,
  });
  if (profile.error) throw profile.error;
  const { persistPropertyDraft } = await import("@/server/services/property-drafts");
  propertyId = await persistPropertyDraft(database, actorId, draft);
});

describe.sequential("M9 controlled publication service integration", () => {
  it("blocks the incomplete draft using authoritative current state", async () => {
    const { getPublicationReadinessWithClient, publishPropertyWithClient } =
      await import("@/server/services/property-publication");
    const readiness = await getPublicationReadinessWithClient(database, actorId, propertyId);
    expect(readiness.ready).toBe(false);
    expect(readiness.blockers.map(({ code }) => code)).toEqual(["APPROVED_COVER_MISSING"]);
    await expect(
      publishPropertyWithClient(database, actorId, propertyId, await updatedAt()),
    ).rejects.toThrow(/Publication blocked/);
    const row = await database
      .from("properties")
      .select("publication_status")
      .eq("id", propertyId)
      .single();
    expect(row.data?.publication_status).toBe("DRAFT");
    const { getPublicPropertyDetail } = await import("@/server/queries/public-properties");
    expect(
      await getPublicPropertyDetail(
        anonymousClient as unknown as SupabaseClient<PublicDatabase>,
        draftPublicSlug,
      ),
    ).toBeNull();
  });

  it("completes public media while retaining advanced verification as an independent workflow", async () => {
    const image = await sharp({
      create: { width: 1200, height: 800, channels: 3, background: "#92764d" },
    })
      .jpeg()
      .toBuffer();
    const { approvePropertyMediaWithClient, uploadPropertyImageWithClient } =
      await import("@/server/services/property-media");
    const uploaded = await uploadPropertyImageWithClient(
      database,
      actorId,
      propertyId,
      new File([image], "synthetic-publication.jpg", { type: "image/jpeg" }),
      { altText: "Synthetic agricultural property frontage" },
    );
    await approvePropertyMediaWithClient(database, actorId, uploaded.id);
    const cover = await database.rpc("set_property_cover", {
      requested_actor_id: actorId,
      requested_property_id: propertyId,
      requested_media_id: uploaded.id,
    });
    if (cover.error) throw cover.error;

    const documentId = crypto.randomUUID();
    const document = await database.from("private_documents").insert({
      id: documentId,
      property_id: propertyId,
      document_type: "VERIFICATION_EVIDENCE",
      storage_bucket: "verification-documents-private",
      object_path: `properties/${propertyId}/verification/PRIVATE_M9_EVIDENCE.pdf`,
      mime_type: "application/pdf",
      scan_status: "CLEAN",
      original_file_name: "PRIVATE_M9_EVIDENCE.pdf",
      visibility: "PRIVATE",
      created_by: actorId,
      updated_by: actorId,
    });
    if (document.error) throw document.error;

    const {
      getAdminVerificationDetailWithClient,
      initializePropertyVerificationsWithClient,
      linkVerificationEvidenceWithClient,
      transitionVerificationWithClient,
    } = await import("@/server/services/verifications");
    await initializePropertyVerificationsWithClient(database, actorId, propertyId);
    const detail = await getAdminVerificationDetailWithClient(database, propertyId);
    identityCheckId = detail?.checks.find(
      ({ definition }) => definition.code === "PROPERTY_IDENTITY_REVIEWED",
    )?.id as string;
    revenueCheckId = detail?.checks.find(
      ({ definition }) => definition.code === "REVENUE_RECORDS_REVIEWED",
    )?.id as string;
    expect(identityCheckId).toBeTruthy();
    expect(revenueCheckId).toBeTruthy();

    await transitionVerificationWithClient(database, actorId, identityCheckId, "IN_REVIEW");
    const identityEvidence = await linkVerificationEvidenceWithClient(
      database,
      actorId,
      identityCheckId,
      {
        privateDocumentId: documentId,
        evidenceType: "OWNER_DOCUMENT",
        sourceClass: "URBANEDGE_OPERATIONAL_POLICY",
        evidenceReference: "SYNTHETIC-M9-IDENTITY",
      },
    );
    await advanceEvidence(identityEvidence as string, "REVIEWED");
    await transitionVerificationWithClient(database, actorId, identityCheckId, "PASSED_WITH_NOTE", {
      scopeStatement: "Synthetic property identity and parcel references were compared.",
      limitations: "Identity correspondence only; no title conclusion.",
      notes: "Owner-provided evidence was reviewed for the bounded scope.",
      recheckAt: "2099-01-01T00:00:00Z",
    });

    await transitionVerificationWithClient(database, actorId, revenueCheckId, "IN_REVIEW");
    const revenueEvidence = await linkVerificationEvidenceWithClient(
      database,
      actorId,
      revenueCheckId,
      {
        privateDocumentId: documentId,
        evidenceType: "OFFICIAL_RECORD",
        sourceClass: "OFFICIAL_ADMINISTRATIVE_PRACTICE",
        evidenceReference: "SYNTHETIC-M9-REVENUE",
      },
    );
    await advanceEvidence(revenueEvidence as string, "REVIEWED");
    await advanceEvidence(revenueEvidence as string, "SOURCE_VERIFIED");
    await transitionVerificationWithClient(database, actorId, revenueCheckId, "PASSED", {
      scopeStatement: "Synthetic revenue record references were checked for this parcel.",
      limitations: "Record scope only; no ownership or title guarantee.",
      recheckAt: "2099-01-01T00:00:00Z",
    });
  });

  it("publishes atomically and exposes only a public-safe hidden-location projection", async () => {
    const { getPublicationReadinessWithClient, publishPropertyWithClient } =
      await import("@/server/services/property-publication");
    const readiness = await getPublicationReadinessWithClient(database, actorId, propertyId);
    expect(readiness.ready).toBe(true);
    expect(readiness.blockers.map(({ code }) => code)).not.toContain("REQUIRED_CHECK_UNSUPPORTED");
    await publishPropertyWithClient(database, actorId, propertyId, await updatedAt());

    const listing = await anonymousClient
      .from("public_property_listings")
      .select(
        "id,property_code,public_slug,listing_title,availability_status,location_visibility,public_latitude,public_longitude",
      )
      .eq("id", propertyId)
      .single();
    expect(listing.error).toBeNull();
    expect(listing.data).toMatchObject({
      id: propertyId,
      availability_status: "AVAILABLE",
      location_visibility: "HIDDEN",
      public_latitude: null,
      public_longitude: null,
    });
    expect(JSON.stringify(listing.data)).not.toContain("PRIVATE_M9");
    const indexable = await anonymousClient
      .from("public_property_indexability")
      .select("id,public_slug,canonical_path,availability_status")
      .eq("id", propertyId)
      .single();
    expect(indexable.error).toBeNull();

    const { getPublicPropertyDetail } = await import("@/server/queries/public-properties");
    const detail = await getPublicPropertyDetail(
      anonymousClient as unknown as SupabaseClient<PublicDatabase>,
      draftPublicSlug,
    );
    expect(detail).toMatchObject({
      id: propertyId,
      slug: draftPublicSlug,
      category: "AGRICULTURAL",
      location: { visibility: "HIDDEN", point: null },
      categoryDetails: { category: "AGRICULTURAL", tenureType: "Recorded tenure" },
    });
    expect(JSON.stringify(detail)).not.toMatch(/PRIVATE_M9|owner|notesInternal|privateLatitude/);
  });

  it("never projects legacy coordinates for EXACT, APPROXIMATE, or HIDDEN locations", async () => {
    const { getPublicPropertyDetail } = await import("@/server/queries/public-properties");
    const client = anonymousClient as unknown as SupabaseClient<PublicDatabase>;
    const setLocation = async (
      visibility: "EXACT" | "APPROXIMATE" | "HIDDEN",
      publicLatitude: number | null,
      publicLongitude: number | null,
    ) => {
      const [property, location] = await Promise.all([
        database
          .from("properties")
          .update({ location_visibility: visibility })
          .eq("id", propertyId),
        database
          .from("property_locations")
          .update({
            location_visibility: visibility,
            public_latitude: publicLatitude,
            public_longitude: publicLongitude,
            public_accuracy_m: visibility === "APPROXIMATE" ? 2_000 : null,
          })
          .eq("property_id", propertyId),
      ]);
      if (property.error) throw property.error;
      if (location.error) throw location.error;
      return getPublicPropertyDetail(client, draftPublicSlug);
    };

    const exact = await setLocation("EXACT", 23.022505, 72.571365);
    expect(exact?.location).toEqual({
      visibility: "EXACT",
      label: "Synthetic public area, Ahmedabad district",
      point: null,
    });
    expect(JSON.stringify(exact)).not.toMatch(/23[.]022505|72[.]571365/);

    const approximate = await setLocation("APPROXIMATE", 22.99, 72.38);
    expect(approximate?.location).toEqual({
      visibility: "APPROXIMATE",
      label: "Synthetic public area, Ahmedabad district",
      point: null,
    });
    expect(JSON.stringify(approximate)).not.toMatch(/22[.]99|72[.]38|23[.]022505|72[.]571365/);

    const hidden = await setLocation("HIDDEN", null, null);
    expect(hidden?.location).toEqual({
      visibility: "HIDDEN",
      label: "Ahmedabad",
      point: null,
    });
  });

  it("updates closed availability without changing publication state", async () => {
    const changed = await database.rpc("change_property_availability", {
      requested_property_id: propertyId,
      requested_expected_updated_at: await updatedAt(),
      requested_next_status: "SOLD",
      requested_actor_id: actorId,
    });
    if (changed.error) throw changed.error;
    const listing = await anonymousClient
      .from("public_property_listings")
      .select("availability_status")
      .eq("id", propertyId)
      .single();
    expect(listing.data?.availability_status).toBe("SOLD");
    const property = await database
      .from("properties")
      .select("publication_status")
      .eq("id", propertyId)
      .single();
    expect(property.data?.publication_status).toBe("PUBLISHED");
  });

  it("unpublishes without deleting and removes every anonymous projection", async () => {
    const { unpublishPropertyWithClient } = await import("@/server/services/property-publication");
    await unpublishPropertyWithClient(
      database,
      actorId,
      propertyId,
      await updatedAt(),
      "Synthetic integration unpublish check",
    );
    const [listing, indexable, property] = await Promise.all([
      anonymousClient.from("public_property_listings").select("id").eq("id", propertyId),
      anonymousClient.from("public_property_indexability").select("id").eq("id", propertyId),
      database
        .from("properties")
        .select("publication_status,deleted_at")
        .eq("id", propertyId)
        .single(),
    ]);
    expect(listing.data).toEqual([]);
    expect(indexable.data).toEqual([]);
    expect(property.data).toMatchObject({ publication_status: "UNPUBLISHED", deleted_at: null });
  });

  it("keeps marketing readiness independent when an advanced review needs attention", async () => {
    const { getPublicationReadinessWithClient } =
      await import("@/server/services/property-publication");
    const { transitionVerificationWithClient } = await import("@/server/services/verifications");
    await transitionVerificationWithClient(database, actorId, revenueCheckId, "REQUIRES_REVIEW", {
      reason: "Synthetic evidence mismatch introduced after unpublish.",
    });
    const readiness = await getPublicationReadinessWithClient(database, actorId, propertyId);
    expect(readiness.blockers.map(({ code }) => code)).not.toContain("REQUIRED_CHECK_UNSUPPORTED");
    const detail = await database
      .from("property_verifications")
      .select("status")
      .eq("id", revenueCheckId)
      .single();
    expect(detail.error).toBeNull();
    expect(detail.data?.status).toBe("REQUIRES_REVIEW");
  });
});
