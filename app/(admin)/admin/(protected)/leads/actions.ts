"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireActiveAdmin } from "@/server/auth/authorization";
import {
  createAdminLead,
  findLikelyDuplicateLeads,
  updateAdminLead,
  saveLeadRequirement,
  transitionLeadStatus,
  addLeadActivity,
  scheduleLeadFollowUp,
  completeLeadFollowUp,
  matchLeadToProperty,
  unmatchLeadFromProperty,
} from "@/server/services/crm";
import { createPrivilegedServerClient } from "@/server/supabase/privileged";
import type { LeadStatus } from "@/features/admin/contracts";
import type { LeadFormState } from "@/features/crm/domain/contracts";
import type { Database } from "@/types/database.generated";
import type { SupabaseClient } from "@supabase/supabase-js";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const optional = (form: FormData, key: string) => text(form, key) || undefined;
const number = (form: FormData, key: string) => {
  const value = optional(form, key);
  return value === undefined ? undefined : Number(value);
};
function leadInput(form: FormData) {
  return {
    name: text(form, "name"),
    phone: optional(form, "phone"),
    email: optional(form, "email"),
    sourceType: text(form, "sourceType") || "MANUAL",
    sourceDetail: optional(form, "sourceDetail"),
    inquiryType: text(form, "inquiryType") || "GENERAL_CONTACT",
    buyerType: optional(form, "buyerType"),
    preferredTransaction: optional(form, "preferredTransaction"),
    landCategory: optional(form, "landCategory"),
    budgetMin: number(form, "budgetMin"),
    budgetMax: number(form, "budgetMax"),
    districtId: optional(form, "districtId"),
    localityText: optional(form, "localityText"),
    intendedUse: optional(form, "intendedUse"),
    notesInternal: optional(form, "notesInternal"),
  };
}
function failure(error: unknown): LeadFormState {
  if (error instanceof z.ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] = [...(errors[key] ?? []), issue.message];
    }
    return { ok: false, message: "Review the highlighted fields.", errors };
  }
  return {
    ok: false,
    message: error instanceof Error ? error.message : "The CRM action could not be completed.",
  };
}

export async function createLeadAction(
  _state: LeadFormState,
  form: FormData,
): Promise<LeadFormState> {
  await requireActiveAdmin();
  let id: string;
  try {
    const input = leadInput(form);
    if (text(form, "confirmDuplicate") !== "yes") {
      const duplicates = await findLikelyDuplicateLeads(
        createPrivilegedServerClient() as unknown as SupabaseClient<Database>,
        { phone: input.phone, email: input.email },
      );
      if (duplicates.length)
        return {
          ok: false,
          message: `Possible existing contact with ${duplicates.length} lead${duplicates.length === 1 ? "" : "s"}. Review existing CRM records or confirm this is a new opportunity.`,
          duplicateCount: duplicates.length,
        };
    }
    id = await createAdminLead(input);
  } catch (error) {
    return failure(error);
  }
  revalidatePath("/admin/leads");
  redirect(`/admin/leads/${id}`);
}
export async function updateLeadAction(leadId: string, form: FormData) {
  await requireActiveAdmin();
  await updateAdminLead(leadId, leadInput(form));
  revalidatePath(`/admin/leads/${leadId}`);
  redirect(`/admin/leads/${leadId}?saved=lead`);
}
export async function saveRequirementAction(leadId: string, form: FormData) {
  await requireActiveAdmin();
  await saveLeadRequirement(leadId, {
    minAreaValue: number(form, "minAreaValue"),
    maxAreaValue: number(form, "maxAreaValue"),
    areaUnitId: optional(form, "areaUnitId"),
    preferredRoadWidthMMin: number(form, "preferredRoadWidthMMin"),
    preferredFrontageMMin: number(form, "preferredFrontageMMin"),
    notes: optional(form, "requirementNotes"),
  });
  revalidatePath(`/admin/leads/${leadId}`);
  redirect(`/admin/leads/${leadId}?saved=requirement`);
}
export async function transitionLeadAction(leadId: string, form: FormData) {
  await requireActiveAdmin();
  await transitionLeadStatus(leadId, {
    nextStatus: text(form, "nextStatus") as LeadStatus,
    reason: optional(form, "reason"),
  });
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  redirect(`/admin/leads/${leadId}?saved=stage`);
}
export async function addActivityAction(leadId: string, form: FormData) {
  await requireActiveAdmin();
  await addLeadActivity(leadId, {
    type: text(form, "activityType") as Database["public"]["Enums"]["lead_activity_type"],
    note: optional(form, "activityNote"),
  });
  revalidatePath(`/admin/leads/${leadId}`);
}
export async function scheduleFollowUpAction(leadId: string, form: FormData) {
  await requireActiveAdmin();
  const local = text(form, "dueAt");
  if (!local) throw new Error("Follow-up due date is required.");
  const dueAt = new Date(`${local}:00+05:30`);
  if (Number.isNaN(dueAt.getTime())) throw new Error("Follow-up due date is invalid.");
  await scheduleLeadFollowUp(leadId, {
    dueAt: dueAt.toISOString(),
    type: text(form, "followUpType") as "CALL",
    context: optional(form, "followUpContext"),
    note: optional(form, "followUpNote"),
  });
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/follow-ups");
  redirect(`/admin/leads/${leadId}?saved=follow-up`);
}
export async function completeFollowUpAction(leadId: string, form: FormData) {
  await requireActiveAdmin();
  await completeLeadFollowUp(text(form, "followUpId"), optional(form, "outcome"));
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/follow-ups");
}
export async function matchPropertyAction(leadId: string, form: FormData) {
  await requireActiveAdmin();
  await matchLeadToProperty(
    leadId,
    text(form, "propertyId"),
    text(form, "matchStatus") || "ACTIVE",
    optional(form, "matchNotes"),
  );
  revalidatePath(`/admin/leads/${leadId}`);
}
export async function unmatchPropertyAction(leadId: string, form: FormData) {
  await requireActiveAdmin();
  await unmatchLeadFromProperty(leadId, text(form, "propertyId"), optional(form, "reason"));
  revalidatePath(`/admin/leads/${leadId}`);
}
