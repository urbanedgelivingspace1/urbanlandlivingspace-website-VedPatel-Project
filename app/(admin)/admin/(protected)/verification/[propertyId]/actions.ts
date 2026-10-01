"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import {
  evidenceTypes,
  type VerificationFormState,
} from "@/features/verification/domain/contracts";
import { formatTeachingError } from "@/features/verification/domain/guided-verification-config";
import { requireActiveAdmin } from "@/server/auth/authorization";
import { uploadPrivatePropertyDocument } from "@/server/services/property-media";
import {
  advanceVerificationEvidence,
  createVerificationSourceReference,
  initializePropertyVerifications,
  linkVerificationEvidence,
  recordVerificationException,
  requestProfessionalVerificationReview,
  resolveVerificationException,
  retireVerificationEvidence,
  setVerificationApplicability,
  transitionVerification,
  updateProfessionalVerificationReview,
} from "@/server/services/verifications";

const uuid = z.uuid();
const verificationStatus = z.enum([
  "NOT_STARTED",
  "IN_REVIEW",
  "PASSED",
  "PASSED_WITH_NOTE",
  "FAILED",
  "REQUIRES_REVIEW",
  "EXPIRED",
]);
const sourceClass = z.enum([
  "LEGAL_OFFICIAL_REQUIREMENT",
  "OFFICIAL_ADMINISTRATIVE_PRACTICE",
  "PROFESSIONAL_DUE_DILIGENCE",
  "URBANEDGE_OPERATIONAL_POLICY",
]);

function refresh(propertyId: string) {
  revalidateTag("public-properties", "max");
  revalidatePath("/admin/verification");
  revalidatePath("/admin/verification/queue");
  revalidatePath(`/admin/verification/${propertyId}`);
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath(`/admin/properties/${propertyId}/verification`);
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath("/properties/[property-slug]", "page");
  revalidatePath("/sitemap.xml");
}

function result(
  error?: unknown,
  message = "Verification workflow updated.",
): VerificationFormState {
  if (!error) return { ok: true, message };
  const rawMessage =
    error instanceof Error ? error.message : "The verification operation could not be completed.";
  return {
    ok: false,
    message: formatTeachingError(rawMessage),
  };
}

export async function initializeVerificationAction(
  propertyId: string,
  _previous: VerificationFormState,
): Promise<VerificationFormState> {
  await requireActiveAdmin();
  void _previous;
  try {
    const count = await initializePropertyVerifications(propertyId);
    refresh(propertyId);
    return result(undefined, `${count} check requirements initialized.`);
  } catch (error) {
    return result(error);
  }
}

