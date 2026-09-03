// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  adminPropertyDraftSchema,
  buildPropertySlug,
  PublicationUnavailableError,
} from "@/features/properties/domain/admin-property-draft";

const districtId = "00000000-0000-4000-8000-000000000003";
const unitId = "10000000-0000-4000-8000-000000000006";

function shared(category: "AGRICULTURAL" | "NA" | "INDUSTRIAL") {
  return {
    landCategory: category,
    primaryTransactionType: "BUY" as const,
    districtId,
    displayAreaValue: 1,
    displayAreaUnitId: unitId,
    location: {
      visibility: "HIDDEN" as const,
      privateLatitude: null,
      privateLongitude: null,
      publicLatitude: null,
      publicLongitude: null,
      publicAccuracyMetres: null,
    },
    offer: {
      transactionType: "BUY" as const,
      currencyCode: "INR" as const,
      priceMode: "PRICE_ON_REQUEST" as const,
      negotiable: false,
    },
  };
}

describe("M6 property draft contract", () => {
  it.each([
    ["AGRICULTURAL", { landCategory: "AGRICULTURAL" }],
    ["NA", { landCategory: "NA", naStatus: "CHECK_PENDING" }],
    ["INDUSTRIAL", { landCategory: "INDUSTRIAL" }],
  ] as const)(
    "allows an incomplete %s draft without publish fields",
    (category, categoryDetails) => {
      const result = adminPropertyDraftSchema.parse({ ...shared(category), categoryDetails });
      expect(result).not.toHaveProperty("publicationStatus");
      expect(result.offer.priceMode).toBe("PRICE_ON_REQUEST");
    },
  );

  it("rejects client-supplied actor, identity, and publication fields", () => {
    expect(() =>
      adminPropertyDraftSchema.parse({
        ...shared("AGRICULTURAL"),
        categoryDetails: { landCategory: "AGRICULTURAL" },
        propertyCode: "UE-LS-999999",
        publicationStatus: "PUBLISHED",
        updatedBy: "60000000-0000-4000-8000-000000000001",
      }),
    ).toThrow();
  });

  it("keeps the category discriminator and extension consistent", () => {
    expect(() =>
      adminPropertyDraftSchema.parse({
        ...shared("NA"),
        categoryDetails: { landCategory: "AGRICULTURAL" },
      }),
    ).toThrow(/Category details/);
  });

  it("keeps the primary offer transaction aligned with the property", () => {
    expect(() =>
      adminPropertyDraftSchema.parse({
        ...shared("INDUSTRIAL"),
        categoryDetails: { landCategory: "INDUSTRIAL" },
        offer: {
          transactionType: "LEASE",
          currencyCode: "INR",
          priceMode: "PRICE_ON_REQUEST",
        },
      }),
    ).toThrow(/primary offer/i);
  });

  it("builds a stable public slug with the immutable Property ID", () => {
    expect(buildPropertySlug("  Farm & Orchard — Sanand ", "UE-LS-000042")).toBe(
      "farm-orchard-sanand-ue-ls-000042",
    );
  });

  it("rejects malformed slugs and zero-value numeric pricing", () => {
    expect(() =>
      adminPropertyDraftSchema.parse({
        ...shared("AGRICULTURAL"),
        publicSlug: "Not A Safe Slug",
        categoryDetails: { landCategory: "AGRICULTURAL" },
      }),
    ).toThrow(/lowercase letters/);
    expect(() =>
      adminPropertyDraftSchema.parse({
        ...shared("AGRICULTURAL"),
        offer: {
          transactionType: "BUY",
          currencyCode: "INR",
          priceMode: "EXACT_TOTAL",
          amount: 0,
        },
        categoryDetails: { landCategory: "AGRICULTURAL" },
      }),
    ).toThrow(/greater than zero/);
  });

  it("defines the explicit pre-M9 publication blocker", () => {
    expect(new PublicationUnavailableError().message).toMatch(/M9 publication gate/);
  });
});
