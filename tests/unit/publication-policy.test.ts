import { describe, expect, it } from "vitest";

import {
  categoryPublicationFieldsComplete,
  containsUnsafePublicationClaim,
  isClosedAvailability,
  isPriceStructureValid,
  isPublicLocationSafe,
  issuesForGroup,
  parsePublicationReadiness,
} from "@/features/properties/domain/publication";

describe("M9 publication policy", () => {
  it("accepts Price on Request without a numeric price", () => {
    expect(isPriceStructureValid({ mode: "PRICE_ON_REQUEST" })).toBe(true);
  });

  it("rejects contradictory Price on Request data", () => {
    expect(isPriceStructureValid({ mode: "PRICE_ON_REQUEST", amount: 1 })).toBe(false);
  });

  it("validates exact, range, and per-unit price structures", () => {
    expect(isPriceStructureValid({ mode: "EXACT_TOTAL", amount: 1 })).toBe(true);
    expect(isPriceStructureValid({ mode: "PRICE_RANGE", minimum: 2, maximum: 1 })).toBe(false);
    expect(isPriceStructureValid({ mode: "PER_UNIT", perUnit: 4, unitId: "acre" })).toBe(true);
  });

  it("keeps hidden location coordinate-free", () => {
    expect(
      isPublicLocationSafe({ visibility: "HIDDEN", publicLatitude: null, publicLongitude: null }),
    ).toBe(true);
    expect(
      isPublicLocationSafe({ visibility: "HIDDEN", publicLatitude: 23, publicLongitude: 72 }),
    ).toBe(false);
  });

  it("rejects an approximate point that equals the private point", () => {
    expect(
      isPublicLocationSafe({
        visibility: "APPROXIMATE",
        privateLatitude: 23,
        privateLongitude: 72,
        publicLatitude: 23,
        publicLongitude: 72,
      }),
    ).toBe(false);
  });

  it("allows explicit exact disclosure only with a public point", () => {
    expect(
      isPublicLocationSafe({ visibility: "EXACT", publicLatitude: 23, publicLongitude: 72 }),
    ).toBe(true);
    expect(
      isPublicLocationSafe({ visibility: "EXACT", publicLatitude: null, publicLongitude: null }),
    ).toBe(false);
  });

  it("blocks unsafe legal and development claims", () => {
    expect(containsUnsafePublicationClaim("100% clear title land")).toBe(true);
    expect(containsUnsafePublicationClaim("Guaranteed construction")).toBe(true);
    expect(containsUnsafePublicationClaim("Scoped records were reviewed")).toBe(false);
  });

  it("requires category-specific agricultural data only", () => {
    expect(
      categoryPublicationFieldsComplete("AGRICULTURAL", {
        tenureType: "RECORDED",
        irrigationStatus: "RECORDED",
        roadTouch: false,
      }),
    ).toBe(true);
    expect(categoryPublicationFieldsComplete("AGRICULTURAL", { tenureType: "RECORDED" })).toBe(
      false,
    );
  });

  it("requires category-specific NA data only", () => {
    expect(
      categoryPublicationFieldsComplete("NA", {
        naStatus: "RECORDED",
        naPurpose: "Residential",
        roadWidthMetres: 12,
      }),
    ).toBe(true);
    expect(
      categoryPublicationFieldsComplete("NA", {
        naStatus: "CHECK_PENDING",
        naPurpose: "Residential",
        roadWidthMetres: 12,
      }),
    ).toBe(false);
  });

  it("requires category-specific industrial data only", () => {
    expect(
      categoryPublicationFieldsComplete("INDUSTRIAL", {
        industrialSubtype: "PLOT",
        industrialTenure: "LEASE",
        powerStatus: "RECORDED",
        connectivitySummary: "Road access recorded",
      }),
    ).toBe(true);
    expect(categoryPublicationFieldsComplete("INDUSTRIAL", { industrialSubtype: "PLOT" })).toBe(
      false,
    );
  });

  it("classifies only sold, rented, and leased inventory as closed", () => {
    expect(isClosedAvailability("SOLD")).toBe(true);
    expect(isClosedAvailability("RENTED")).toBe(true);
    expect(isClosedAvailability("LEASED")).toBe(true);
    expect(isClosedAvailability("UNDER_NEGOTIATION")).toBe(false);
  });

  it("parses structured readiness and groups blockers", () => {
    const readiness = parsePublicationReadiness({
      propertyId: "90000000-0000-4000-8000-000000000001",
      propertyCode: "UE-LS-000001",
      publicSlug: "sample",
      publicationStatus: "DRAFT",
      availabilityStatus: "AVAILABLE",
      locationVisibility: "HIDDEN",
      ready: false,
      blockers: [{ group: "MEDIA", code: "COVER", message: "Cover required" }],
      warnings: [],
      evaluatedAt: "2026-09-04T00:00:00Z",
    });
    expect(issuesForGroup(readiness, "MEDIA").blockers).toHaveLength(1);
    expect(issuesForGroup(readiness, "CONTENT").blockers).toHaveLength(0);
  });
});
