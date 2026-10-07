import { z } from "zod";

import type {
  AvailabilityStatus,
  LandCategory,
  LocationVisibility,
  PriceMode,
} from "@/types/database";

export const publicationGroups = [
  "IDENTITY",
  "CONTENT",
  "CATEGORY_DATA",
  "LOCATION_PRIVACY",
  "OFFER_PRICE",
  "MEDIA",
  "CLAIMS_VERIFICATION",
  "PUBLIC_PROJECTION",
] as const;

const issueSchema = z.object({
  group: z.enum(publicationGroups),
  code: z.string().min(1),
  message: z.string().min(1),
  checkCode: z.string().optional(),
});

const readinessSchema = z.object({
  propertyId: z.uuid(),
  propertyCode: z.string(),
  publicSlug: z.string().nullable(),
  publicationStatus: z.enum(["DRAFT", "UNDER_REVIEW", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"]),
  availabilityStatus: z.enum([
    "AVAILABLE",
    "UNDER_NEGOTIATION",
    "SOLD",
    "RENTED",
    "LEASED",
    "OFF_MARKET",
  ]),
  locationVisibility: z.enum(["EXACT", "APPROXIMATE", "HIDDEN"]),
  ready: z.boolean(),
  blockers: z.array(issueSchema),
  warnings: z.array(issueSchema),
  evaluatedAt: z.string(),
});

export type PublicationIssue = z.infer<typeof issueSchema>;
export type PublicationReadiness = z.infer<typeof readinessSchema>;
export type PublicationActionState = Readonly<{ ok: boolean; message: string }>;

export function parsePublicationReadiness(value: unknown): PublicationReadiness {
  return readinessSchema.parse(value);
}

export function issuesForGroup(readiness: PublicationReadiness, group: PublicationIssue["group"]) {
  return {
    blockers: readiness.blockers.filter((issue) => issue.group === group),
    warnings: readiness.warnings.filter((issue) => issue.group === group),
  };
}

export function humanizePublicationIssue(message: string) {
  return message
    .replace(/public[- ]safe/gi, "listing")
    .replace(/publication/gi, "publishing")
    .replace(/authoritative/gi, "saved");
}

export function isPriceStructureValid(
  input: Readonly<{
    mode: PriceMode;
    amount?: number | null;
    minimum?: number | null;
    maximum?: number | null;
    perUnit?: number | null;
    unitId?: string | null;
  }>,
) {
  if (input.mode === "PRICE_ON_REQUEST")
    return [input.amount, input.minimum, input.maximum, input.perUnit, input.unitId].every(
      (value) => value === null || value === undefined,
    );
  if (input.mode === "EXACT_TOTAL") return input.amount !== null && input.amount !== undefined;
  if (input.mode === "PRICE_RANGE")
    return (
      input.minimum !== null &&
      input.minimum !== undefined &&
      input.maximum !== null &&
      input.maximum !== undefined &&
      input.minimum <= input.maximum
    );
  return input.perUnit !== null && input.perUnit !== undefined && Boolean(input.unitId);
}

export function isPublicLocationSafe(
  input: Readonly<{
    visibility: LocationVisibility;
    publicLatitude: number | null;
    publicLongitude: number | null;
    privateLatitude?: number | null;
    privateLongitude?: number | null;
  }>,
) {
  if (input.visibility === "HIDDEN")
    return input.publicLatitude === null && input.publicLongitude === null;
  if (input.visibility === "EXACT")
    return input.publicLatitude !== null && input.publicLongitude !== null;
  return !(
    input.privateLatitude !== null &&
    input.privateLatitude !== undefined &&
    input.publicLatitude === input.privateLatitude &&
    input.publicLongitude === input.privateLongitude
  );
}

const unsafeClaims =
  /(100% clear title|clear title|legally verified|government approved|fully verified|dispute[ -]free|guaranteed na|guaranteed construction|risk[ -]free|no legal issues)/i;

export function containsUnsafePublicationClaim(...values: (string | null | undefined)[]) {
  return unsafeClaims.test(values.filter(Boolean).join(" "));
}

export function categoryPublicationFieldsComplete(
  category: LandCategory,
  values: Readonly<Record<string, unknown>>,
) {
  if (category === "AGRICULTURAL")
    return Boolean(values.tenureType && values.irrigationStatus && values.roadTouch !== undefined);
  if (category === "NA")
    return Boolean(
      values.naStatus &&
      values.naStatus !== "CHECK_PENDING" &&
      values.naPurpose &&
      values.roadWidthMetres,
    );
  return Boolean(
    values.industrialSubtype &&
    values.industrialTenure &&
    values.powerStatus &&
    values.connectivitySummary,
  );
}

export function isClosedAvailability(status: AvailabilityStatus) {
  return status === "SOLD" || status === "RENTED" || status === "LEASED";
}
