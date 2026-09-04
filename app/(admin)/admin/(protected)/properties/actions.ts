"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  adminPropertyDraftSchema,
  PropertyDraftConflictError,
  type AdminPropertyDraftInput,
} from "@/features/properties/domain/admin-property-draft";
import type { PropertyFormState } from "@/features/properties/domain/property-form-state";
import type { PublicationActionState } from "@/features/properties/domain/publication";
import { requireActiveAdmin } from "@/server/auth/authorization";
import {
  archivePropertyDraft,
  changePropertyAvailability,
  createPropertyDraft,
  restorePropertyDraft,
  updatePropertyDraft,
} from "@/server/services/property-drafts";
import { publishProperty, unpublishProperty } from "@/server/services/property-publication";
import type { AvailabilityStatus } from "@/types/database";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const databaseTimestamp = z.iso.datetime({ offset: true });
const optionalText = (formData: FormData, key: string) => text(formData, key) || undefined;
const numberOrUndefined = (formData: FormData, key: string) => {
  const value = text(formData, key);
  return value === "" ? undefined : Number(value);
};
const numberOrNull = (formData: FormData, key: string) => {
  const value = text(formData, key);
  return value === "" ? null : Number(value);
};
const checkedOrUndefined = (formData: FormData, key: string) =>
  formData.has(key) ? true : undefined;

function refreshPublicProperty(propertyId: string, slug?: string) {
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath("/sitemap.xml");
  revalidatePath("/properties/[property-slug]", "page");
  if (slug) revalidatePath(`/properties/${slug}`);
  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath(`/admin/properties/${propertyId}/preview`);
}

function retainedValues(formData: FormData): Record<string, string> {
  return Object.fromEntries(
    [...formData.entries()]
      .filter(([, value]) => typeof value === "string")
      .map(([key, value]) => [key, String(value)]),
  );
}

