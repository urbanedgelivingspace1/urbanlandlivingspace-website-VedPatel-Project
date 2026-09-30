import type { LeadStatus } from "@/features/admin/contracts";
import type { AdminPrivateDocumentDto } from "@/features/media/domain/contracts";
import type { LandCategory, TransactionType } from "@/types/database";

export const LEAD_STATUSES: readonly LeadStatus[] = [
  "NEW",
  "CONTACT_ATTEMPTED",
  "QUALIFIED",
  "REQUIREMENT_CONFIRMED",
  "PROPERTY_MATCHED",
  "SITE_VISIT_REQUESTED",
  "SITE_VISIT_CONFIRMED",
  "SITE_VISIT_COMPLETED",
  "NEGOTIATION",
  "NURTURE",
  "CLOSED_WON",
  "CLOSED_LOST",
];
export const TERMINAL_LEAD_STATUSES: readonly LeadStatus[] = ["CLOSED_WON", "CLOSED_LOST"];
export const FOLLOW_UP_TYPES = [
  "CALL",
  "WHATSAPP",
  "EMAIL",
  "SITE_VISIT_CONFIRMATION",
  "PROPERTY_CHECK",
  "OWNER_UPDATE",
  "NEGOTIATION",
  "DOCUMENT_CHECK",
  "GENERAL",
] as const;
export type FollowUpType = (typeof FOLLOW_UP_TYPES)[number];
export const LOSS_REASONS = [
  "BUDGET_MISMATCH",
  "LOCATION_MISMATCH",
  "SIZE_MISMATCH",
  "PROPERTY_SOLD",
  "PROPERTY_UNAVAILABLE",
  "BUYER_ELIGIBILITY_REVIEW",
  "LEGAL_DOCUMENT_CONCERN",
  "TIMING_CHANGED",
  "COMPETITOR_PROPERTY",
  "BUYER_STOPPED_RESPONDING",
  "NOT_INTERESTED",
  "DUPLICATE",
  "OTHER",
] as const;

export type FollowUpBucket = "OVERDUE" | "TODAY" | "UPCOMING" | "COMPLETED";
export type LeadFormState = {
  ok: boolean;
  message: string;
  duplicateCount?: number;
  errors?: Record<string, string[]>;
};
export type LeadListItem = Readonly<{
  id: string;
  leadReference: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: LeadStatus;
  sourceType: string;
  inquiryType?: string;
  buyerType: string | null;
  transaction: TransactionType | null;
  category: LandCategory | null;
  districtName: string | null;
  localityText: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  nextFollowUpAt: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
  matchCount: number;
}>;

export type LeadWorkspace = Readonly<{
  lead: LeadListItem & {
    partyId: string;
    sourceDetail: string | null;
    inquiryType: string;
    intendedUse: string | null;
    notesInternal: string | null;
    closedAt: string | null;
    lossReason: string | null;
  };
  requirement: null | Readonly<{
    id: string;
    minAreaValue: number | null;
    maxAreaValue: number | null;
    areaUnitId: string | null;
    areaUnitLabel: string | null;
    preferredRoadWidthMMin: number | null;
    preferredFrontageMMin: number | null;
    notes: string | null;
  }>;
  matches: readonly Readonly<{
    id: string;
    propertyId: string;
    propertyCode: string;
    title: string | null;
    category: string;
    transaction: string;
    availability: string;
    status: string;
    notes: string | null;
    matchedAt: string | null;
  }>[];
  sellerProperties?: readonly Readonly<{
    id: string;
    propertyCode: string;
    title: string | null;
    category: string;
    transaction: string;
    availability: string;
    publicationStatus: string;
    createdAt: string;
  }>[];
  documents: readonly AdminPrivateDocumentDto[];
  followUps: readonly Readonly<{
    id: string;
    type: string;
    context: string | null;
    note: string | null;
    dueAt: string;
    completedAt: string | null;
    outcome: string | null;
    actorName: string;
  }>[];
  activities: readonly Readonly<{
    id: string;
    type: string;
    at: string;
    note: string | null;
    metadata: string | null;
    actorName: string;
    propertyId: string | null;
  }>[];
}>;

export type PropertyInterestedBuyers = Readonly<{
  matches: readonly Readonly<{
    id: string;
    leadId: string;
    leadReference: string;
    leadName: string;
    leadPhone: string | null;
    leadStatus: LeadStatus;
    matchedAt: string | null;
    notes: string | null;
  }>[];
  siteVisits: readonly Readonly<{
    id: string;
    leadId: string;
    leadReference: string;
    leadName: string;
    scheduledAt: string;
    status: string;
    notes: string | null;
  }>[];
}>;

export type MatchableProperty = Readonly<{
  id: string;
  propertyCode: string;
  title: string | null;
  category: string;
  transaction: string;
  availability: string;
  location: string | null;
  areaValue: number;
  areaUnit: string | null;
  priceMode: string | null;
  priceAmount: number | null;
  priceMin: number | null;
  priceMax: number | null;
}>;
