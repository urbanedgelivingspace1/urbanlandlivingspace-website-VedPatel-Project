import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { emptySearchQuery } from "@/features/search/domain/search-query";
import type { PostgresSearchProvider } from "@/server/search/postgres-search-provider";
import type { Database as GeneratedDatabase } from "@/types/database.generated";
import type { Database } from "@/types/database";

vi.mock("server-only", () => ({}));

let service: SupabaseClient<GeneratedDatabase>;
let provider: PostgresSearchProvider;
const propertyId = crypto.randomUUID();
const marker = Date.now().toString().slice(-6).padStart(6, "0");
const propertyCode = `UE-LS-${marker}`;

beforeAll(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !serviceKey || !anonKey)
    throw new Error("Local M11 integration environment is missing.");
  service = createClient<GeneratedDatabase>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const inserted = await service.from("properties").insert({
    id: propertyId,
    property_code: propertyCode,
    public_slug: `m11-provider-${marker}`,
    land_category: "AGRICULTURAL",
    primary_transaction_type: "BUY",
    publication_status: "PUBLISHED",
    availability_status: "AVAILABLE",
    listing_title: `M11 provider orchard ${marker}`,
    short_description: "Synthetic bounded provider fixture",
    district_id: "00000000-0000-4000-8000-000000000003",
    display_area_value: 2,
    display_area_unit_id: "10000000-0000-4000-8000-000000000006",
    location_visibility: "HIDDEN",
    published_at: new Date().toISOString(),
  });
  if (inserted.error) throw inserted.error;
  const category = await service.from("property_agricultural").insert({
    property_id: propertyId,
    tenure_type: "M11_RECORDED",
    irrigation_status: "M11_CANAL",
  });
  if (category.error) throw category.error;
  const anonymous = createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const providerModule = await import("@/server/search/postgres-search-provider");
  provider = new providerModule.PostgresSearchProvider(anonymous);
});

afterAll(async () => {
  if (!service) return;
  await service.from("property_agricultural").delete().eq("property_id", propertyId);
  await service.from("properties").delete().eq("id", propertyId);
});

describe.sequential("M11 PostgreSQL search provider integration", () => {
  it("projects an exact public Property ID result through the canonical card DTO", async () => {
    const result = await provider.search({ ...emptySearchQuery(), propertyId: propertyCode });
    expect(result.totalCount).toBe(1);
    expect(result.properties[0]).toMatchObject({
      propertyCode,
      category: "AGRICULTURAL",
      transactionType: "BUY",
    });
  });

  it("uses the same provider for fixed category inventory", async () => {
    const result = await provider.searchFixed({ category: "AGRICULTURAL" }, 12);
    expect(result.properties.some((property) => property.propertyCode === propertyCode)).toBe(true);
  });

  it("loads bounded geography and category facet projections", async () => {
    const facets = await provider.facets();
    expect(facets.geography.some(({ district }) => district.value === "ahmedabad")).toBe(true);
    expect(facets.categorySpecific.agriculturalTenure).toContainEqual(
      expect.objectContaining({ value: "m11-recorded" }),
    );
  });
});
