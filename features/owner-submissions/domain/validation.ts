import { z } from "zod";

import { isSafePlainText, normalizeIndiaPhone } from "@/features/intake/domain/validation";

import { OWNER_PRIVACY_NOTICE_VERSION } from "./contracts";

const plain = (min: number, max: number) =>
  z.string().trim().min(min).max(max).refine(isSafePlainText, "Use plain text only.");
const optionalPlain = (max: number) =>
  z
    .union([plain(1, max), z.literal("")])
    .optional()
    .transform((value) => value || undefined);
const optionalNumber = z.number().finite().nonnegative().max(1_000_000_000_000_000).optional();
const optionalUuid = z
  .union([z.uuid(), z.literal("")])
  .optional()
  .transform((value) => value || undefined);
const optionalHttpsUrl = z
  .union([
    z
      .url()
      .max(1_000)
      .refine((value) => {
        const url = new URL(value);
        return url.protocol === "https:" && !url.username && !url.password;
      }, "Use a secure HTTPS link without embedded credentials."),
    z.literal(""),
  ])
  .optional()
  .transform((v) => v || undefined);

export const ownerSubmissionInputSchema = z
  .object({
    action: z.literal("OWNER_LAND_SUBMISSION"),
    idempotencyKey: z.uuid(),
    turnstileToken: z.string().max(2_048).optional(),
    ownerIntent: z.enum(["SELL", "RENT", "LEASE"]),
    landCategory: z.enum(["AGRICULTURAL", "NA", "INDUSTRIAL"]),
    name: plain(2, 160),
    phone: z
      .string()
      .trim()
      .transform((value, context) => {
        try {
          return normalizeIndiaPhone(value);
        } catch {
          context.addIssue({
            code: "custom",
            message: "Enter a valid 10-digit Indian mobile number.",
          });
          return z.NEVER;
        }
      }),
    email: z
      .union([z.email().max(320), z.literal("")])
      .optional()
      .transform((v) => v || undefined),
    preferredContact: z.enum(["PHONE", "WHATSAPP", "EMAIL"]),
    ownerRelationship: z.enum([
      "OWNER",
      "CO_OWNER",
      "AUTHORIZED_REPRESENTATIVE",
      "BROKER_INTERMEDIARY",
      "OTHER",
    ]),
    districtId: z.uuid(),
    subdistrictId: optionalUuid,
    placeId: optionalUuid,
    talukaText: plain(2, 180),
    villageText: plain(2, 180),
    localityText: optionalPlain(180),
    broadAddress: optionalPlain(1_000),
    locationVisibilityPreference: z.enum(["EXACT", "APPROXIMATE", "HIDDEN"]),
    privateLatitude: z.number().finite().min(-90).max(90).optional(),
    privateLongitude: z.number().finite().min(-180).max(180).optional(),
    areaValue: z.number().finite().positive().max(1_000_000_000),
    areaUnitId: z.uuid(),
    priceMode: z.enum(["PRICE_ON_REQUEST", "EXACT_TOTAL", "PER_UNIT"]),
    askingPriceAmount: optionalNumber,
    askingPricePerUnit: optionalNumber,
    priceUnitId: optionalUuid,
    askingPriceText: optionalPlain(180),
    negotiable: z.boolean(),
    minimumAcceptablePrice: optionalNumber,
    sourceDescription: plain(10, 10_000),
    categoryClaims: z
      .record(z.string(), z.string().max(1_000))
      .refine((value) => Object.values(value).every(isSafePlainText), "Use plain text only."),
    mediaClaims: z.object({
      videoUrl: optionalHttpsUrl,
      droneUrl: optionalHttpsUrl,
      virtualTourUrl: optionalHttpsUrl,
    }),
    contactConsent: z.literal(true),
    informationDeclaration: z.literal(true),
    privacyConsent: z.literal(true),
    publicationReviewAcknowledgement: z.literal(true),
    documentCertificationAcknowledgement: z.literal(true),
    privacyNoticeVersion: z.literal(OWNER_PRIVACY_NOTICE_VERSION),
  })
  .superRefine((value, context) => {
    if (value.preferredContact === "EMAIL" && !value.email)
      context.addIssue({
        code: "custom",
        path: ["email"],
        message: "Email is required for email contact.",
      });
    if ((value.privateLatitude === undefined) !== (value.privateLongitude === undefined))
      context.addIssue({
        code: "custom",
        path: ["privateLatitude"],
        message: "Enter both map coordinates or leave both blank.",
      });
    if (value.priceMode === "EXACT_TOTAL" && value.askingPriceAmount === undefined)
      context.addIssue({
        code: "custom",
        path: ["askingPriceAmount"],
        message: "Enter the total asking price.",
      });
    if (
      value.priceMode === "PER_UNIT" &&
      (value.askingPricePerUnit === undefined || !value.priceUnitId)
    )
      context.addIssue({
        code: "custom",
        path: ["askingPricePerUnit"],
        message: "Enter a per-unit price and unit.",
      });
  });

export type OwnerSubmissionInput = z.infer<typeof ownerSubmissionInputSchema>;

export const ownerSubmissionTransitionSchema = z.object({
  submissionId: z.uuid(),
  expectedVersion: z.number().int().positive(),
  nextStatus: z.enum([
    "CONTACTED",
    "DOCS_REQUESTED",
    "UNDER_REVIEW",
    "VERIFICATION_PENDING",
    "APPROVED",
    "REJECTED",
    "ON_HOLD",
    "CLOSED",
  ]),
  note: optionalPlain(5_000),
  nextActionAt: z.iso.datetime({ offset: true }).optional(),
});

export const ownerSubmissionConversionSchema = z.object({
  submissionId: z.uuid(),
  expectedVersion: z.number().int().positive(),
  listingTitle: plain(5, 220),
  publicDescription: plain(10, 10_000),
  publicAddress: optionalPlain(1_000),
  locationVisibility: z.enum(["EXACT", "APPROXIMATE", "HIDDEN"]),
  priceMode: z.enum(["PRICE_ON_REQUEST", "EXACT_TOTAL", "PER_UNIT"]),
  priceAmount: optionalNumber,
  pricePerUnit: optionalNumber,
  priceUnitId: optionalUuid,
  negotiable: z.boolean(),
});