function parsePropertyDraftForm(formData: FormData): AdminPropertyDraftInput {
  const category = text(formData, "landCategory") as AdminPropertyDraftInput["landCategory"];
  const transaction = text(
    formData,
    "primaryTransactionType",
  ) as AdminPropertyDraftInput["primaryTransactionType"];
  const priceMode = text(formData, "priceMode");
  const offerBase = {
    transactionType: transaction,
    currencyCode: "INR" as const,
    negotiable: formData.has("negotiable"),
    commercialTerms: optionalText(formData, "commercialTerms"),
  };
  const offer =
    priceMode === "EXACT_TOTAL"
      ? { ...offerBase, priceMode, amount: numberOrUndefined(formData, "priceAmount") }
      : priceMode === "PRICE_RANGE"
        ? {
            ...offerBase,
            priceMode,
            minimum: numberOrUndefined(formData, "priceMinimum"),
            maximum: numberOrUndefined(formData, "priceMaximum"),
          }
        : priceMode === "PER_UNIT"
          ? {
              ...offerBase,
              priceMode,
              perUnit: numberOrUndefined(formData, "pricePerUnit"),
              unitId: optionalText(formData, "priceUnitId"),
            }
          : { ...offerBase, priceMode: "PRICE_ON_REQUEST" as const };

  const categoryDetails =
    category === "NA"
      ? {
          landCategory: category,
          naStatus: text(formData, "naStatus"),
          naPurpose: optionalText(formData, "naPurpose"),
          developmentPermissionStatus: optionalText(formData, "developmentPermissionStatus"),
          roadWidthMetres: numberOrUndefined(formData, "categoryRoadWidthMetres"),
          frontageMetres: numberOrUndefined(formData, "frontageMetres"),
          cornerPlot: checkedOrUndefined(formData, "cornerPlot"),
          restrictionSummary: optionalText(formData, "restrictionSummary"),
        }
      : category === "INDUSTRIAL"
        ? {
            landCategory: category,
            industrialSubtype: optionalText(formData, "industrialSubtype"),
            industrialAuthorityName: optionalText(formData, "industrialAuthorityName"),
            industrialTenure: optionalText(formData, "industrialTenure"),
            gidcPlotNumber: optionalText(formData, "gidcPlotNumber"),
            existingShedPresent: checkedOrUndefined(formData, "existingShedPresent"),
            roadWidthMetres: numberOrUndefined(formData, "categoryRoadWidthMetres"),
            powerStatus: optionalText(formData, "powerStatus"),
            connectivitySummary: optionalText(formData, "connectivitySummary"),
          }
        : {
            landCategory: "AGRICULTURAL" as const,
            tenureType: optionalText(formData, "tenureType"),
            irrigationStatus: optionalText(formData, "irrigationStatus"),
            roadTouch: checkedOrUndefined(formData, "roadTouch"),
            roadWidthMetres: numberOrUndefined(formData, "categoryRoadWidthMetres"),
            currentCultivationStatus: optionalText(formData, "currentCultivationStatus"),
          };

  const hasParcel = Boolean(
    optionalText(formData, "parcelLabel") || optionalText(formData, "identifierValue"),
  );
  const hasPlanning = Boolean(
    optionalText(formData, "reservationStatus") ||
    optionalText(formData, "planningPublicNotes") ||
    optionalText(formData, "planningInternalNotes"),
  );
  const partyId = optionalText(formData, "partyId");
  const removePartyLink = formData.has("removePartyLink");
  const sourceType = optionalText(formData, "sourceType");

  return adminPropertyDraftSchema.parse({
    landCategory: category,
    primaryTransactionType: transaction,
    listingTitle: optionalText(formData, "listingTitle"),
    shortDescription: optionalText(formData, "shortDescription"),
    description: optionalText(formData, "description"),
    districtId: text(formData, "districtId"),
    subdistrictId: optionalText(formData, "subdistrictId"),
    placeId: optionalText(formData, "placeId"),
    localityId: optionalText(formData, "localityId"),
    landmarkText: optionalText(formData, "landmarkText"),
    publicAddress: optionalText(formData, "publicAddress"),
    displayAreaValue: Number(text(formData, "displayAreaValue")),
    displayAreaUnitId: text(formData, "displayAreaUnitId"),
    publicSlug: optionalText(formData, "publicSlug"),
    location: {
      visibility: text(formData, "locationVisibility"),
      privateLatitude: numberOrNull(formData, "privateLatitude"),
      privateLongitude: numberOrNull(formData, "privateLongitude"),
      publicLatitude: numberOrNull(formData, "publicLatitude"),
      publicLongitude: numberOrNull(formData, "publicLongitude"),
      publicAccuracyMetres: numberOrNull(formData, "publicAccuracyMetres"),
      locationNotes: optionalText(formData, "locationNotes"),
    },
    offer,
    parcel: hasParcel
      ? {
          sequenceNo: 1,
          label: optionalText(formData, "parcelLabel"),
          areaValue: numberOrUndefined(formData, "parcelAreaValue"),
          areaUnitId: optionalText(formData, "parcelAreaUnitId"),
          identifierType: optionalText(formData, "identifierType"),
          identifierValue: optionalText(formData, "identifierValue"),
          identifierVisibility: text(formData, "identifierVisibility") || "ADMIN_ONLY",
          notesInternal: optionalText(formData, "parcelNotesInternal"),
        }
      : undefined,
    planning: hasPlanning
      ? {
          reservationStatus: optionalText(formData, "reservationStatus"),
          roadReservationStatus: optionalText(formData, "roadReservationStatus"),
          publicNotes: optionalText(formData, "planningPublicNotes"),
          internalNotes: optionalText(formData, "planningInternalNotes"),
        }
      : undefined,
    categoryDetails,
    partyLink: removePartyLink
      ? null
      : partyId
        ? {
            partyId,
            role: text(formData, "partyRole") || "OWNER",
            ownershipSharePercent: numberOrUndefined(formData, "ownershipSharePercent"),
            notesInternal: optionalText(formData, "partyNotesInternal"),
          }
        : undefined,
    sourceLink: sourceType
      ? {
          sourceType,
          sourceName: optionalText(formData, "sourceName"),
          sourceReference: optionalText(formData, "sourceReference"),
          notesInternal: optionalText(formData, "sourceNotesInternal"),
        }
      : undefined,
  });
}

