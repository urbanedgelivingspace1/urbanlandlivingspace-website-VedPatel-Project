import { z } from "zod";

import { FOLLOW_UP_TYPES, LEAD_STATUSES, LOSS_REASONS } from "./contracts";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);
const optionalNumber = z.number().finite().nonnegative().optional();

export const adminLeadInputSchema = z
  .object({
    name: z.string().trim().min(2).max(180),
    phone: optionalText(40),
    email: z
      .union([z.email().max(320), z.literal(""), z.undefined()])
      .transform((v) => v || undefined),
    sourceType: z.string().trim().min(2).max(50),
    sourceDetail: optionalText(180),
    inquiryType: z.enum([
      "PROPERTY_INQUIRY",
      "PRICE_INQUIRY",
      "WHATSAPP_CLICK",
      "CALL_CLICK",
      "BUYER_REQUIREMENT",
      "SITE_VISIT_REQUEST",
      "GENERAL_CONTACT",
    ]),
    buyerType: z
      .enum([
        "INDIVIDUAL",
        "INVESTOR",
        "FARMER",
        "DEVELOPER",
        "BUILDER",
        "INDUSTRIAL_BUSINESS",
        "LOGISTICS_OPERATOR",
        "NRI",
        "BROKER",
        "OTHER",
      ])
      .optional(),
    preferredTransaction: z.enum(["BUY", "RENT", "LEASE"]).optional(),
    landCategory: z.enum(["AGRICULTURAL", "NA", "INDUSTRIAL"]).optional(),
    budgetMin: optionalNumber,
    budgetMax: optionalNumber,
    districtId: z.uuid().optional(),
    subdistrictId: z.uuid().optional(),
    placeId: z.uuid().optional(),
    localityText: optionalText(180),
    intendedUse: optionalText(240),
    notesInternal: optionalText(5000),
  })
  .superRefine((value, ctx) => {
    if (!value.phone && !value.email)
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Phone or email is required." });
    if (
      value.budgetMin !== undefined &&
      value.budgetMax !== undefined &&
      value.budgetMax < value.budgetMin
    )
      ctx.addIssue({
        code: "custom",
        path: ["budgetMax"],
        message: "Maximum budget must be at least the minimum.",
      });
  });

export const requirementInputSchema = z
  .object({
    minAreaValue: optionalNumber,
    maxAreaValue: optionalNumber,
    areaUnitId: z.uuid().optional(),
    normalizedMinAreaSqm: optionalNumber,
    normalizedMaxAreaSqm: optionalNumber,
    preferredRoadWidthMMin: optionalNumber,
    preferredFrontageMMin: optionalNumber,
    notes: optionalText(5000),
  })
  .superRefine((value, ctx) => {
    if (
      value.minAreaValue !== undefined &&
      value.maxAreaValue !== undefined &&
      value.maxAreaValue < value.minAreaValue
    )
      ctx.addIssue({
        code: "custom",
        path: ["maxAreaValue"],
        message: "Maximum area must be at least the minimum.",
      });
  });
export const transitionInputSchema = z
  .object({
    nextStatus: z.enum(
      LEAD_STATUSES as [(typeof LEAD_STATUSES)[number], ...(typeof LEAD_STATUSES)[number][]],
    ),
    reason: optionalText(240),
  })
  .superRefine((v, ctx) => {
    if (
      v.nextStatus === "CLOSED_LOST" &&
      (!v.reason || !LOSS_REASONS.includes(v.reason as (typeof LOSS_REASONS)[number]))
    )
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message: "Choose a structured loss reason.",
      });
    if (v.nextStatus === "CLOSED_WON" && !v.reason)
      ctx.addIssue({ code: "custom", path: ["reason"], message: "Record the won outcome." });
  });
export const followUpInputSchema = z.object({
  dueAt: z.iso.datetime({ offset: true }),
  type: z.enum(FOLLOW_UP_TYPES),
  context: optionalText(160),
  note: optionalText(2000),
});

export function normalizePhone(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  return digits.length === 10
    ? `+91${digits}`
    : digits.startsWith("91") && digits.length === 12
      ? `+${digits}`
      : `+${digits}`;
}
export function normalizeEmail(value: string | undefined) {
  return value?.trim().toLowerCase() || undefined;
}
