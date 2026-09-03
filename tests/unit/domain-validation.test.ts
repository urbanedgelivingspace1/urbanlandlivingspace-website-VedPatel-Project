// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  ownerSubmissionSchema,
  propertyLocationSchema,
  propertyOfferSchema,
  publicContactSchema,
  siteVisitSchema,
} from "@/lib/validation/domain-schemas";

const id = "10000000-0000-4000-8000-000000000001";

describe("server-authoritative domain validation", () => {
  it("accepts price-on-request without invented monetary data", () => {
    expect(
      propertyOfferSchema.parse({
        transactionType: "BUY",
        currencyCode: "INR",
        priceMode: "PRICE_ON_REQUEST",
      }),
    ).toMatchObject({ priceMode: "PRICE_ON_REQUEST" });
  });

  it("rejects reversed price ranges", () => {
    expect(() =>
      propertyOfferSchema.parse({
        transactionType: "BUY",
        currencyCode: "INR",
        priceMode: "PRICE_RANGE",
        minimum: 200,
        maximum: 100,
      }),
    ).toThrow();
  });

  it("rejects public coordinates in hidden mode", () => {
    expect(() =>
      propertyLocationSchema.parse({
        visibility: "HIDDEN",
        privateLatitude: 23.1,
        privateLongitude: 72.1,
        publicLatitude: 23.1,
        publicLongitude: 72.1,
        publicAccuracyMetres: null,
      }),
    ).toThrow(/Hidden locations/);
  });

  it("requires visit consent and an increasing time range", () => {
    expect(() =>
      siteVisitSchema.parse({
        name: "Synthetic visitor",
        email: "visitor@example.invalid",
        propertyId: id,
        requestedStartAt: "2026-09-03T10:00:00.000Z",
        requestedEndAt: "2026-09-03T09:00:00.000Z",
        consent: true,
      }),
    ).toThrow();
  });

  it("requires public contact details and consent", () => {
    expect(() =>
      publicContactSchema.parse({ name: "Test Person", message: "Hello", consent: true }),
    ).toThrow();
  });

  it("parses an owner submission as intake, not a property", () => {
    const submission = ownerSubmissionSchema.parse({
      name: "Synthetic owner",
      phone: "0000000000",
      landCategory: "AGRICULTURAL",
      primaryTransactionType: "BUY",
      consent: true,
    });
    expect(submission).not.toHaveProperty("publicationStatus");
  });
});
