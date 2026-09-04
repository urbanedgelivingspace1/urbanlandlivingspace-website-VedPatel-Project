// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  availabilityLabels,
  categoryLabels,
  formatPublicArea,
  formatPublicPrice,
  humanizePropertyValue,
  isClosedPublicAvailability,
  transactionLabels,
} from "@/lib/formatting/property-values";

const priceBase = {
  transactionType: "BUY" as const,
  currency: "INR" as const,
  amount: null,
  minimum: null,
  maximum: null,
  perUnit: null,
  unitCode: null,
  negotiable: false,
};

describe("M10 public property formatting", () => {
  it("formats all supported price modes", () => {
    expect(formatPublicPrice({ ...priceBase, mode: "PRICE_ON_REQUEST" })).toBe("Price on request");
    expect(formatPublicPrice({ ...priceBase, mode: "EXACT_TOTAL", amount: 12_500_000 })).toMatch(
      /1,25,00,000/,
    );
    expect(
      formatPublicPrice({
        ...priceBase,
        mode: "PRICE_RANGE",
        minimum: 5_000_000,
        maximum: 7_500_000,
      }),
    ).toMatch(/50,00,000.*75,00,000/);
    expect(
      formatPublicPrice({ ...priceBase, mode: "PER_UNIT", perUnit: 2_400, unitCode: "sq_m" }),
    ).toMatch(/2,400 \/ sq_m/);
  });

  it("falls back safely when a configured price is incomplete", () => {
    expect(formatPublicPrice({ ...priceBase, mode: "EXACT_TOTAL" })).toBe("Price on request");
    expect(formatPublicPrice({ ...priceBase, mode: "PRICE_RANGE", minimum: 10 })).toBe(
      "Price on request",
    );
    expect(formatPublicPrice({ ...priceBase, mode: "PER_UNIT" })).toBe("Price on request");
  });

  it("formats public area and controlled labels", () => {
    expect(formatPublicArea({ value: 2.125, unitLabel: "Acre", symbol: "ac" })).toBe("2.125 ac");
    expect(categoryLabels).toEqual({
      AGRICULTURAL: "Agricultural Land",
      NA: "NA Land",
      INDUSTRIAL: "Industrial Land",
    });
    expect(transactionLabels.LEASE).toBe("For Lease");
    expect(availabilityLabels.UNDER_NEGOTIATION).toBe("Under negotiation");
    expect(humanizePropertyValue("DEVELOPMENT_PERMISSION_PENDING")).toBe(
      "Development Permission Pending",
    );
  });

  it("identifies every closed availability state", () => {
    expect(
      (["SOLD", "RENTED", "LEASED", "OFF_MARKET"] as const).every(isClosedPublicAvailability),
    ).toBe(true);
    expect(isClosedPublicAvailability("AVAILABLE")).toBe(false);
    expect(isClosedPublicAvailability("UNDER_NEGOTIATION")).toBe(false);
  });
});
