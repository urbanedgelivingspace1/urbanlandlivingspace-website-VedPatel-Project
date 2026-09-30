"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { indiaLocalDateTimeToUtc } from "@/features/site-visits/domain/workflow";
import {
  addOwnerSubmissionNote,
  assignOwnerSubmission,
  convertOwnerSubmission,
  transitionOwnerSubmission,
} from "@/server/services/owner-submissions";

const text = (data: FormData, name: string) => {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
};
const optional = (data: FormData, name: string) => text(data, name) || undefined;
const number = (data: FormData, name: string) =>
  optional(data, name) === undefined ? undefined : Number(text(data, name));
const destination = (id: string, key: "saved" | "error", message: string) =>
  `/admin/submissions/${id}?${key}=${encodeURIComponent(message)}`;

function safeError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("STALE"))
    return "This submission changed in another session. Refresh and try again.";
  if (message.includes("NOT_APPROVED")) return "Approve the submission before converting it.";
  if (message.includes("ALREADY_CONVERTED") || message.includes("duplicate"))
    return "This submission has already been converted.";
  if (message.includes("TRANSITION"))
    return "That status change is not allowed from the current state.";
  return "The operation was not saved. Check the required details and current status.";
}

export async function assignOwnerSubmissionAction(id: string, data: FormData) {
  try {
    await assignOwnerSubmission({
      submissionId: id,
      expectedVersion: Number(text(data, "expectedVersion")),
      assignedTo: optional(data, "assignedTo"),
    });
  } catch (error) {
    redirect(destination(id, "error", safeError(error)));
  }
  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${id}`);
  redirect(destination(id, "saved", "Review assignment updated."));
}

export async function transitionOwnerSubmissionAction(id: string, data: FormData) {
  try {
    await transitionOwnerSubmission({
      submissionId: id,
      expectedVersion: Number(text(data, "expectedVersion")),
      nextStatus: text(data, "nextStatus"),
      note: optional(data, "note"),
      nextActionAt: optional(data, "nextActionAt")
        ? indiaLocalDateTimeToUtc(text(data, "nextActionAt"))
        : undefined,
    });
  } catch (error) {
    redirect(destination(id, "error", safeError(error)));
  }
  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${id}`);
  redirect(destination(id, "saved", "Workflow status updated."));
}

export async function addOwnerSubmissionNoteAction(id: string, data: FormData) {
  try {
    await addOwnerSubmissionNote({
      submissionId: id,
      expectedVersion: Number(text(data, "expectedVersion")),
      note: text(data, "note"),
    });
  } catch (error) {
    redirect(destination(id, "error", safeError(error)));
  }
  revalidatePath(`/admin/submissions/${id}`);
  redirect(destination(id, "saved", "Private note added."));
}

export async function convertOwnerSubmissionAction(id: string, data: FormData) {
  let propertyId = "";
  try {
    const result = await convertOwnerSubmission({
      submissionId: id,
      expectedVersion: Number(text(data, "expectedVersion")),
      listingTitle: text(data, "listingTitle"),
      publicDescription: text(data, "publicDescription"),
      publicAddress: optional(data, "publicAddress"),
      locationVisibility: text(data, "locationVisibility"),
      priceMode: text(data, "priceMode"),
      priceAmount: number(data, "priceAmount"),
      pricePerUnit: number(data, "pricePerUnit"),
      priceUnitId: optional(data, "priceUnitId"),
      negotiable: data.get("negotiable") === "on",
    });
    propertyId = result.target_property_id;
  } catch (error) {
    redirect(`/admin/submissions/${id}/convert?error=${encodeURIComponent(safeError(error))}`);
  }
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/properties");
  redirect(
    `/admin/properties/${propertyId}?saved=${encodeURIComponent("Draft created from private owner submission. Verification remains pending and the property is not published.")}`,
  );
}
