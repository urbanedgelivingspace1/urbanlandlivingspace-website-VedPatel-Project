import type { PublicPriceDto } from "@/features/properties/domain/contracts";

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