export async function transitionVerificationAction(
  propertyId: string,
  _previous: VerificationFormState,
  formData: FormData,
): Promise<VerificationFormState> {
  await requireActiveAdmin();
  try {
    const target = verificationStatus.parse(String(formData.get("target") ?? ""));
    const verificationId = uuid.parse(String(formData.get("verificationId") ?? ""));
    const currentStatus = String(formData.get("currentStatus") ?? "");

    // If starting from NOT_STARTED and moving towards review outcomes (PASSED, etc.)
    if (currentStatus === "NOT_STARTED" && target !== "IN_REVIEW") {
      await transitionVerification(verificationId, "IN_REVIEW", {
        scopeStatement: String(formData.get("scopeStatement") ?? ""),
        notes: String(formData.get("notes") ?? ""),
        limitations: String(formData.get("limitations") ?? ""),
        riskLevel: String(formData.get("riskLevel") ?? "NONE"),
        reason: "Admin started review",
      });
    }

    await transitionVerification(verificationId, target, {
      scopeStatement: String(formData.get("scopeStatement") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      limitations: String(formData.get("limitations") ?? ""),
      recheckAt: String(formData.get("recheckAt") ?? ""),
      riskLevel: String(formData.get("riskLevel") ?? "NONE"),
      referralRequired: formData.get("referralRequired") === "on",
      referralType: String(formData.get("referralType") ?? ""),
      reason: `Admin recorded review outcome: ${target}`,
    });
    refresh(propertyId);
    return result(
      undefined,
      target === "PASSED" || target === "PASSED_WITH_NOTE"
        ? "Check completed successfully."
        : `Review updated (${target.replaceAll("_", " ").toLowerCase()}).`,
    );
  } catch (error) {
    return result(error);
  }
}

export async function linkEvidenceAction(
  propertyId: string,
  _previous: VerificationFormState,
  formData: FormData,
): Promise<VerificationFormState> {
  await requireActiveAdmin();
  try {
    const verificationId = uuid.parse(String(formData.get("verificationId") ?? ""));
    const documentId = String(formData.get("privateDocumentId") ?? "");
    const sourceId = String(formData.get("sourceReferenceId") ?? "");
    const evidenceTypeStr = String(formData.get("evidenceType") ?? "OFFICIAL_RECORD");
    const sourceClassStr = String(
      formData.get("sourceClass") ?? "OFFICIAL_ADMINISTRATIVE_PRACTICE",
    );
    const advanceTo = String(formData.get("advanceTo") ?? "");

    const newEvidenceId = await linkVerificationEvidence(verificationId, {
      ...(documentId ? { privateDocumentId: uuid.parse(documentId) } : {}),
      ...(sourceId ? { sourceReferenceId: uuid.parse(sourceId) } : {}),
      evidenceType: z.enum(evidenceTypes).parse(evidenceTypeStr),
      sourceClass: sourceClass.parse(sourceClassStr),
      evidenceReference: String(formData.get("evidenceReference") ?? ""),
      observedDate: String(formData.get("observedDate") ?? ""),
      supportsCheck: formData.get("supportsCheck") !== "off",
      notes: String(formData.get("evidenceNotes") ?? ""),
    });

    if (advanceTo && newEvidenceId && ["REVIEWED", "SOURCE_VERIFIED"].includes(advanceTo)) {
      if (advanceTo === "SOURCE_VERIFIED") {
        await advanceVerificationEvidence(String(newEvidenceId), "REVIEWED");
        await advanceVerificationEvidence(String(newEvidenceId), "SOURCE_VERIFIED");
      } else {
        await advanceVerificationEvidence(String(newEvidenceId), "REVIEWED");
      }
    }

    refresh(propertyId);
    return result(
      undefined,
      advanceTo === "SOURCE_VERIFIED"
        ? "Document linked and verified against official source."
        : advanceTo === "REVIEWED"
          ? "Document linked and marked as reviewed."
          : "Supporting document linked.",
    );
  } catch (error) {
    return result(error);
  }
}

export async function uploadVerificationDocumentAction(
  propertyId: string,
  _previous: VerificationFormState,
  formData: FormData,
): Promise<VerificationFormState> {
  await requireActiveAdmin();
  try {
    const documentType = String(formData.get("documentType") ?? "VERIFICATION_EVIDENCE");
    const file = formData.get("file");
    if (!file || !(file instanceof File) || file.size === 0) {
      return result(new Error("Choose a file to upload (PDF, JPEG, PNG)."));
    }
    await uploadPrivatePropertyDocument(propertyId, documentType, file);
    refresh(propertyId);
    return result(undefined, "Private document uploaded and scanned clean.");
  } catch (error) {
    return result(error);
  }
}

export async function advanceEvidenceAction(
  propertyId: string,
  _previous: VerificationFormState,
  formData: FormData,
): Promise<VerificationFormState> {
  await requireActiveAdmin();
  try {
    const state = z
      .enum(["REVIEWED", "SOURCE_VERIFIED", "PROFESSIONALLY_REVIEWED"])
      .parse(String(formData.get("state") ?? ""));
    const professionalReviewId = String(formData.get("professionalReviewId") ?? "");
    const evidenceId = uuid.parse(String(formData.get("evidenceId") ?? ""));

    if (state === "SOURCE_VERIFIED") {
      try {
        await advanceVerificationEvidence(evidenceId, "REVIEWED");
      } catch {
        // If already in REVIEWED state, ignore and advance directly to SOURCE_VERIFIED
      }
    }

    await advanceVerificationEvidence(evidenceId, state, professionalReviewId || undefined);
    refresh(propertyId);
    return result(undefined, `Evidence advanced to ${state.replaceAll("_", " ")}.`);
  } catch (error) {
    return result(error);
  }
}

export async function applicabilityAction(
  propertyId: string,
  _previous: VerificationFormState,
  formData: FormData,
): Promise<VerificationFormState> {
  await requireActiveAdmin();
  try {
    await setVerificationApplicability(
      uuid.parse(String(formData.get("verificationId") ?? "")),
      z
        .enum(["UNDETERMINED", "APPLICABLE", "NOT_APPLICABLE"])
        .parse(String(formData.get("applicability") ?? "")),
      String(formData.get("reason") ?? ""),
    );
    refresh(propertyId);
    return result(undefined, "Applicability recorded independently from check status.");
  } catch (error) {
    return result(error);
  }
}

export async function exceptionAction(
  propertyId: string,
  _previous: VerificationFormState,
  formData: FormData,
): Promise<VerificationFormState> {
  await requireActiveAdmin();
  try {
    await recordVerificationException(uuid.parse(String(formData.get("verificationId") ?? "")), {
      severity: String(formData.get("severity") ?? "MEDIUM"),
      summary: String(formData.get("summary") ?? ""),
      limitation: String(formData.get("limitation") ?? ""),
      blocksPublicDisclosure: formData.get("blocksPublicDisclosure") === "on",
      professionalReferralRequired: formData.get("professionalReferralRequired") === "on",
    });
    refresh(propertyId);
    return result(undefined, "Exception recorded and public disclosure disabled.");
  } catch (error) {
    return result(error);
  }
}

export async function professionalReviewAction(
  propertyId: string,
  _previous: VerificationFormState,
  formData: FormData,
): Promise<VerificationFormState> {
  await requireActiveAdmin();
  try {
    await requestProfessionalVerificationReview(
      uuid.parse(String(formData.get("verificationId") ?? "")),
      z
        .enum(["LAWYER", "SURVEYOR", "PLANNER", "ENGINEER", "OTHER"])
        .parse(String(formData.get("professionalType") ?? "")),
      String(formData.get("professionalScope") ?? ""),
    );
    refresh(propertyId);
    return result(undefined, "Scoped professional referral recorded.");
  } catch (error) {
    return result(error);
  }
}

export async function recordSourceAction(
  propertyId: string,
  _previous: VerificationFormState,
  formData: FormData,
): Promise<VerificationFormState> {
  await requireActiveAdmin();
  try {
    await createVerificationSourceReference({
      sourceClass: sourceClass.parse(String(formData.get("sourceClass") ?? "")),
      authorityName: String(formData.get("authorityName") ?? ""),
      sourceSystem: String(formData.get("sourceSystem") ?? ""),
      sourceName: String(formData.get("sourceName") ?? ""),
      officialUrl: String(formData.get("officialUrl") ?? ""),
      referenceNumber: String(formData.get("referenceNumber") ?? ""),
      recordIdentifier: String(formData.get("recordIdentifier") ?? ""),
      notes: String(formData.get("sourceNotes") ?? ""),
    });
    refresh(propertyId);
    return result(undefined, "Source reference recorded. Select it when linking evidence.");
  } catch (error) {
    return result(error);
  }
}

export async function retireEvidenceAction(
  propertyId: string,
  _previous: VerificationFormState,
  formData: FormData,
): Promise<VerificationFormState> {
  await requireActiveAdmin();
  try {
    await retireVerificationEvidence(
      uuid.parse(String(formData.get("evidenceId") ?? "")),
      "REVOKED",
      String(formData.get("reason") ?? ""),
    );
    refresh(propertyId);
    return result(undefined, "Evidence revoked; a prior passed result now requires review.");
  } catch (error) {
    return result(error);
  }
}

export async function resolveExceptionAction(
  propertyId: string,
  _previous: VerificationFormState,
  formData: FormData,
): Promise<VerificationFormState> {
  await requireActiveAdmin();
  try {
    await resolveVerificationException(
      uuid.parse(String(formData.get("exceptionId") ?? "")),
      z
        .enum(["RESOLVED", "ACCEPTED_LIMITATION"])
        .parse(String(formData.get("resolutionStatus") ?? "")),
      String(formData.get("resolution") ?? ""),
    );
    refresh(propertyId);
    return result(undefined, "Exception disposition recorded.");
  } catch (error) {
    return result(error);
  }
}

export async function updateProfessionalReviewAction(
  propertyId: string,
  _previous: VerificationFormState,
  formData: FormData,
): Promise<VerificationFormState> {
  await requireActiveAdmin();
  try {
    const target = z
      .enum([
        "MATERIALS_PENDING",
        "IN_REVIEW",
        "COMPLETED",
        "PARTIALLY_COMPLETED",
        "REQUIRES_MORE_INFORMATION",
        "SUPERSEDED",
        "REQUIRES_REVIEW",
      ])
      .parse(String(formData.get("professionalStatus") ?? ""));
    await updateProfessionalVerificationReview(
      uuid.parse(String(formData.get("professionalReviewId") ?? "")),
      target,
      {
        professionalName: String(formData.get("professionalName") ?? ""),
        professionalReference: String(formData.get("professionalReference") ?? ""),
        outcome: String(formData.get("professionalOutcome") ?? ""),
        limitations: String(formData.get("professionalLimitations") ?? ""),
        reviewDate: String(formData.get("professionalReviewDate") ?? ""),
      },
    );
    refresh(propertyId);
    return result(undefined, `Professional review moved to ${target.replaceAll("_", " ")}.`);
  } catch (error) {
    return result(error);
  }
}
