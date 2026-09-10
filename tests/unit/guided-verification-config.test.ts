import { describe, expect, it } from "vitest";

import type { AdminVerificationCheck } from "@/features/verification/domain/contracts";
import {
  CHECK_GUIDANCE,
  formatApplicabilityLabel,
  formatEvidenceTypeLabel,
  formatProvenanceLabel,
  formatStatusLabel,
  formatTeachingError,
  getCheckGuidance,
  getCheckNextAction,
} from "@/features/verification/domain/guided-verification-config";

describe("guided-verification-config", () => {
  it("provides comprehensive guidance across check definitions", () => {
    expect(getCheckGuidance("PROPERTY_IDENTITY_REVIEWED").title).toBe("Property identity");
    expect(getCheckGuidance("REVENUE_RECORDS_REVIEWED").title).toBe("Revenue records");
    expect(getCheckGuidance("ENCUMBRANCE_SEARCH_REVIEWED").title).toBe("Encumbrance search");
    expect(getCheckGuidance("NA_ORDER_REVIEWED").title).toBe("NA conversion order");
    expect(getCheckGuidance("GIDC_RECORDS_REVIEWED").title).toBe("GIDC records");
    expect(CHECK_GUIDANCE["PROPERTY_IDENTITY_REVIEWED"]?.title).toBe("Property identity");

    // Falls back to default guidance gracefully for unknown code
    const fallback = getCheckGuidance("UNKNOWN_CHECK_CODE");
    expect(fallback.title).toBe("Property check");
    expect(fallback.checklist.length).toBeGreaterThan(0);
  });

  it("translates internal database enums into plain-language human labels", () => {
    expect(formatStatusLabel("NOT_STARTED")).toBe("Not started");
    expect(formatStatusLabel("IN_REVIEW")).toBe("In review");
    expect(formatStatusLabel("PASSED")).toBe("Complete");
    expect(formatStatusLabel("PASSED_WITH_NOTE")).toBe("Complete — note attached");
    expect(formatStatusLabel("FAILED")).toBe("Issue found");
    expect(formatStatusLabel("REQUIRES_REVIEW")).toBe("Needs review");
    expect(formatStatusLabel("EXPIRED")).toBe("Review expired");

    expect(formatProvenanceLabel("RECEIVED")).toBe("Document received");
    expect(formatProvenanceLabel("REVIEWED")).toBe("Document reviewed");
    expect(formatProvenanceLabel("SOURCE_VERIFIED")).toBe("Checked against official source");
    expect(formatProvenanceLabel("PROFESSIONALLY_REVIEWED")).toBe("Reviewed by a professional");

    expect(formatApplicabilityLabel("APPLICABLE")).toBe("Relevant for this property");
    expect(formatApplicabilityLabel("NOT_APPLICABLE")).toBe("Not relevant");

    expect(formatEvidenceTypeLabel("OWNER_DOCUMENT")).toBe("Owner-provided document");
    expect(formatEvidenceTypeLabel("OFFICIAL_RECORD")).toBe("Official land record");
  });

  it("calculates accurate single next-action guidance for incomplete checks", () => {
    const baseCheck: AdminVerificationCheck = {
      id: "check-1",
      status: "IN_REVIEW",
      applicability: "APPLICABLE",
      applicabilityReason: null,
      riskLevel: "HIGH",
      scope: "Review scope statement",
      limitations: null,
      reviewerNotes: null,
      reviewedAt: null,
      checkDate: null,
      recheckAt: null,
      referralRequired: false,
      referralType: null,
      publicVisible: false,
      publicDisclosureEligible: false,
      publicCopyApproved: false,
      definition: {
        id: "def-1",
        code: "REVENUE_RECORDS_REVIEWED",
        name: "Revenue records reviewed",
        description: "Verify records",
        categoryScope: "AGRICULTURAL",
        transactionScope: null,
        sourceClass: "OFFICIAL_ADMINISTRATIVE_PRACTICE",
        requiredEvidence: true,
        minimumProvenance: "SOURCE_VERIFIED",
        evidenceTypes: ["OFFICIAL_RECORD"],
        lawyerRequired: false,
        surveyorRequired: false,
        recheckDays: 90,
        riskIfFailed: "HIGH",
      },
      evidence: [],
      exceptions: [],
      professionalReviews: [],
    };

    // 1. Missing proof
    expect(getCheckNextAction(baseCheck, true).text).toBe("Next: Add a supporting document.");

    // 2. Proof received but not yet reviewed
    const checkWithReceived = {
      ...baseCheck,
      evidence: [
        {
          id: "ev-1",
          evidenceType: "OFFICIAL_RECORD",
          provenance: "RECEIVED" as const,
          sourceClass: "OFFICIAL_ADMINISTRATIVE_PRACTICE" as const,
          supportsCheck: true,
          reference: "7-12",
          observedDate: "2026-09-08",
          privateDocumentId: "doc-1",
          privateDocumentName: "7-12.pdf",
          scanStatus: "CLEAN" as const,
          sourceReferenceId: null,
          sourceName: null,
          createdAt: "2026-09-08",
        },
      ],
    };
    expect(getCheckNextAction(checkWithReceived, true).text).toBe("Next: Review the document.");

    // 3. Document reviewed but publication check requires source verification
    const checkWithReviewed = {
      ...baseCheck,
      evidence: [
        {
          ...checkWithReceived.evidence[0]!,
          provenance: "REVIEWED" as const,
        },
      ],
    };
    expect(getCheckNextAction(checkWithReviewed, true).text).toBe(
      "Next: Check this information against an official source.",
    );

    // 4. Evidence verified against official source -> prompt to record outcome
    const checkWithVerified = {
      ...baseCheck,
      evidence: [
        {
          ...checkWithReceived.evidence[0]!,
          provenance: "SOURCE_VERIFIED" as const,
        },
      ],
    };
    expect(getCheckNextAction(checkWithVerified, true).text).toBe("Next: Record what you found.");

    // 5. Open blocking exception -> prompt to resolve issue
    const checkWithIssue = {
      ...checkWithVerified,
      exceptions: [
        {
          id: "ex-1",
          severity: "MEDIUM" as const,
          summary: "Discrepancy in parcel area",
          limitation: "Area discrepancy",
          blocksPublicDisclosure: true,
          status: "OPEN" as const,
        },
      ],
    };
    expect(getCheckNextAction(checkWithIssue, true).text).toBe("Next: Resolve the recorded issue.");

    // 6. Passed check -> complete
    const checkPassed = {
      ...checkWithVerified,
      status: "PASSED" as const,
    };
    expect(getCheckNextAction(checkPassed, true).text).toBe("Complete.");
    expect(getCheckNextAction(checkPassed, true).isComplete).toBe(true);
  });

  it("formats server errors into teaching, actionable guidance", () => {
    expect(
      formatTeachingError("A specific verification scope of at least 20 characters is required"),
    ).toBe("Briefly describe what you checked before saving (minimum 20 characters).");

    expect(
      formatTeachingError("Current eligible evidence at the required provenance is required"),
    ).toBe(
      "You're almost done. This check requires confirmation against an official source before it can pass.",
    );

    expect(
      formatTeachingError("Resolve disclosure-blocking exceptions before passing this check"),
    ).toBe("Please resolve recorded issues before completing this check.");

    expect(formatTeachingError("Required scoped professional review is incomplete")).toBe(
      "A completed professional review is required before this check can pass.",
    );
  });
});
