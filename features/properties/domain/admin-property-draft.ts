import { z } from "zod";

import {
  landCategorySchema,
  propertyLocationSchema,
  propertyOfferSchema,
  transactionTypeSchema,
} from "@/lib/validation/domain-schemas";

const uuid = z.uuid();
const blankToUndefined = (maximum: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maximum).optional(),
  );
const optionalNonNegative = z.number().finite().nonnegative().optional();

const agriculturalDetailsSchema = z
  .object({
    landCategory: z.literal("AGRICULTURAL"),
    tenureType: blankToUndefined(40),
    irrigationStatus: blankToUndefined(40),
    roadTouch: z.boolean().optional(),
    roadWidthMetres: optionalNonNegative,
    currentCultivationStatus: blankToUndefined(50),
  })
  .strict();

const naDetailsSchema = z
  .object({
    landCategory: z.literal("NA"),
    naStatus: z.string().trim().min(1, "NA status is required.").max(40),
    naPurpose: blankToUndefined(160),
    developmentPermissionStatus: blankToUndefined(50),
    roadWidthMetres: optionalNonNegative,
    frontageMetres: optionalNonNegative,
    cornerPlot: z.boolean().optional(),
    restrictionSummary: blankToUndefined(5_000),
  })
  .strict();

const industrialDetailsSchema = z
  .object({
    landCategory: z.literal("INDUSTRIAL"),
    industrialSubtype: blankToUndefined(100),
    industrialAuthorityName: blankToUndefined(180),
    industrialTenure: blankToUndefined(60),
    gidcPlotNumber: blankToUndefined(100),
    existingShedPresent: z.boolean().optional(),
    roadWidthMetres: optionalNonNegative,
    powerStatus: blankToUndefined(50),
    connectivitySummary: blankToUndefined(5_000),
  })
  .strict();

export const propertyCategoryDetailsSchema = z.discriminatedUnion("landCategory", [
  agriculturalDetailsSchema,
  naDetailsSchema,
  industrialDetailsSchema,
]);

export const propertyParcelDraftSchema = z
  .object({
    sequenceNo: z.number().int().positive().max(32).default(1),
    label: blankToUndefined(80),
    areaValue: z.number().finite().positive().optional(),
    areaUnitId: uuid.optional(),
    identifierType: z
      .enum([
        "SURVEY_NUMBER",
        "HISSA_NUMBER",
        "BLOCK_NUMBER",
        "CITY_SURVEY_NUMBER",
        "PROPERTY_CARD_NUMBER",
        "VF7_REFERENCE",
        "VF8A_REFERENCE",
        "VF6_ENTRY_NUMBER",
        "ULPIN",
        "GIDC_PLOT_NUMBER",
        "GIDC_SHED_NUMBER",
        "OTHER",
      ])
      .optional(),
    identifierValue: blankToUndefined(160),
    identifierVisibility: z.enum(["PUBLIC", "ADMIN_ONLY", "PRIVATE"]).default("ADMIN_ONLY"),
    notesInternal: blankToUndefined(5_000),
  })
  .strict()
  .superRefine((parcel, context) => {
    if (parcel.areaValue !== undefined && !parcel.areaUnitId) {
      context.addIssue({
        code: "custom",
        path: ["areaUnitId"],
        message: "Parcel area needs a unit.",
      });
    }
    if (parcel.identifierValue && !parcel.identifierType) {
      context.addIssue({
        code: "custom",
        path: ["identifierType"],
        message: "Choose an identifier type.",
      });
    }
  });

export const propertyPlanningDraftSchema = z
  .object({
    reservationStatus: blankToUndefined(50),
    roadReservationStatus: blankToUndefined(50),
    publicNotes: blankToUndefined(5_000),
    internalNotes: blankToUndefined(10_000),
    checkedAt: z.iso.datetime().optional(),
  })
  .strict();

