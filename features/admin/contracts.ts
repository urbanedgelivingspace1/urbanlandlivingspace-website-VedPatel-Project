import type {
  AvailabilityStatus,
  LandCategory,
  LocationVisibility,
  TransactionType,
} from "@/types/database";

export type AdminPropertyDetailDto = Readonly<{
  id: string;
  propertyCode: string;
  publicationStatus: "DRAFT" | "UNDER_REVIEW" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";
  availabilityStatus: AvailabilityStatus;
  category: LandCategory;
  transactionType: TransactionType;
  locationVisibility: LocationVisibility;
  ownerPartyIds: readonly string[];
  internalNotes: readonly string[];
}>;

export type AdminLeadDto = Readonly<{
  id: string;
  leadReference: string;
  partyId: string;
  status: LeadStatus;
  nextFollowUpAt: string | null;
  notesInternal: string | null;
}>;

export type LeadStatus =
  | "NEW"
  | "CONTACT_ATTEMPTED"
  | "QUALIFIED"
  | "REQUIREMENT_CONFIRMED"
  | "PROPERTY_MATCHED"
  | "SITE_VISIT_REQUESTED"
  | "SITE_VISIT_CONFIRMED"
  | "SITE_VISIT_COMPLETED"
  | "NEGOTIATION"
  | "WON"
  | "LOST"
  | "NURTURE"
  | "CLOSED";

export type AdminOwnerSubmissionDto = Readonly<{
  id: string;
  submissionReference: string;
  partyId: string;
  status: OwnerSubmissionStatus;
  nextActionAt: string | null;
  convertedPropertyId: string | null;
}>;

export type OwnerSubmissionStatus =
  | "NEW"
  | "CONTACTED"
  | "DOCS_REQUESTED"
  | "UNDER_REVIEW"
  | "VERIFICATION_PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ON_HOLD"
  | "CONVERTED"
  | "CLOSED";

export type AdminVerificationDto = Readonly<{
  id: string;
  propertyId: string;
  checkDefinitionId: string;
  status:
    | "NOT_STARTED"
    | "IN_REVIEW"
    | "PASSED"
    | "PASSED_WITH_NOTE"
    | "FAILED"
    | "REQUIRES_REVIEW"
    | "EXPIRED";
  reviewerNotesInternal: string | null;
  evidenceIds: readonly string[];
}>;
