"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  evidenceTypes,
  type VerificationFormState,
} from "@/features/verification/domain/contracts";
import { requireActiveAdmin } from "@/server/auth/authorization";
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
  revalidatePath("/admin/verification");
  revalidatePath("/admin/verification/queue");
  revalidatePath(`/admin/verification/${propertyId}`);
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath(`/admin/properties/${propertyId}/verification`);
}

function result(
  error?: unknown,
  message = "Verification workflow updated.",
): VerificationFormState {
  return error
    ? {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "The verification operation could not be completed.",
      }
    : { ok: true, message };
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
    return result(undefined, `${count} scoped check definitions added.`);
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
    await transitionVerification(uuid.parse(String(formData.get("verificationId") ?? "")), target, {
      scopeStatement: String(formData.get("scopeStatement") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      limitations: String(formData.get("limitations") ?? ""),
      recheckAt: String(formData.get("recheckAt") ?? ""),
      riskLevel: String(formData.get("riskLevel") ?? "NONE"),
      referralRequired: formData.get("referralRequired") === "on",
      referralType: String(formData.get("referralType") ?? ""),
      reason: `Admin requested scoped transition to ${target}`,
    });
    refresh(propertyId);
    return result(undefined, `Check moved to ${target.replaceAll("_", " ")}.`);
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
    const documentId = String(formData.get("privateDocumentId") ?? "");
    const sourceId = String(formData.get("sourceReferenceId") ?? "");
    await linkVerificationEvidence(uuid.parse(String(formData.get("verificationId") ?? "")), {
      ...(documentId ? { privateDocumentId: uuid.parse(documentId) } : {}),
      ...(sourceId ? { sourceReferenceId: uuid.parse(sourceId) } : {}),
      evidenceType: z.enum(evidenceTypes).parse(String(formData.get("evidenceType") ?? "")),
      sourceClass: sourceClass.parse(String(formData.get("sourceClass") ?? "")),
      evidenceReference: String(formData.get("evidenceReference") ?? ""),
      observedDate: String(formData.get("observedDate") ?? ""),
      supportsCheck: formData.get("supportsCheck") === "on",
      notes: String(formData.get("evidenceNotes") ?? ""),
    });
    refresh(propertyId);
    return result(undefined, "Evidence linked in received state; review is still required.");
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
    await advanceVerificationEvidence(
      uuid.parse(String(formData.get("evidenceId") ?? "")),
      state,
      professionalReviewId || undefined,
    );
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
