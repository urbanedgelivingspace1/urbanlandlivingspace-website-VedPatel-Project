import { describe, expect, it } from "vitest";
import {
  CHECK_SCOPE_TEMPLATES,
  categorizeVerificationChecks,
  isCheckRelevantForCategory,
  isCheckRequiredForPublication,
} from "@/features/verification/domain/publication-gate-rules";
import type { AdminVerificationCheck } from "@/features/verification/domain/contracts";

function mockCheck(
  code: string,
  categoryScope: "AGRICULTURAL" | "NA" | "INDUSTRIAL" | null,
  applicability: "APPLICABLE" | "NOT_APPLICABLE" = "APPLICABLE",
): AdminVerificationCheck {
  return {
    id: `id-${code}`,
    status: "NOT_STARTED",
    applicability,
    applicabilityReason: null,
    riskLevel: "MEDIUM",
    scope: null,
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
      id: `def-${code}`,
      code,
      name: `Check ${code}`,
      description: `Description of ${code}`,
      categoryScope,
      transactionScope: null,
      sourceClass: "OFFICIAL_ADMINISTRATIVE_PRACTICE",
      requiredEvidence: true,
      minimumProvenance: "REVIEWED",
      evidenceTypes: ["OFFICIAL_RECORD"],
      lawyerRequired: false,
      surveyorRequired: false,
      recheckDays: null,
      riskIfFailed: "HIGH",
    },
    evidence: [],
    exceptions: [],
    professionalReviews: [],
  };
}

describe("publication-gate-rules", () => {
  describe("isCheckRequiredForPublication", () => {
    it("treats every deep verification check as optional due diligence", () => {
      expect(isCheckRequiredForPublication("PROPERTY_IDENTITY_REVIEWED", "AGRICULTURAL")).toBe(
        false,
      );
      expect(isCheckRequiredForPublication("REVENUE_RECORDS_REVIEWED", "AGRICULTURAL")).toBe(false);
      expect(isCheckRequiredForPublication("NA_ORDER_REVIEWED", "NA")).toBe(false);
      expect(
        isCheckRequiredForPublication("GIDC_RECORDS_REVIEWED", "INDUSTRIAL", "Prime GIDC plot"),
      ).toBe(false);
      expect(isCheckRequiredForPublication("LOCATION_REVIEWED", "AGRICULTURAL")).toBe(false);
    });
  });

  describe("isCheckRelevantForCategory", () => {
    it("treats checks with null category scope as relevant for all categories", () => {
      expect(isCheckRelevantForCategory(null, "AGRICULTURAL")).toBe(true);
      expect(isCheckRelevantForCategory(null, "NA")).toBe(true);
      expect(isCheckRelevantForCategory(null, "INDUSTRIAL")).toBe(true);
    });

    it("filters checks scoped to other categories", () => {
      expect(isCheckRelevantForCategory("AGRICULTURAL", "AGRICULTURAL")).toBe(true);
      expect(isCheckRelevantForCategory("NA", "AGRICULTURAL")).toBe(false);
      expect(isCheckRelevantForCategory("INDUSTRIAL", "AGRICULTURAL")).toBe(false);
    });
  });

  describe("categorizeVerificationChecks", () => {
    it("places relevant checks in diligence and filters out irrelevant categories", () => {
      const checks = [
        mockCheck("PROPERTY_IDENTITY_REVIEWED", null), // Gate (Common)
        mockCheck("REVENUE_RECORDS_REVIEWED", "AGRICULTURAL"), // Gate for AG
        mockCheck("LOCATION_REVIEWED", null), // Diligence (Common)
        mockCheck("VF7_REVIEWED", "AGRICULTURAL"), // Diligence (AG)
        mockCheck("NA_ORDER_REVIEWED", "NA"), // Non-applicable for AG
        mockCheck("INDUSTRIAL_DESIGNATION_REVIEWED", "INDUSTRIAL"), // Non-applicable for AG
      ];

      // For AGRICULTURAL property
      const agResult = categorizeVerificationChecks(checks, "AGRICULTURAL");
      expect(agResult.publicationGateChecks).toEqual([]);
      expect(agResult.diligenceChecks.map((c) => c.definition.code)).toEqual([
        "PROPERTY_IDENTITY_REVIEWED",
        "REVENUE_RECORDS_REVIEWED",
        "LOCATION_REVIEWED",
        "VF7_REVIEWED",
      ]);
      // Irrelevant category checks are excluded from active workflows
      expect(agResult.nonApplicableChecks.map((c) => c.definition.code)).toEqual([
        "NA_ORDER_REVIEWED",
        "INDUSTRIAL_DESIGNATION_REVIEWED",
      ]);

      // For NA property
      const naResult = categorizeVerificationChecks(checks, "NA");
      expect(naResult.publicationGateChecks).toEqual([]);
      expect(naResult.diligenceChecks.map((c) => c.definition.code)).toEqual([
        "PROPERTY_IDENTITY_REVIEWED",
        "LOCATION_REVIEWED",
        "NA_ORDER_REVIEWED",
      ]);
      expect(naResult.nonApplicableChecks.map((c) => c.definition.code)).toEqual([
        "REVENUE_RECORDS_REVIEWED",
        "VF7_REVIEWED",
        "INDUSTRIAL_DESIGNATION_REVIEWED",
      ]);

      // For INDUSTRIAL property
      const indResult = categorizeVerificationChecks(checks, "INDUSTRIAL");
      expect(indResult.publicationGateChecks).toEqual([]);
      expect(indResult.diligenceChecks.map((c) => c.definition.code)).toEqual([
        "PROPERTY_IDENTITY_REVIEWED",
        "LOCATION_REVIEWED",
        "INDUSTRIAL_DESIGNATION_REVIEWED",
      ]);
      expect(indResult.nonApplicableChecks.map((c) => c.definition.code)).toEqual([
        "REVENUE_RECORDS_REVIEWED",
        "VF7_REVIEWED",
        "NA_ORDER_REVIEWED",
      ]);
    });
  });

  describe("CHECK_SCOPE_TEMPLATES", () => {
    it("contains robust, compliant templates exceeding 20 characters for key checks", () => {
      expect(CHECK_SCOPE_TEMPLATES.PROPERTY_IDENTITY_REVIEWED?.length).toBeGreaterThan(20);
      expect(CHECK_SCOPE_TEMPLATES.REVENUE_RECORDS_REVIEWED?.length).toBeGreaterThan(20);
      expect(CHECK_SCOPE_TEMPLATES.NA_ORDER_REVIEWED?.length).toBeGreaterThan(20);
      expect(CHECK_SCOPE_TEMPLATES.INDUSTRIAL_DESIGNATION_REVIEWED?.length).toBeGreaterThan(20);
    });

    it("ensures all templates use instructional phrasing rather than claiming completed verification", () => {
      for (const [code, template] of Object.entries(CHECK_SCOPE_TEMPLATES)) {
        expect(template.length, `${code} scope template must exceed 20 characters`).toBeGreaterThan(
          20,
        );
        // Must NOT begin with past-tense completed words
        expect(template).not.toMatch(/^(Verified|Completed|Examined|Passed|Approved)\b/i);
        // Must begin with prospective instruction verbs
        expect(template).toMatch(/^(Review|Conduct|Commission)\b/);
      }
    });
  });
});
