import { z } from "zod";

const uuid = z.uuid();
const positiveDecimal = z.number().finite().positive();
const optionalTrimmed = (maximum: number) => z.string().trim().max(maximum).optional();
const publicContactIdentitySchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.email().max(320).optional(),
  phone: z.string().trim().min(7).max(40).optional(),
});

export const landCategorySchema = z.enum(["AGRICULTURAL", "NA", "INDUSTRIAL"]);
export const transactionTypeSchema = z.enum(["BUY", "RENT", "LEASE"]);

export const propertyDraftSchema = z.object({
  id: uuid.optional(),
  landCategory: landCategorySchema,
  primaryTransactionType: transactionTypeSchema,
  listingTitle: optionalTrimmed(220),
  shortDescription: optionalTrimmed(1_000),
  description: optionalTrimmed(20_000),
  districtId: uuid,
  subdistrictId: uuid.optional(),
  placeId: uuid.optional(),
  localityId: uuid.optional(),
  displayAreaValue: positiveDecimal,
  displayAreaUnitId: uuid,
});

const offerBase = z.object({
  transactionType: transactionTypeSchema,
  currencyCode: z.literal("INR"),
  negotiable: z.boolean().default(false),
});
export const propertyOfferSchema = z.discriminatedUnion("priceMode", [
  offerBase.extend({ priceMode: z.literal("PRICE_ON_REQUEST") }),
  offerBase.extend({
    priceMode: z.literal("EXACT_TOTAL"),
    amount: z.number().finite().nonnegative(),
  }),
  offerBase
    .extend({
      priceMode: z.literal("PRICE_RANGE"),
      minimum: z.number().finite().nonnegative(),
      maximum: z.number().finite().nonnegative(),
    })
    .refine((offer) => offer.maximum >= offer.minimum, {
      message: "Maximum price must be at least the minimum price.",
      path: ["maximum"],
    }),
  offerBase.extend({
    priceMode: z.literal("PER_UNIT"),
    perUnit: z.number().finite().nonnegative(),
    unitId: uuid,
  }),
]);

export const categorySpecificPropertySchema = z.discriminatedUnion("landCategory", [
  z.object({
    landCategory: z.literal("AGRICULTURAL"),
    irrigationStatus: optionalTrimmed(40),
    roadWidthMetres: z.number().finite().nonnegative().optional(),
  }),
  z.object({
    landCategory: z.literal("NA"),
    naStatus: z.string().trim().min(1).max(40),
    naPurpose: optionalTrimmed(160),
  }),
  z.object({
    landCategory: z.literal("INDUSTRIAL"),
    industrialContext: z.string().trim().min(1).max(80),
    roadWidthMetres: z.number().finite().nonnegative().optional(),
  }),
]);

export const propertyLocationSchema = z
  .object({
    visibility: z.enum(["EXACT", "APPROXIMATE", "HIDDEN"]),
    privateLatitude: z.number().min(-90).max(90).nullable(),
    privateLongitude: z.number().min(-180).max(180).nullable(),
    publicLatitude: z.number().min(-90).max(90).nullable(),
    publicLongitude: z.number().min(-180).max(180).nullable(),
    publicAccuracyMetres: z.number().finite().nonnegative().nullable(),
  })
  .superRefine((location, context) => {
    if ((location.privateLatitude === null) !== (location.privateLongitude === null)) {
      context.addIssue({ code: "custom", message: "Private coordinates must be a complete pair." });
    }
    if ((location.publicLatitude === null) !== (location.publicLongitude === null)) {
      context.addIssue({ code: "custom", message: "Public coordinates must be a complete pair." });
    }
    if (
      location.visibility === "HIDDEN" &&
      (location.publicLatitude !== null || location.publicLongitude !== null)
    ) {
      context.addIssue({
        code: "custom",
        message: "Hidden locations cannot expose a public point.",
      });
    }
  });

