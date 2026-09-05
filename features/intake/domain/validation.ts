import { z } from "zod";

import { normalizeEmail } from "@/features/crm/domain/validation";

import {
  PUBLIC_INTAKE_ACTIONS,
  PUBLIC_PRIVACY_NOTICE_VERSION,
  REQUIREMENT_SOURCE_CONTEXTS,
} from "./contracts";

const uuid = z.uuid();
const optionalUuid = z
  .union([uuid, z.literal("")])
  .optional()
  .transform((v) => v || undefined);
const amount = z.number().finite().nonnegative().max(1_000_000_000_000_000);

export function isSafePlainText(value: string): boolean {
  const urlCount = value.match(/https?:\/\//gi)?.length ?? 0;
  return !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value) && urlCount <= 2;
}

const plainText = (minimum: number, maximum: number) =>
  z.string().trim().min(minimum).max(maximum).refine(isSafePlainText, "Use plain text only.");
const optionalPlainText = (maximum: number) =>
  z
    .union([plainText(1, maximum), z.literal("")])
    .optional()
    .transform((value) => value || undefined);

export function normalizeIndiaPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const national =
    digits.length === 10
      ? digits
      : digits.length === 12 && digits.startsWith("91")
        ? digits.slice(2)
        : "";
  if (!/^[6-9][0-9]{9}$/.test(national))
    throw new Error("Enter a valid 10-digit Indian mobile number.");
  return `+91${national}`;
}

const phone = z
  .string()
  .trim()
  .min(10)
  .max(20)
  .transform((value, context) => {
    try {
      return normalizeIndiaPhone(value);
    } catch {
      context.addIssue({ code: "custom", message: "Enter a valid 10-digit Indian mobile number." });
      return z.NEVER;
    }
  });
const optionalEmail = z
  .union([z.email().max(320), z.literal("")])
  .optional()
  .transform((value) => normalizeEmail(value || undefined));
const contact = {
  name: plainText(2, 160),
  phone,
  email: optionalEmail,
  consent: z.literal(true),
  privacyNoticeVersion: z.literal(PUBLIC_PRIVACY_NOTICE_VERSION),
  idempotencyKey: uuid,
  turnstileToken: z.string().max(2_048).optional(),
};

export const propertyInquiryInputSchema = z
  .object({
    action: z.literal("PROPERTY_INQUIRY"),
    ...contact,
    propertySlug: z
      .string()
      .trim()
      .min(1)
      .max(220)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    preferredContact: z.enum(["PHONE", "WHATSAPP", "EMAIL"]),
    message: optionalPlainText(2_000),
  })
  .superRefine((value, context) => {
    if (value.preferredContact === "EMAIL" && !value.email)
      context.addIssue({
        code: "custom",
        path: ["email"],
        message: "Enter an email address or choose another contact method.",
      });
  });

export const buyerRequirementInputSchema = z
  .object({
    action: z.literal("BUYER_REQUIREMENT"),
    ...contact,
    sourceContext: z.enum(REQUIREMENT_SOURCE_CONTEXTS),
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
    preferredTransaction: z.enum(["BUY", "RENT", "LEASE"]),
    landCategory: z.enum(["AGRICULTURAL", "NA", "INDUSTRIAL"]),
    districtId: optionalUuid,
    subdistrictId: optionalUuid,
    placeId: optionalUuid,
    localityText: optionalPlainText(180),
    budgetMinimum: amount.optional(),
    budgetMaximum: amount.optional(),
    minimumArea: z.number().finite().positive().max(1_000_000_000).optional(),
    maximumArea: z.number().finite().positive().max(1_000_000_000).optional(),
    areaUnitId: optionalUuid,
    intendedUse: optionalPlainText(240),
    timeline: optionalPlainText(120),
    message: optionalPlainText(2_000),
  })
  .superRefine((value, context) => {
    if (
      value.budgetMinimum !== undefined &&
      value.budgetMaximum !== undefined &&
      value.budgetMaximum < value.budgetMinimum
    )
      context.addIssue({
        code: "custom",
        path: ["budgetMaximum"],
        message: "Maximum budget must be at least the minimum.",
      });
    if (
      value.minimumArea !== undefined &&
      value.maximumArea !== undefined &&
      value.maximumArea < value.minimumArea
    )
      context.addIssue({
        code: "custom",
        path: ["maximumArea"],
        message: "Maximum area must be at least the minimum.",
      });
    if ((value.minimumArea !== undefined || value.maximumArea !== undefined) && !value.areaUnitId)
      context.addIssue({ code: "custom", path: ["areaUnitId"], message: "Choose an area unit." });
  });

export const siteVisitRequestInputSchema = z
  .object({
    action: z.literal("SITE_VISIT_REQUEST"),
    ...contact,
    propertySlug: z
      .string()
      .trim()
      .min(1)
      .max(220)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    requestedStartAt: z.iso.datetime({ offset: true }),
    requestedEndAt: z.iso.datetime({ offset: true }),
    alternateTime: optionalPlainText(160),
    message: optionalPlainText(2_000),
  })
  .refine((value) => Date.parse(value.requestedEndAt) > Date.parse(value.requestedStartAt), {
    path: ["requestedEndAt"],
    message: "Choose a valid visit window.",
  })
  .refine((value) => Date.parse(value.requestedStartAt) > Date.now(), {
    path: ["requestedStartAt"],
    message: "Choose a future visit date.",
  });

export const generalContactInputSchema = z.object({
  action: z.literal("GENERAL_CONTACT"),
  ...contact,
  intendedUse: plainText(2, 120),
  message: plainText(5, 2_000),
});

export const publicIntakeInputSchema = z.discriminatedUnion("action", [
  propertyInquiryInputSchema,
  buyerRequirementInputSchema,
  siteVisitRequestInputSchema,
  generalContactInputSchema,
]);
export type PublicIntakeInput = z.infer<typeof publicIntakeInputSchema>;

export function visitWindowToUtc(date: string, window: string) {
  const windows: Record<string, readonly [string, string]> = {
    MORNING: ["09:00", "12:00"],
    AFTERNOON: ["12:00", "15:00"],
    EVENING: ["15:00", "18:00"],
  };
  const selected = windows[window];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !selected)
    throw new Error("Choose a valid visit window.");
  return {
    requestedStartAt: new Date(`${date}T${selected[0]}:00+05:30`).toISOString(),
    requestedEndAt: new Date(`${date}T${selected[1]}:00+05:30`).toISOString(),
  };
}

export function publicIntakeAction(value: unknown) {
  return z.enum(PUBLIC_INTAKE_ACTIONS).parse(value);
}
