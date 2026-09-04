import { describe, expect, it } from "vitest";

import {
  assertSafePublicVerificationCopy,
  formatScopeAndLimitation,
  isDefinitionApplicable,
  isEvidenceEligible,
  publicStatusFor,
  resolveVerificationPlan,
} from "@/features/verification/domain/verification-policy";

const common = {
  code: "PROPERTY_IDENTITY_REVIEWED",
  categoryScope: null,
  transactionScope: null,
  lawyerRequired: false,
  surveyorRequired: false,
  defaultRequired: true,
} as const;

describe("scoped verification policy", () => {
  it("resolves category and transaction applicability without treating N/A as a result", () => {
    expect(
      isDefinitionApplicable(
        { ...common, code: "GIDC_RECORDS_REVIEWED", categoryScope: "INDUSTRIAL" },
        { category: "NA", transactionType: "BUY" },
      ),
    ).toBe(false);
    expect(
      isDefinitionApplicable(
        { ...common, code: "LEASE_REVIEW", transactionScope: "LEASE" },
        { category: "INDUSTRIAL", transactionType: "LEASE" },
      ),
    ).toBe(true);
  });

  it.each([
    ["AGRICULTURAL", "REVENUE_RECORDS_REVIEWED"],
    ["NA", "NA_ORDER_REVIEWED"],
    ["INDUSTRIAL", "GIDC_RECORDS_REVIEWED"],
  ] as const)("selects the %s category workflow", (category, selectedCode) => {
    const plan = resolveVerificationPlan(
      [
        common,
        { ...common, code: "REVENUE_RECORDS_REVIEWED", categoryScope: "AGRICULTURAL" },
        { ...common, code: "NA_ORDER_REVIEWED", categoryScope: "NA" },
        {
          ...common,
          code: "GIDC_RECORDS_REVIEWED",
          categoryScope: "INDUSTRIAL",
          lawyerRequired: true,
        },
      ],
      { category, transactionType: "BUY" },
    );
    expect(plan.requiredChecks).toEqual(["PROPERTY_IDENTITY_REVIEWED", selectedCode]);
    expect(plan.requiredChecks).not.toContain(
      category === "NA" ? "GIDC_RECORDS_REVIEWED" : "NA_ORDER_REVIEWED",
    );
  });

  it("keeps upload, review, source verification, and professional review distinct", () => {
    expect(
      isEvidenceEligible({
        provenance: "RECEIVED",
        requiredProvenance: "REVIEWED",
        archived: false,
        scanStatus: "CLEAN",
      }),
    ).toBe(false);
    expect(
      isEvidenceEligible({
        provenance: "REVIEWED",
        requiredProvenance: "REVIEWED",
        archived: false,
        scanStatus: "PENDING",
      }),
    ).toBe(false);
    expect(
      isEvidenceEligible({
        provenance: "SOURCE_VERIFIED",
        requiredProvenance: "REVIEWED",
        archived: false,
        scanStatus: "CLEAN",
      }),
    ).toBe(true);
    expect(
      isEvidenceEligible({
        provenance: "SUPERSEDED",
        requiredProvenance: "RECEIVED",
        archived: false,
      }),
    ).toBe(false);
  });

  it("maps internal result states to scoped public vocabulary without a generic verified state", () => {
    expect(publicStatusFor("PASSED")).toBe("COMPLETED");
    expect(publicStatusFor("PASSED_WITH_NOTE")).toBe("COMPLETED_WITH_NOTE");
    expect(publicStatusFor("EXPIRED")).toBe("STALE");
    expect(publicStatusFor("FAILED")).toBe("REQUIRES_REVIEW");
    expect(publicStatusFor("NOT_STARTED")).toBe("NOT_REVIEWED");
  });

  it("builds a scoped public summary only when scope and limitation are explicit", () => {
    const summary = assertSafePublicVerificationCopy({
      label: "Revenue records reviewed",
      explanation: "The named revenue records were compared for the recorded parcel and date.",
      scope: "VF-7 and VF-8A references for the named parcel as observed on 4 September 2026.",
      limitation: "This does not establish title, boundaries, or transaction permission.",
      sourceClass: "OFFICIAL_ADMINISTRATIVE_PRACTICE",
    });
    expect(summary.label).toBe("Revenue records reviewed");
    expect(formatScopeAndLimitation(summary.scope, summary.limitation)).toContain("Limitation:");
  });

  it.each([
    "Clear Title",
    "Legally Verified",
    "Government Approved",
    "Fully Verified",
    "Dispute Free",
    "Guaranteed NA",
    "Guaranteed Construction",
    "Risk Free",
    "No Legal Issues",
  ])("blocks unsafe public claim %s", (label) => {
    expect(() =>
      assertSafePublicVerificationCopy({
        label,
        explanation: "Unsafe synthetic claim.",
        scope: "A sufficiently specific synthetic test scope for this public item.",
        limitation: "A sufficiently explicit synthetic limitation.",
        sourceClass: "URBANEDGE_OPERATIONAL_POLICY",
      }),
    ).toThrow(/Unsafe public verification claim/);
  });
});