export const mediaMetadataSchema = z.object({
  propertyId: uuid,
  mediaType: z.enum(["IMAGE", "VIDEO", "PANORAMA_360", "BROCHURE", "MAP_IMAGE", "OTHER"]),
  objectPath: z
    .string()
    .trim()
    .min(1)
    .max(1_024)
    .refine((path) => !path.startsWith("/") && !path.includes("..")),
  mimeType: z.string().trim().min(1).max(120),
  altText: optionalTrimmed(500),
  caption: optionalTrimmed(1_000),
  visibility: z.enum(["PUBLIC", "ADMIN_ONLY", "PRIVATE"]),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const verificationEditSchema = z.object({
  propertyId: uuid,
  checkDefinitionId: uuid,
  status: z.enum([
    "NOT_STARTED",
    "IN_REVIEW",
    "PASSED",
    "PASSED_WITH_NOTE",
    "FAILED",
    "REQUIRES_REVIEW",
    "EXPIRED",
  ]),
  scopeStatement: optionalTrimmed(5_000),
  publicVisible: z.boolean(),
  publicLabel: optionalTrimmed(180),
  publicExplanation: optionalTrimmed(2_000),
  reviewerNotesInternal: optionalTrimmed(10_000),
});

export const leadSchema = z
  .object({
    partyId: uuid,
    inquiryType: z.enum([
      "PROPERTY_INQUIRY",
      "PRICE_INQUIRY",
      "WHATSAPP_CLICK",
      "CALL_CLICK",
      "BUYER_REQUIREMENT",
      "SITE_VISIT_REQUEST",
      "GENERAL_CONTACT",
    ]),
    preferredTransaction: transactionTypeSchema.optional(),
    landCategory: landCategorySchema.optional(),
    budgetMinimum: z.number().finite().nonnegative().optional(),
    budgetMaximum: z.number().finite().nonnegative().optional(),
    districtId: uuid.optional(),
    intendedUse: optionalTrimmed(240),
  })
  .refine(
    (lead) =>
      lead.budgetMinimum === undefined ||
      lead.budgetMaximum === undefined ||
      lead.budgetMaximum >= lead.budgetMinimum,
    { message: "Maximum budget must be at least the minimum budget.", path: ["budgetMaximum"] },
  );

export const leadRequirementSchema = z
  .object({
    minimumArea: positiveDecimal.optional(),
    maximumArea: positiveDecimal.optional(),
    areaUnitId: uuid.optional(),
    preferredUse: optionalTrimmed(5_000),
  })
  .refine(
    (requirement) =>
      requirement.minimumArea === undefined ||
      requirement.maximumArea === undefined ||
      requirement.maximumArea >= requirement.minimumArea,
    { message: "Maximum area must be at least minimum area.", path: ["maximumArea"] },
  );

export const siteVisitSchema = z
  .object({
    ...publicContactIdentitySchema.shape,
    propertyId: uuid,
    requestedStartAt: z.iso.datetime(),
    requestedEndAt: z.iso.datetime(),
    message: optionalTrimmed(2_000),
    consent: z.literal(true),
  })
  .refine((visit) => Date.parse(visit.requestedEndAt) > Date.parse(visit.requestedStartAt), {
    message: "The requested end time must be after the start time.",
    path: ["requestedEndAt"],
  })
  .refine((visit) => Boolean(visit.email || visit.phone), {
    message: "Provide an email address or phone number.",
    path: ["email"],
  });

export const ownerSubmissionSchema = z
  .object({
    ...publicContactIdentitySchema.shape,
    landCategory: landCategorySchema,
    primaryTransactionType: transactionTypeSchema,
    districtId: uuid.optional(),
    localityText: optionalTrimmed(180),
    approximateAreaValue: positiveDecimal.optional(),
    approximateAreaUnitId: uuid.optional(),
    askingPriceText: optionalTrimmed(180),
    sourceDescription: optionalTrimmed(10_000),
    consent: z.literal(true),
  })
  .refine((submission) => Boolean(submission.email || submission.phone), {
    message: "Provide an email address or phone number.",
    path: ["email"],
  });

export const publicContactSchema = publicContactIdentitySchema
  .extend({
    message: z.string().trim().min(5).max(2_000),
    consent: z.literal(true),
    website: z.literal("").optional(),
  })
  .refine((contact) => Boolean(contact.email || contact.phone), {
    message: "Provide an email address or phone number.",
    path: ["email"],
  });

export const publicPropertyInquirySchema = publicContactIdentitySchema
  .extend({
    propertyId: uuid,
    inquiryType: z.enum(["PROPERTY_INQUIRY", "PRICE_INQUIRY"]),
    message: optionalTrimmed(2_000),
    consent: z.literal(true),
    website: z.literal("").optional(),
  })
  .refine((inquiry) => Boolean(inquiry.email || inquiry.phone), {
    message: "Provide an email address or phone number.",
    path: ["email"],
  });

export const buyerRequirementSubmissionSchema = publicContactIdentitySchema
  .extend({
    preferredTransaction: transactionTypeSchema,
    landCategory: landCategorySchema.optional(),
    districtId: uuid.optional(),
    budgetMinimum: z.number().finite().nonnegative().optional(),
    budgetMaximum: z.number().finite().nonnegative().optional(),
    minimumArea: positiveDecimal.optional(),
    maximumArea: positiveDecimal.optional(),
    areaUnitId: uuid.optional(),
    intendedUse: optionalTrimmed(240),
    consent: z.literal(true),
    website: z.literal("").optional(),
  })
  .superRefine((requirement, context) => {
    if (!requirement.email && !requirement.phone) {
      context.addIssue({ code: "custom", message: "Provide an email address or phone number." });
    }
    if (
      requirement.budgetMinimum !== undefined &&
      requirement.budgetMaximum !== undefined &&
      requirement.budgetMaximum < requirement.budgetMinimum
    ) {
      context.addIssue({
        code: "custom",
        message: "Maximum budget must be at least minimum budget.",
      });
    }
    if (
      requirement.minimumArea !== undefined &&
      requirement.maximumArea !== undefined &&
      requirement.maximumArea < requirement.minimumArea
    ) {
      context.addIssue({
        code: "custom",
        message: "Maximum area must be at least minimum area.",
      });
    }
  });
