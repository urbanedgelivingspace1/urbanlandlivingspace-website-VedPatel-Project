import "server-only";

import { z } from "zod";

import { isTrustedOrigin, requestPayloadIsBounded } from "@/features/intake/domain/abuse";
import {
  OWNER_PRIVACY_NOTICE_VERSION,
  OwnerSubmissionError,
  type OwnerAttachmentRole,
  type OwnerSubmissionFormState,
} from "@/features/owner-submissions/domain/contracts";
import { ownerSubmissionInputSchema } from "@/features/owner-submissions/domain/validation";
import { getServerEnvironment } from "@/server/env";
import { submitOwnerLand } from "@/server/services/owner-submissions";

const text = (data: FormData, name: string) => {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
};
const optional = (data: FormData, name: string) => text(data, name) || undefined;
const number = (data: FormData, name: string) => {
  const value = optional(data, name);
  return value === undefined ? undefined : Number(value);
};
const checked = (data: FormData, name: string) => data.get(name) === "on";

function claimValues(data: FormData) {
  const serialized = text(data, "categoryClaimsJson");
  if (serialized) {
    try {
      const parsed = JSON.parse(serialized) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
        return Object.fromEntries(
          Object.entries(parsed).filter(
            (entry): entry is [string, string] =>
              typeof entry[1] === "string" && entry[1].trim().length > 0,
          ),
        );
    } catch {
      return {};
    }
  }
  return Object.fromEntries(
    [
      "surveyReference",
      "blockReference",
      "tenureClaim",
      "waterIrrigation",
      "currentUse",
      "accessClaim",
      "naStatusClaim",
      "naPurpose",
      "roadWidthMetres",
      "frontageMetres",
      "industrialContext",
      "authorityName",
      "plotReference",
      "shedReference",
      "permittedUseClaim",
      "powerInfrastructure",
    ]
      .map((name) => [name, text(data, name)] as const)
      .filter(([, value]) => value),
  );
}

function files(data: FormData, name: string, role: OwnerAttachmentRole) {
  return data
    .getAll(name)
    .filter((value): value is File => typeof value !== "string" && value.size > 0)
    .map((file) => ({ file, role }));
}

function preservedValues(data: FormData): Readonly<Record<string, string>> {
  return Object.fromEntries(
    [...data.entries()].flatMap(([name, value]) =>
      typeof value === "string" &&
      !["website", "cf-turnstile-response", "idempotencyKey"].includes(name)
        ? [[name, value]]
        : [],
    ),
  );
}

function failure(error: unknown, data: FormData): OwnerSubmissionFormState {
  const values = preservedValues(data);
  if (error instanceof z.ZodError)
    return {
      status: "error",
      message:
        "Check the highlighted details. Your files remain selected only in this browser session.",
      errors: error.flatten().fieldErrors,
      values,
    };
  const code = error instanceof OwnerSubmissionError ? error.code : "SERVICE_UNAVAILABLE";
  const messages: Record<OwnerSubmissionError["code"], string> = {
    RATE_LIMITED:
      "Too many submissions were received from this connection. Please wait and try again.",
    BOT_REJECTED: "Please complete the anti-bot check and try again.",
    BOT_CONFIGURATION_REQUIRED: "This form is temporarily unavailable.",
    UNTRUSTED_ORIGIN: "This request could not be accepted.",
    INVALID_REQUEST: "Check the form and try again.",
    ATTACHMENT_INVALID: "A file is invalid. Use PDF, JPEG or PNG files only.",
    ATTACHMENT_UNSAFE: "A file did not pass the security scan and was not stored.",
    ATTACHMENT_LIMIT: "Attach at most 10 files with a combined size of 20 MB.",
    IDEMPOTENCY_CONFLICT: "This submission changed after it was sent. Refresh and try again.",
    STALE_RECORD: "The submission changed. Refresh and try again.",
    TRANSITION_NOT_ALLOWED: "That workflow change is not allowed.",
    NOT_APPROVED: "The submission must be approved before conversion.",
    ALREADY_CONVERTED: "This submission has already been converted.",
    SERVICE_UNAVAILABLE:
      "We could not securely save this submission right now. Please try again shortly.",
  };
  if (!(error instanceof OwnerSubmissionError))
    console.error("owner_submission_action_failed", { code: "UNEXPECTED_FAILURE" });
  return { status: "error", message: messages[code], values };
}

