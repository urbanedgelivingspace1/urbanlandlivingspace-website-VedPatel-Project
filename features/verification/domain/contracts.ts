import type { Database } from "@/types/database.generated";

export type VerificationStatus = Database["public"]["Enums"]["verification_status"];
export type VerificationApplicability = Database["public"]["Enums"]["verification_applicability"];
export type EvidenceProvenance = Database["public"]["Enums"]["evidence_provenance_state"];
export type VerificationSourceClass = Database["public"]["Enums"]["verification_source_class"];
export type ProfessionalReviewStatus = Database["public"]["Enums"]["professional_review_status"];

export const evidenceTypes = [
  "OWNER_DOCUMENT",
  "BROKER_DOCUMENT",
  "OFFICIAL_RECORD",
  "CERTIFIED_OFFICIAL_RECORD",
  "OFFICIAL_PORTAL_RESULT",
  "OFFICIAL_SEARCH_RESULT",
  "REGISTERED_INSTRUMENT",
  "AUTHORITY_ORDER",
  "AUTHORITY_LETTER",
  "COURT_OR_REVENUE_SEARCH",
  "SITE_OBSERVATION",
  "SURVEY_MAP",
  "MAPNI_RECORD",
  "PROFESSIONAL_REPORT",
  "PROFESSIONAL_OPINION",
  "PHOTOGRAPHIC_OBSERVATION",
  "OTHER_RECORDED_OBSERVATION",
] as const;
export type EvidenceType = (typeof evidenceTypes)[number];

export type VerificationFormState = Readonly<{ ok: boolean; message: string }>;

export type VerificationQueueItem = Readonly<{
  propertyId: string;
  propertyCode: string;
  title: string | null;
  category: "AGRICULTURAL" | "NA" | "INDUSTRIAL";
  transactionType: "BUY" | "RENT" | "LEASE";
  totalChecks: number;
  inReview: number;
  requiresReview: number;
  dueOrExpired: number;
  passed: number;
}>;

export type AdminVerificationDefinition = Readonly<{
  id: string;
  code: string;
  name: string;
  description: string | null;
  categoryScope: "AGRICULTURAL" | "NA" | "INDUSTRIAL" | null;
  transactionScope: "BUY" | "RENT" | "LEASE" | null;
  sourceClass: VerificationSourceClass;
  requiredEvidence: boolean;
  minimumProvenance: EvidenceProvenance;
  evidenceTypes: readonly string[];
  lawyerRequired: boolean;
  surveyorRequired: boolean;
  recheckDays: number | null;
  riskIfFailed: Database["public"]["Enums"]["risk_level"];
}>;

export type AdminVerificationEvidence = Readonly<{
  id: string;
  evidenceType: string;
  provenance: EvidenceProvenance;
  sourceClass: VerificationSourceClass;
  supportsCheck: boolean;
  reference: string | null;
  observedDate: string | null;
  privateDocumentId: string | null;
  privateDocumentName: string | null;
  scanStatus: Database["public"]["Enums"]["document_scan_status"] | null;
  sourceReferenceId: string | null;
  sourceName: string | null;
  createdAt: string;
}>;

export type AdminProfessionalReview = Readonly<{
  id: string;
  professionalType: string;
  status: ProfessionalReviewStatus;
  scope: string;
  professionalName: string | null;
  outcome: string | null;
  reviewDate: string | null;
}>;

export type AdminVerificationException = Readonly<{
  id: string;
  severity: Database["public"]["Enums"]["risk_level"];
  summary: string;
  limitation: string | null;
  blocksPublicDisclosure: boolean;
  status: Database["public"]["Enums"]["verification_exception_status"];
}>;

export type AdminVerificationCheck = Readonly<{
  id: string;
  status: VerificationStatus;
  applicability: VerificationApplicability;
  applicabilityReason: string | null;
  riskLevel: Database["public"]["Enums"]["risk_level"];
  scope: string | null;
  limitations: string | null;
  reviewerNotes: string | null;
  reviewedAt: string | null;
  checkDate: string | null;
  recheckAt: string | null;
  referralRequired: boolean;
  referralType: string | null;
  publicVisible: boolean;
  publicDisclosureEligible: boolean;
  publicCopyApproved: boolean;
  definition: AdminVerificationDefinition;
  evidence: readonly AdminVerificationEvidence[];
  exceptions: readonly AdminVerificationException[];
  professionalReviews: readonly AdminProfessionalReview[];
}>;

export type AdminVerificationDetail = Readonly<{
  property: Readonly<{
    id: string;
    propertyCode: string;
    title: string | null;
    category: "AGRICULTURAL" | "NA" | "INDUSTRIAL";
    transactionType: "BUY" | "RENT" | "LEASE";
    publicationStatus: string;
  }>;
  checks: readonly AdminVerificationCheck[];
  documents: readonly Readonly<{
    id: string;
    name: string | null;
    documentType: string;
    scanStatus: Database["public"]["Enums"]["document_scan_status"];
    archivedAt: string | null;
  }>[];
  sources: readonly Readonly<{ id: string; name: string; authority: string }>[];
  history: readonly Readonly<{
    id: number;
    checkId: string;
    eventType: string;
    fromStatus: VerificationStatus | null;
    toStatus: VerificationStatus | null;
    occurredAt: string;
    reason: string | null;
  }>[];
}>;

export class VerificationValidationError extends Error {
  override name = "VerificationValidationError";
}