export const propertyPartyLinkDraftSchema = z
  .object({
    partyId: uuid,
    role: z.enum([
      "OWNER",
      "CO_OWNER",
      "AUTHORIZED_REPRESENTATIVE",
      "BROKER",
      "INTERMEDIARY",
      "DEVELOPER",
      "INSTITUTIONAL_OWNER",
      "OTHER",
    ]),
    ownershipSharePercent: z.number().min(0).max(100).optional(),
    notesInternal: blankToUndefined(5_000),
  })
  .strict();

export const propertySourceLinkDraftSchema = z
  .object({
    sourceType: z.string().trim().min(1).max(50),
    sourceName: blankToUndefined(180),
    sourceReference: blankToUndefined(180),
    notesInternal: blankToUndefined(5_000),
  })
  .strict();

const offerSchema = propertyOfferSchema.and(z.object({ commercialTerms: blankToUndefined(5_000) }));

export const adminPropertyDraftSchema = z
  .object({
    landCategory: landCategorySchema,
    primaryTransactionType: transactionTypeSchema,
    listingTitle: blankToUndefined(220),
    shortDescription: blankToUndefined(1_000),
    description: blankToUndefined(20_000),
    districtId: uuid,
    subdistrictId: uuid.optional(),
    placeId: uuid.optional(),
    localityId: uuid.optional(),
    landmarkText: blankToUndefined(240),
    publicAddress: blankToUndefined(2_000),
    displayAreaValue: z.number().finite().positive("Area must be greater than zero."),
    displayAreaUnitId: uuid,
    publicSlug: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z
        .string()
        .trim()
        .max(220)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.")
        .optional(),
    ),
    location: propertyLocationSchema.extend({ locationNotes: blankToUndefined(5_000) }),
    offer: offerSchema,
    parcel: propertyParcelDraftSchema.optional(),
    planning: propertyPlanningDraftSchema.optional(),
    categoryDetails: propertyCategoryDetailsSchema,
    partyLink: propertyPartyLinkDraftSchema.nullable().optional(),
    sourceLink: propertySourceLinkDraftSchema.optional(),
  })
  .strict()
  .superRefine((draft, context) => {
    if (draft.categoryDetails.landCategory !== draft.landCategory) {
      context.addIssue({
        code: "custom",
        path: ["categoryDetails", "landCategory"],
        message: "Category details must match the property category.",
      });
    }
    if (draft.offer.transactionType !== draft.primaryTransactionType) {
      context.addIssue({
        code: "custom",
        path: ["offer", "transactionType"],
        message: "The primary offer must match the primary transaction.",
      });
    }
    if (
      (draft.offer.priceMode === "EXACT_TOTAL" && draft.offer.amount <= 0) ||
      (draft.offer.priceMode === "PRICE_RANGE" &&
        (draft.offer.minimum <= 0 || draft.offer.maximum <= 0)) ||
      (draft.offer.priceMode === "PER_UNIT" && draft.offer.perUnit <= 0)
    ) {
      context.addIssue({
        code: "custom",
        path: ["offer"],
        message: "Numeric prices must be greater than zero.",
      });
    }
  });

export type AdminPropertyDraftInput = z.infer<typeof adminPropertyDraftSchema>;

export function buildPropertySlug(
  title: string | undefined,
  propertyCode: string,
): string | undefined {
  if (!title?.trim()) return undefined;
  const stem = title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 190)
    .replace(/-+$/g, "");
  return stem ? `${stem}-${propertyCode.toLowerCase()}` : propertyCode.toLowerCase();
}

export class PropertyDraftConflictError extends Error {
  constructor() {
    super("This property changed after the form was opened. Reload it before saving again.");
    this.name = "PropertyDraftConflictError";
  }
}

export class PublicationUnavailableError extends Error {
  constructor() {
    super("Publication is unavailable until the M9 publication gate is complete.");
    this.name = "PublicationUnavailableError";
  }
}
