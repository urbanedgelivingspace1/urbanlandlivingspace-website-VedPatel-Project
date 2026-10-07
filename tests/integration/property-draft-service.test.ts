import { createClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it, vi } from "vitest";

import type { AdminPropertyDraftInput } from "@/features/properties/domain/admin-property-draft";
import type { Database } from "@/types/database.generated";

vi.mock("server-only", () => ({}));

const districtId = "00000000-0000-4000-8000-000000000003";
const unitId = "10000000-0000-4000-8000-000000000006";
const created: Record<"AGRICULTURAL" | "NA" | "INDUSTRIAL", string> = {
  AGRICULTURAL: "",
  NA: "",
  INDUSTRIAL: "",
};
let actorId: string;

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Local integration environment is missing.");
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function draft(category: "AGRICULTURAL" | "NA" | "INDUSTRIAL"): AdminPropertyDraftInput {
  return {
    landCategory: category,
    primaryTransactionType: category === "INDUSTRIAL" ? "LEASE" : "BUY",
    listingTitle: `Synthetic integration ${category}`,
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=synthetic-draft-map",
    districtId,
    displayAreaValue: category === "AGRICULTURAL" ? 2 : 500,
    displayAreaUnitId: unitId,
    location: {
      visibility: "HIDDEN",
      privateLatitude: 23.01,
      privateLongitude: 72.01,
      publicLatitude: null,
      publicLongitude: null,
      publicAccuracyMetres: null,
      locationNotes: "SYNTHETIC_PRIVATE_LOCATION",
    },
    offer: {
      transactionType: category === "INDUSTRIAL" ? "LEASE" : "BUY",
      currencyCode: "INR",
      priceMode: "PRICE_ON_REQUEST",
      negotiable: false,
    },
    parcel: {
      sequenceNo: 1,
      label: "Synthetic parcel",
      identifierType: category === "INDUSTRIAL" ? "GIDC_PLOT_NUMBER" : "SURVEY_NUMBER",
      identifierValue: `SYN-${category}`,
      identifierVisibility: "ADMIN_ONLY",
    },
    planning: { reservationStatus: "CHECK_PENDING", internalNotes: "SYNTHETIC_PRIVATE_PLAN" },
    categoryDetails:
      category === "AGRICULTURAL"
        ? { landCategory: category, irrigationStatus: "CHECK_PENDING" }
        : category === "NA"
          ? { landCategory: category, naStatus: "CHECK_PENDING" }
          : { landCategory: category, industrialSubtype: "PLOT" },
    sourceLink: { sourceType: "SYNTHETIC_INTEGRATION", sourceName: "Test fixture" },
  };
}

beforeAll(async () => {
  const database = client();
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const { data, error } = await database.auth.admin.createUser({
    email: `m6-integration-${unique}@example.invalid`,
    password: `Synthetic-${unique}-Only!`,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error("Could not create integration actor.");
  actorId = data.user.id;
  const { error: profileError } = await database.from("admin_profiles").insert({
    user_id: actorId,
    display_name: "Synthetic M6 integration admin",
    role: "ADMIN",
    is_active: true,
  });
  if (profileError) throw profileError;
});

describe.sequential("M6 property draft service integration", () => {
  it.each(["AGRICULTURAL", "NA", "INDUSTRIAL"] as const)(
    "creates a transactional %s draft through the application adapter",
    async (category) => {
      const { persistPropertyDraft } = await import("@/server/services/property-drafts");
      const id = await persistPropertyDraft(client(), actorId, draft(category));
      created[category] = id;
      const database = client();
      const [property, offer, location] = await Promise.all([
        database.from("properties").select("*").eq("id", id).single(),
        database.from("property_offers").select("*").eq("property_id", id).single(),
        database.from("property_locations").select("*").eq("property_id", id).single(),
      ]);
      if (!property.data) throw property.error;
      expect(property.data.publication_status).toBe("DRAFT");
      expect(property.data.property_code).toMatch(/^UE-LS-\d{6}$/);
      expect(property.data.google_maps_embed_url).toBe(
        "https://www.google.com/maps/embed?pb=synthetic-draft-map",
      );
      expect(offer.data?.price_mode).toBe("PRICE_ON_REQUEST");
      expect(location.data?.private_latitude).toBe(23.01);
      expect(location.data?.public_latitude).toBeNull();
      const table =
        category === "AGRICULTURAL"
          ? "property_agricultural"
          : category === "NA"
            ? "property_na"
            : "property_industrial";
      const extension = await database
        .from(table)
        .select("property_id")
        .eq("property_id", id)
        .single();
      expect(extension.error).toBeNull();
    },
  );

  it("edits shared groups and rejects a stale optimistic-concurrency token", async () => {
    const { persistPropertyDraft } = await import("@/server/services/property-drafts");
    const database = client();
    const id = created.AGRICULTURAL;
    const loaded = await database.from("properties").select("updated_at").eq("id", id).single();
    if (!loaded.data) throw loaded.error;
    const changed = draft("AGRICULTURAL");
    changed.displayAreaValue = 4;
    changed.googleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=updated-draft-map";
    changed.location = {
      ...changed.location!,
      visibility: "APPROXIMATE",
      publicLatitude: 23.02,
      publicLongitude: 72.02,
      publicAccuracyMetres: 500,
    };
    changed.offer = {
      transactionType: "BUY",
      currencyCode: "INR",
      priceMode: "EXACT_TOTAL",
      amount: 2_500_000,
      negotiable: true,
    };
    await expect(
      persistPropertyDraft(database, actorId, changed, {
        id,
        expectedUpdatedAt: loaded.data.updated_at,
      }),
    ).resolves.toBe(id);
    await expect(
      persistPropertyDraft(database, actorId, changed, {
        id,
        expectedUpdatedAt: loaded.data.updated_at,
      }),
    ).rejects.toMatchObject({ name: "PropertyDraftConflictError" });
    const updated = await database
      .from("properties")
      .select("display_area_value,publication_status,google_maps_embed_url")
      .eq("id", id)
      .single();
    expect(updated.data).toMatchObject({
      display_area_value: 4,
      publication_status: "DRAFT",
      google_maps_embed_url: "https://www.google.com/maps/embed?pb=updated-draft-map",
    });
  });

  it("records actor-attributed audits without private location content", async () => {
    const audits = await client()
      .from("audit_logs")
      .select("actor_admin_id,before_state,after_state")
      .in("entity_id", Object.values(created));
    expect(audits.error).toBeNull();
    expect(audits.data?.length).toBeGreaterThanOrEqual(4);
    expect(audits.data?.every((audit) => audit.actor_admin_id === actorId)).toBe(true);
    expect(JSON.stringify(audits.data)).not.toContain("SYNTHETIC_PRIVATE");
  });
});
