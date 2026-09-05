"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { indiaLocalDateTimeToUtc } from "@/features/site-visits/domain/workflow";
import {
  addSiteVisitNote,
  scheduleSiteVisitFollowUp,
  transitionSiteVisit,
} from "@/server/services/site-visits";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function safeError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("STALE_SITE_VISIT"))
    return "This visit changed in another session. Review the latest details and try again.";
  if (message.includes("PROPERTY_NOT_VISITABLE"))
    return "The property is no longer eligible for a new proposal or confirmation.";
  if (message.includes("TRANSITION_NOT_ALLOWED"))
    return "That visit transition is not allowed from the current state.";
  if (message.includes("FOLLOW_UP_REQUIRES"))
    return "Record a completed, cancelled, or no-show outcome before scheduling this follow-up.";
  if (message.includes("duplicate key") || message.includes("lead_follow_ups_one_open"))
    return "This lead already has an open follow-up. Complete it before adding another.";
  return "The visit update was not saved. Check the required fields and current state.";
}

function destination(visitId: string, key: "saved" | "error", message: string) {
  return `/admin/site-visits/${visitId}?${key}=${encodeURIComponent(message)}`;
}

export async function transitionSiteVisitAction(visitId: string, formData: FormData) {
  const startLocal = text(formData, "startAt");
  const endLocal = text(formData, "endAt");
  try {
    await transitionSiteVisit(visitId, {
      expectedVersion: Number(text(formData, "expectedVersion")),
      nextStatus: text(formData, "nextStatus"),
      contactOutcome: text(formData, "contactOutcome") || undefined,
      startAt: startLocal ? indiaLocalDateTimeToUtc(startLocal) : undefined,
      endAt: endLocal ? indiaLocalDateTimeToUtc(endLocal) : undefined,
      timezone: "Asia/Kolkata",
      meetingInstructions: text(formData, "meetingInstructions") || undefined,
      reason: text(formData, "reason") || undefined,
      outcome: text(formData, "outcome") || undefined,
      note: text(formData, "note") || undefined,
    });
  } catch (error) {
    redirect(destination(visitId, "error", safeError(error)));
  }
  revalidatePath("/admin/site-visits");
  revalidatePath(`/admin/site-visits/${visitId}`);
  revalidatePath("/admin/leads");
  redirect(destination(visitId, "saved", "Visit operation recorded."));
}

export async function addSiteVisitNoteAction(visitId: string, formData: FormData) {
  try {
    await addSiteVisitNote(visitId, {
      expectedVersion: Number(text(formData, "expectedVersion")),
      note: text(formData, "note"),
    });
  } catch (error) {
    redirect(destination(visitId, "error", safeError(error)));
  }
  revalidatePath(`/admin/site-visits/${visitId}`);
  redirect(destination(visitId, "saved", "Operational note added."));
}

export async function scheduleSiteVisitFollowUpAction(visitId: string, formData: FormData) {
  const dueAt = text(formData, "dueAt");
  try {
    await scheduleSiteVisitFollowUp(visitId, {
      expectedVersion: Number(text(formData, "expectedVersion")),
      dueAt: indiaLocalDateTimeToUtc(dueAt),
      type: text(formData, "type"),
      context: text(formData, "context") || undefined,
      note: text(formData, "note") || undefined,
    });
  } catch (error) {
    redirect(destination(visitId, "error", safeError(error)));
  }
  revalidatePath(`/admin/site-visits/${visitId}`);
  revalidatePath("/admin/follow-ups");
  redirect(destination(visitId, "saved", "CRM follow-up scheduled and linked."));
}
