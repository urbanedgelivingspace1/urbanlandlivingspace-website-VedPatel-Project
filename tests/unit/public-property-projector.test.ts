// @vitest-environment node

import { describe, expect, it } from "vitest";

import { projectPublicPropertyCard } from "@/features/properties/queries/public-property-projector";
import { convertArea, formatPublicPrice } from "@/lib/formatting/property-values";
import type { PublicPropertyListingRow } from "@/types/database";

const row: PublicPropertyListingRow = {
  id: "20000000-0000-4000-8000-000000000001",
  property_code: "UE-LS-000001",
  public_slug: "synthetic-public-land",
  land_category: "AGRICULTURAL",
  primary_transaction_type: "BUY",
  listing_title: "Synthetic public land",
  short_description: "Clearly synthetic test data",
  availability_status: "AVAILABLE",
  featured: false,
  published_at: "2026-09-03T00:00:00.000Z",
  district_id: "00000000-0000-4000-8000-000000000003",
  district_name: "Ahmedabad",
  subdistrict_id: null,
  subdistrict_name: null,
  place_id: null,
  place_name: null,
  locality_id: null,
  locality_name: null,
  landmark_text: null,
  public_address: null,
  display_area_value: 2,
  display_area_unit_code: "acre",
  display_area_unit_name: "Acre",
  display_area_unit_symbol: "ac",
  location_visibility: "HIDDEN",
  public_latitude: null,
  public_longitude: null,
  public_accuracy_m: null,
  offer_transaction_type: "BUY",
  price_mode: "EXACT_TOTAL",
  currency_code: "INR",
  price_amount: 10_000_000,
  price_min: null,
  price_max: null,
  price_per_unit: null,
  price_unit_code: null,
  is_negotiable: true,
  cover_media_id: null,
  cover_object_path: null,
  cover_alt_text: null,
  cover_width_px: null,
  cover_height_px: null,
};

describe("public property projection", () => {
  it("serializes an explicit whitelist and discards private-shaped extras", () => {
    const unsafeSource = {
      ...row,
      owner_email: "PRIVATE_OWNER_EMAIL_CANARY",
      private_latitude: "PRIVATE_EXACT_LAT_CANARY",
      private_document_path: "PRIVATE_DOC_PATH_CANARY",
      notes_internal: "INTERNAL_NOTE_CANARY",
    };
    const serialized = JSON.stringify(projectPublicPropertyCard(unsafeSource));

    expect(serialized).not.toMatch(/PRIVATE_|INTERNAL_NOTE/);
    expect(serialized).toContain("UE-LS-000001");
  });

  it("formats supported price modes and converts area deterministically", () => {
    const card = projectPublicPropertyCard(row);
    expect(card.price && formatPublicPrice(card.price)).toMatch(/1,00,00,000/);
    expect(convertArea(1, 4046.8564224)).toBeCloseTo(4046.8564224);
  });
});
