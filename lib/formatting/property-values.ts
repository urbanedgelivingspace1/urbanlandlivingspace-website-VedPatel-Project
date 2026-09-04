import type { PublicPriceDto } from "@/features/properties/domain/contracts";
import type { AvailabilityStatus, LandCategory, TransactionType } from "@/types/database";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPublicPrice(price: PublicPriceDto): string {
  switch (price.mode) {
    case "PRICE_ON_REQUEST":
      return "Price on request";
    case "EXACT_TOTAL":
      return price.amount === null ? "Price on request" : inr.format(price.amount);
    case "PRICE_RANGE":
      return price.minimum === null || price.maximum === null
        ? "Price on request"
        : `${inr.format(price.minimum)}–${inr.format(price.maximum)}`;
    case "PER_UNIT":
      return price.perUnit === null
        ? "Price on request"
        : `${inr.format(price.perUnit)} / ${price.unitCode ?? "unit"}`;
  }
}

const decimal = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });

export function formatPublicArea(
  area: Readonly<{
    value: number;
    unitLabel: string;
    symbol: string | null;
  }>,
): string {
  return `${decimal.format(area.value)} ${area.symbol || area.unitLabel}`;
}

export const categoryLabels: Record<LandCategory, string> = {
  AGRICULTURAL: "Agricultural Land",
  NA: "NA Land",
  INDUSTRIAL: "Industrial Land",
};

export const transactionLabels: Record<TransactionType, string> = {
  BUY: "For Purchase",
  RENT: "For Rent",
  LEASE: "For Lease",
};

export const availabilityLabels: Record<AvailabilityStatus, string> = {
  AVAILABLE: "Available",
  UNDER_NEGOTIATION: "Under negotiation",
  SOLD: "Sold",
  RENTED: "Rented",
  LEASED: "Leased",
  OFF_MARKET: "Off market",
};

export function humanizePropertyValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/(^|\s)\S/g, (character) => character.toUpperCase());
}

export function isClosedPublicAvailability(status: AvailabilityStatus): boolean {
  return status === "SOLD" || status === "RENTED" || status === "LEASED" || status === "OFF_MARKET";
}

export function convertArea(value: number, factorToSquareMetres: number): number {
  if (
    !Number.isFinite(value) ||
    value <= 0 ||
    !Number.isFinite(factorToSquareMetres) ||
    factorToSquareMetres <= 0
  ) {
    throw new Error("Area conversion requires positive finite values.");
  }
  return value * factorToSquareMetres;
}