export async function processOwnerLandFormData(
  formData: FormData,
  requestHeaders: Headers,
): Promise<
  | Readonly<{ ok: true; submissionReference: string }>
  | Readonly<{ ok: false; state: OwnerSubmissionFormState }>
> {
  try {
    if (!requestPayloadIsBounded(formData, 21 * 1024 * 1024) || text(formData, "website"))
      throw new OwnerSubmissionError("INVALID_REQUEST");
    const environment = getServerEnvironment();
    const origin = requestHeaders.get("origin");
    if (
      !isTrustedOrigin(
        origin,
        environment.NEXT_PUBLIC_SITE_URL,
        requestHeaders.get("sec-fetch-site"),
      )
    )
      throw new OwnerSubmissionError("UNTRUSTED_ORIGIN");
    const input = ownerSubmissionInputSchema.parse({
      action: "OWNER_LAND_SUBMISSION",
      idempotencyKey: text(formData, "idempotencyKey"),
      turnstileToken: optional(formData, "cf-turnstile-response"),
      ownerIntent: text(formData, "ownerIntent"),
      landCategory: text(formData, "landCategory"),
      name: text(formData, "name"),
      phone: text(formData, "phone"),
      email: optional(formData, "email"),
      preferredContact: text(formData, "preferredContact"),
      ownerRelationship: text(formData, "ownerRelationship"),
      districtId: text(formData, "districtId"),
      subdistrictId: optional(formData, "subdistrictId"),
      placeId: optional(formData, "placeId"),
      talukaText: text(formData, "talukaText"),
      villageText: text(formData, "villageText"),
      localityText: optional(formData, "localityText"),
      broadAddress: optional(formData, "broadAddress"),
      locationVisibilityPreference: text(formData, "locationVisibilityPreference"),
      privateLatitude: number(formData, "privateLatitude"),
      privateLongitude: number(formData, "privateLongitude"),
      areaValue: number(formData, "areaValue"),
      areaUnitId: text(formData, "areaUnitId"),
      priceMode: text(formData, "priceMode"),
      askingPriceAmount: number(formData, "askingPriceAmount"),
      askingPricePerUnit: number(formData, "askingPricePerUnit"),
      priceUnitId: optional(formData, "priceUnitId"),
      askingPriceText: optional(formData, "askingPriceText"),
      negotiable: checked(formData, "negotiable"),
      minimumAcceptablePrice: number(formData, "minimumAcceptablePrice"),
      sourceDescription: text(formData, "sourceDescription"),
      categoryClaims: claimValues(formData),
      mediaClaims: {
        videoUrl: optional(formData, "videoUrl"),
        droneUrl: optional(formData, "droneUrl"),
        virtualTourUrl: optional(formData, "virtualTourUrl"),
      },
      contactConsent: checked(formData, "contactConsent"),
      informationDeclaration: checked(formData, "informationDeclaration"),
      privacyConsent: checked(formData, "privacyConsent"),
      publicationReviewAcknowledgement: checked(formData, "publicationReviewAcknowledgement"),
      documentCertificationAcknowledgement: checked(
        formData,
        "documentCertificationAcknowledgement",
      ),
      privacyNoticeVersion: OWNER_PRIVACY_NOTICE_VERSION,
    });
    const attachments = [
      ...files(formData, "photos", "OWNER_PHOTO"),
      ...files(formData, "brochure", "OWNER_BROCHURE"),
      ...files(formData, "documents", "SUPPORTING_DOCUMENT"),
    ];
    const result = await submitOwnerLand(input, attachments, {
      ipAddress:
        requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        requestHeaders.get("x-real-ip") ||
        "unknown",
      origin,
    });
    return { ok: true, submissionReference: result.submissionReference };
  } catch (error) {
    return { ok: false, state: failure(error, formData) };
  }
}
