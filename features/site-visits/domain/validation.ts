import { z } from "zod";

import { FOLLOW_UP_TYPES } from "@/features/crm/domain/contracts";
import { SITE_VISIT_STATUSES } from "./contracts";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

export const visitTransitionInputSchema = z
  .object({
    expectedVersion: z.number().int().positive(),
    nextStatus: z.enum(SITE_VISIT_STATUSES),
    contactOutcome: optionalText(240),
    startAt: z.iso.datetime({ offset: true }).optional(),
    endAt: z.iso.datetime({ offset: true }).optional(),
    timezone: z.literal("Asia/Kolkata").default("Asia/Kolkata"),
    meetingInstructions: optionalText(2000),
    reason: optionalText(500),
    outcome: optionalText(80),
    note: optionalText(5000),
  })
  .superRefine((value, context) => {
    if (value.nextStatus === "CONTACTED" && !value.contactOutcome)
      context.addIssue({
        code: "custom",
        path: ["contactOutcome"],
        message: "Contact outcome is required.",
      });
    if (["PROPOSED", "RESCHEDULED"].includes(value.nextStatus)) {
      if (!value.startAt || !value.endAt)
        context.addIssue({
          code: "custom",
          path: ["startAt"],
          message: "A complete visit slot is required.",
        });
      else if (Date.parse(value.endAt) <= Date.parse(value.startAt))
        context.addIssue({
          code: "custom",
          path: ["endAt"],
          message: "End time must follow start time.",
        });
    }
    if (["RESCHEDULED", "CANCELLED"].includes(value.nextStatus) && !value.reason)
      context.addIssue({ code: "custom", path: ["reason"], message: "A reason is required." });
    if (value.nextStatus === "COMPLETED" && !value.outcome)
      context.addIssue({
        code: "custom",
        path: ["outcome"],
        message: "A completion outcome is required.",
      });
  });

export const visitNoteInputSchema = z.object({
  expectedVersion: z.number().int().positive(),
  note: z.string().trim().min(1).max(5000),
});

export const visitFollowUpInputSchema = z.object({
  expectedVersion: z.number().int().positive(),
  dueAt: z.iso.datetime({ offset: true }),
  type: z.enum(FOLLOW_UP_TYPES),
  context: optionalText(160),
  note: optionalText(2000),
});
