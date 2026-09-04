"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { MediaValidationError, type MediaFormState } from "@/features/media/domain/contracts";
import { requireActiveAdmin } from "@/server/auth/authorization";
import {
  addExternalPropertyMedia,
  approvePropertyMedia,
  archivePrivateDocument,
  archivePropertyMedia,
  reorderPropertyMedia,
  restorePropertyMedia,
  setPropertyCover,
  updatePropertyMediaMetadata,
  uploadPrivatePropertyDocument,
  uploadPropertyBrochure,
  uploadPropertyImage,
} from "@/server/services/property-media";

const initialFailure = (error: unknown): MediaFormState => ({
  ok: false,
  message:
    error instanceof MediaValidationError || error instanceof z.ZodError
      ? error.message
      : "The media operation could not be completed. Refresh and try again.",
});

const success = (message: string, duplicate = false): MediaFormState => ({
  ok: true,
  message,
  duplicate,
});

const fileFrom = (formData: FormData) => {
  const value = formData.get("file");
  if (!(value instanceof File) || value.size === 0) {
    throw new MediaValidationError("Choose a file to upload.");
  }
  return value;
};

function refresh(propertyId: string) {
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath(`/admin/properties/${propertyId}/media`);
  revalidatePath("/admin/media");
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath("/properties/[property-slug]", "page");
  revalidatePath("/sitemap.xml");
}

export async function uploadImageAction(
  propertyId: string,
  _previous: MediaFormState,
  formData: FormData,
): Promise<MediaFormState> {
  await requireActiveAdmin();
  try {
    const result = await uploadPropertyImage(propertyId, fileFrom(formData), {
      altText: String(formData.get("altText") ?? ""),
      caption: String(formData.get("caption") ?? ""),
    });
    refresh(propertyId);
    return success(
      result.duplicate
        ? "That exact image is already registered for this property."
        : "Image uploaded to private staging.",
      result.duplicate,
    );
  } catch (error) {
    return initialFailure(error);
  }
}

export async function uploadBrochureAction(
  propertyId: string,
  _previous: MediaFormState,
  formData: FormData,
): Promise<MediaFormState> {
  await requireActiveAdmin();
  try {
    const result = await uploadPropertyBrochure(propertyId, fileFrom(formData));
    refresh(propertyId);
    return success(
      result.duplicate
        ? "That brochure is already registered."
        : "Brochure uploaded to private staging.",
      result.duplicate,
    );
  } catch (error) {
    return initialFailure(error);
  }
}

export async function uploadPrivateDocumentAction(
  propertyId: string,
  _previous: MediaFormState,
  formData: FormData,
): Promise<MediaFormState> {
  await requireActiveAdmin();
  try {
    const type = z
      .enum(["OWNER_DOCUMENT", "LEGAL_DOCUMENT", "VERIFICATION_EVIDENCE"])
      .parse(String(formData.get("documentType") ?? ""));
    const result = await uploadPrivatePropertyDocument(propertyId, type, fileFrom(formData));
    refresh(propertyId);
    return success(
      result.duplicate
        ? "That private document is already registered for this purpose."
        : result.scanStatus === "CLEAN"
          ? "Private document uploaded and scanned clean."
          : "Private document uploaded; access remains blocked while scanning is pending.",
      result.duplicate,
    );
  } catch (error) {
    return initialFailure(error);
  }
}

export async function addExternalMediaAction(
  propertyId: string,
  _previous: MediaFormState,
  formData: FormData,
): Promise<MediaFormState> {
  await requireActiveAdmin();
  try {
    const kind = z
      .enum(["VIDEO", "DRONE_VIDEO", "PANORAMA_360"])
      .parse(String(formData.get("kind") ?? ""));
    const result = await addExternalPropertyMedia(
      propertyId,
      kind,
      String(formData.get("externalUrl") ?? ""),
      { caption: String(formData.get("caption") ?? "") },
    );
    refresh(propertyId);
    return success(
      result.duplicate
        ? "That external media is already registered."
        : "External media validated and added for review.",
      result.duplicate,
    );
  } catch (error) {
    return initialFailure(error);
  }
}

export async function updateMediaMetadataAction(formData: FormData) {
  await requireActiveAdmin();
  const propertyId = z.uuid().parse(String(formData.get("propertyId") ?? ""));
  await updatePropertyMediaMetadata(
    z.uuid().parse(String(formData.get("mediaId") ?? "")),
    String(formData.get("altText") ?? ""),
    String(formData.get("caption") ?? ""),
  );
  refresh(propertyId);
}

export async function reorderMediaAction(formData: FormData) {
  await requireActiveAdmin();
  const propertyId = z.uuid().parse(String(formData.get("propertyId") ?? ""));
  const mediaIds = String(formData.get("mediaIds") ?? "")
    .split(",")
    .filter(Boolean);
  await reorderPropertyMedia(propertyId, mediaIds);
  refresh(propertyId);
}

export async function setCoverAction(formData: FormData) {
  await requireActiveAdmin();
  const propertyId = z.uuid().parse(String(formData.get("propertyId") ?? ""));
  await setPropertyCover(propertyId, z.uuid().parse(String(formData.get("mediaId") ?? "")));
  refresh(propertyId);
}

export async function approveMediaAction(formData: FormData) {
  await requireActiveAdmin();
  const propertyId = z.uuid().parse(String(formData.get("propertyId") ?? ""));
  await approvePropertyMedia(z.uuid().parse(String(formData.get("mediaId") ?? "")));
  refresh(propertyId);
}

export async function archiveMediaAction(formData: FormData) {
  await requireActiveAdmin();
  const propertyId = z.uuid().parse(String(formData.get("propertyId") ?? ""));
  await archivePropertyMedia(z.uuid().parse(String(formData.get("mediaId") ?? "")));
  refresh(propertyId);
}

export async function restoreMediaAction(formData: FormData) {
  await requireActiveAdmin();
  const propertyId = z.uuid().parse(String(formData.get("propertyId") ?? ""));
  await restorePropertyMedia(z.uuid().parse(String(formData.get("mediaId") ?? "")));
  refresh(propertyId);
}

export async function archiveDocumentAction(formData: FormData) {
  await requireActiveAdmin();
  const propertyId = z.uuid().parse(String(formData.get("propertyId") ?? ""));
  await archivePrivateDocument(z.uuid().parse(String(formData.get("documentId") ?? "")));
  refresh(propertyId);
}