function failureState(error: unknown, formData: FormData): PropertyFormState {
  if (error instanceof z.ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] = [...(errors[key] ?? []), issue.message];
    }
    return {
      ok: false,
      message: "Review the highlighted fields. Your other entries have been retained.",
      errors,
      values: retainedValues(formData),
    };
  }
  return {
    ok: false,
    message:
      error instanceof PropertyDraftConflictError
        ? error.message
        : "The draft could not be saved. Please review the form and try again.",
    errors: {},
    values: retainedValues(formData),
  };
}

export async function createPropertyDraftAction(
  _previous: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  await requireActiveAdmin();
  let propertyId: string;
  try {
    propertyId = await createPropertyDraft(parsePropertyDraftForm(formData));
  } catch (error) {
    return failureState(error, formData);
  }
  revalidatePath("/admin/properties");
  redirect(`/admin/properties/${propertyId}`);
}

export async function updatePropertyDraftAction(
  propertyId: string,
  expectedUpdatedAt: string,
  _previous: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  await requireActiveAdmin();
  try {
    await updatePropertyDraft(propertyId, expectedUpdatedAt, parsePropertyDraftForm(formData));
  } catch (error) {
    return failureState(error, formData);
  }
  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${propertyId}`);
  redirect(`/admin/properties/${propertyId}?saved=1`);
}

export async function changeAvailabilityAction(formData: FormData) {
  await requireActiveAdmin();
  const propertyId = z.uuid().parse(text(formData, "propertyId"));
  const expectedUpdatedAt = databaseTimestamp.parse(text(formData, "expectedUpdatedAt"));
  const next = z
    .enum(["AVAILABLE", "UNDER_NEGOTIATION", "SOLD", "RENTED", "LEASED", "OFF_MARKET"])
    .parse(text(formData, "nextStatus")) as AvailabilityStatus;
  await changePropertyAvailability(propertyId, expectedUpdatedAt, next);
  refreshPublicProperty(propertyId);
}

export async function publishPropertyAction(
  _previous: PublicationActionState,
  formData: FormData,
): Promise<PublicationActionState> {
  await requireActiveAdmin();
  try {
    if (text(formData, "confirmation") !== "PUBLISH")
      return { ok: false, message: "Confirm that the readiness report was reviewed." };
    const propertyId = z.uuid().parse(text(formData, "propertyId"));
    const expectedUpdatedAt = databaseTimestamp.parse(text(formData, "expectedUpdatedAt"));
    const readiness = await publishProperty(propertyId, expectedUpdatedAt);
    refreshPublicProperty(propertyId, readiness.publicSlug ?? undefined);
    return { ok: true, message: "Property published through the atomic readiness gate." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Publication could not be completed.",
    };
  }
}

export async function unpublishPropertyAction(
  _previous: PublicationActionState,
  formData: FormData,
): Promise<PublicationActionState> {
  await requireActiveAdmin();
  try {
    const propertyId = z.uuid().parse(text(formData, "propertyId"));
    const expectedUpdatedAt = databaseTimestamp.parse(text(formData, "expectedUpdatedAt"));
    const reason = z.string().trim().min(10).parse(text(formData, "reason"));
    const slug = optionalText(formData, "publicSlug");
    await unpublishProperty(propertyId, expectedUpdatedAt, reason);
    refreshPublicProperty(propertyId, slug);
    return { ok: true, message: "Property unpublished and removed from public projections." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unpublish could not be completed.",
    };
  }
}

export async function archivePropertyAction(formData: FormData) {
  await requireActiveAdmin();
  const propertyId = z.uuid().parse(text(formData, "propertyId"));
  const expectedUpdatedAt = databaseTimestamp.parse(text(formData, "expectedUpdatedAt"));
  await archivePropertyDraft(propertyId, expectedUpdatedAt);
  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${propertyId}`);
}

export async function restorePropertyAction(formData: FormData) {
  await requireActiveAdmin();
  const propertyId = z.uuid().parse(text(formData, "propertyId"));
  const expectedUpdatedAt = databaseTimestamp.parse(text(formData, "expectedUpdatedAt"));
  await restorePropertyDraft(propertyId, expectedUpdatedAt);
  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${propertyId}`);
}
