import type { AdminVerificationCheck } from "./contracts";

/**
 * Deep verification is deliberately independent from marketing publication.
 * The database marketing-readiness function is authoritative and does not require
 * any verification check. This helper remains for the advanced diligence UI.
 */
export function isCheckRequiredForPublication(
  checkCode: string,
  category: "AGRICULTURAL" | "NA" | "INDUSTRIAL",
  propertyText?: string | null,
): boolean {
  void checkCode;
  void category;
  void propertyText;
  return false;
}

/**
 * Checks if a verification check's category scope matches the property's category.
 * Null category scope applies to all properties (common/cross-category checks).
 */
export function isCheckRelevantForCategory(
  categoryScope: "AGRICULTURAL" | "NA" | "INDUSTRIAL" | null | undefined,
  propertyCategory: "AGRICULTURAL" | "NA" | "INDUSTRIAL",
): boolean {
  if (!categoryScope) return true;
  return categoryScope === propertyCategory;
}

/**
 * Standard professional scope statement templates (> 20 characters)
 * to define the review instruction/scope without falsely claiming completed verification.
 */
export const CHECK_SCOPE_TEMPLATES: Record<string, string> = {
  PROPERTY_IDENTITY_REVIEWED:
    "Review parcel references and owner identity against title records and district revenue register.",
  REVENUE_RECORDS_REVIEWED:
    "Review current VF-7/12 and VF-8A revenue records and mutation entries for the stated survey parcel against AnyRoR.",
  LOCATION_REVIEWED:
    "Review property location correspondence against satellite mapping and recorded access corridors.",
  SITE_VISIT_COMPLETED:
    "Conduct physical site observation visit to record ground conditions and photographic evidence.",
  ACCESS_EVIDENCE_REVIEWED:
    "Review road frontage and access approach evidence from site observation and revenue survey maps.",
  REGISTRATION_RECORDS_REVIEWED:
    "Review Index-2 and registered deed records for the recorded parcel and relevant search period.",
  ENCUMBRANCE_SEARCH_REVIEWED:
    "Review official revenue and registry encumbrance search certificate for the 13-year period.",
  LITIGATION_SCREENING_REVIEWED:
    "Review district court and revenue tribunal registries for active disputes or pending claims.",
  LEGAL_REVIEW_COMPLETED:
    "Commission and review scoped legal title verification by a qualified advocate on record.",
  SURVEYOR_REVIEW_COMPLETED:
    "Review physical measurement and boundary correspondence report prepared by a licensed surveyor.",
  PLANNING_REVIEW_COMPLETED:
    "Review zoning and development plan reservation status with the local planning authority.",
  VF7_REVIEWED:
    "Review Village Form 7 tenure details, occupant rights, and encumbrance endorsements.",
  VF8A_REVIEWED:
    "Review Village Form 8-A khata account and registered agricultural landholder references.",
  VF6_MUTATION_REVIEWED:
    "Review Village Form 6 mutation history entries for the recorded parcel succession.",
  TENURE_RESTRICTION_REVIEWED:
    "Review tenure conditions (Old / New tenure) and applicable section 43/73AA transfer restrictions.",
  SURVEY_MAPNI_EVIDENCE_REVIEWED:
    "Review available survey/mapni records (DILR tipan) for parcel correspondence and recorded boundary context.",
  NA_ORDER_REVIEWED:
    "Review official Collector non-agricultural permission order and layout sanction conditions.",
  NA_PURPOSE_REVIEWED:
    "Review permitted NA use purpose (Residential / Commercial / Industrial) in the Collector order.",
  PLANNING_CHECK_REVIEWED:
    "Review local planning authority (AUDA/GUDA) DP/TP zoning status and road reservations.",
  TP_FP_OP_REVIEWED:
    "Review Town Planning scheme Original Plot (OP) and Final Plot (FP) allocation references.",
  DEVELOPMENT_PERMISSION_REVIEWED:
    "Review Rajachithi/development permission and approved building plan sanction status.",
  INDUSTRIAL_DESIGNATION_REVIEWED:
    "Review industrial estate designation and approved manufacturing/warehousing land use.",
  GIDC_RECORDS_REVIEWED:
    "Review GIDC allotment letter, plot boundary plan, and estate transfer guidelines.",
  GIDC_ALLOTMENT_REVIEWED:
    "Review original GIDC plot allotment order and terms of initial possession.",
  GIDC_LEASE_REVIEWED:
    "Review GIDC 99-year lease agreement and annual lease rent compliance status.",
  GIDC_TRANSFER_REVIEWED:
    "Review GIDC transfer permission / NOC requirements and transfer fee status.",
  GIDC_USE_COMPLIANCE_REVIEWED:
    "Review proposed industrial manufacturing activity against GIDC approved use categories.",
};

export type CategorizedVerificationChecks = {
  publicationGateChecks: AdminVerificationCheck[];
  diligenceChecks: AdminVerificationCheck[];
  nonApplicableChecks: AdminVerificationCheck[];
};

export function categorizeVerificationChecks(
  checks: readonly AdminVerificationCheck[],
  category: "AGRICULTURAL" | "NA" | "INDUSTRIAL",
  propertyText?: string | null,
): CategorizedVerificationChecks {
  const publicationGateChecks: AdminVerificationCheck[] = [];
  const diligenceChecks: AdminVerificationCheck[] = [];
  const nonApplicableChecks: AdminVerificationCheck[] = [];

  for (const check of checks) {
    const isRelevant = isCheckRelevantForCategory(check.definition.categoryScope, category);
    if (
      !isRelevant ||
      (check.definition.categoryScope && check.definition.categoryScope !== category)
    ) {
      nonApplicableChecks.push(check);
      continue;
    }

    if (isCheckRequiredForPublication(check.definition.code, category, propertyText)) {
      publicationGateChecks.push(check);
    } else {
      diligenceChecks.push(check);
    }
  }

  return {
    publicationGateChecks,
    diligenceChecks,
    nonApplicableChecks,
  };
}
