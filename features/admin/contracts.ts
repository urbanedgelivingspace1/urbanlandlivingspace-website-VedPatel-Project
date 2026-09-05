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

export type AdminPropertyListItemDto = Readonly<{
  id: string;
  propertyCode: string;
  title: string | null;
  category: LandCategory;
  transactionType: TransactionType;
  districtName: string;
  areaValue: number;
  areaUnit: string;
  priceMode: "PRICE_ON_REQUEST" | "EXACT_TOTAL" | "PRICE_RANGE" | "PER_UNIT";
  priceAmount: number | null;
  availabilityStatus: AvailabilityStatus;
  publicationStatus: "DRAFT" | "UNDER_REVIEW" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";
  verificationCount: number;
  mediaCount: number;
  updatedAt: string;
}>;

export type AdminPropertyReferenceData = Readonly<{
  districts: readonly Readonly<{ id: string; name: string }>[];
  areaUnits: readonly Readonly<{ id: string; code: string; name: string; symbol: string | null }>[];
  parties: readonly Readonly<{ id: string; displayName: string; partyType: string }>[];
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
  | "NURTURE"
  | "CLOSED_WON"
  | "CLOSED_LOST";

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
