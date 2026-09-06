import type { LandCategory, LocationVisibility } from "@/types/database";

export const OWNER_PRIVACY_NOTICE_VERSION = "M15-OWNER-INTAKE-2026-09-06";
export const OWNER_SUBMISSION_ACTION = "OWNER_LAND_SUBMISSION" as const;

export const OWNER_SUBMISSION_STATUSES = [
  "NEW",
  "CONTACTED",
  "DOCS_REQUESTED",
  "UNDER_REVIEW",
  "VERIFICATION_PENDING",
  "APPROVED",
  "REJECTED",
  "ON_HOLD",
  "CONVERTED",
  "CLOSED",
] as const;
export type OwnerSubmissionStatus = (typeof OWNER_SUBMISSION_STATUSES)[number];

export type OwnerSubmissionFormState = Readonly<{
  status: "idle" | "error";
  message: string;
  errors?: Readonly<Record<string, readonly string[]>>;
  values?: Readonly<Record<string, string>>;
}>;

export const initialOwnerSubmissionState: OwnerSubmissionFormState = {
  status: "idle",
  message: "",
};

export type OwnerSubmissionResult = Readonly<{
  submissionId: string;
  submissionReference: string;
  replayed: boolean;
}>;

export type OwnerAttachmentRole = "OWNER_PHOTO" | "OWNER_BROCHURE" | "SUPPORTING_DOCUMENT";

export type PreparedOwnerAttachment = Readonly<{
  id: string;
  documentRole: OwnerAttachmentRole;
  documentType: "OWNER_MEDIA" | "OWNER_BROCHURE" | "OWNER_SUPPORTING_DOCUMENT";
  objectPath: string;
  mimeType: "application/pdf" | "image/jpeg" | "image/png";
  fileSizeBytes: number;
  checksumSha256: string;
  originalFileName: string;
  pageCount: number | null;
  scanStatus: "PENDING" | "CLEAN";
}>;

export type OwnerSubmissionListItem = Readonly<{
  id: string;
  reference: string;
  ownerName: string;
  category: LandCategory;
  intent: "SELL" | "RENT" | "LEASE";
  district: string;
  status: OwnerSubmissionStatus;
  nextActionAt: string | null;
  createdAt: string;
}>;

export type OwnerSubmissionConversionInput = Readonly<{
  listingTitle: string;
  publicDescription: string;
  publicAddress?: string;
  locationVisibility: LocationVisibility;
  priceMode: "PRICE_ON_REQUEST" | "EXACT_TOTAL" | "PER_UNIT";
  priceAmount?: number;
  pricePerUnit?: number;
  priceUnitId?: string;
  negotiable: boolean;
}>;

export class OwnerSubmissionError extends Error {
  constructor(
    readonly code:
      | "RATE_LIMITED"
      | "BOT_REJECTED"
      | "BOT_CONFIGURATION_REQUIRED"
      | "UNTRUSTED_ORIGIN"
      | "INVALID_REQUEST"
      | "ATTACHMENT_INVALID"
      | "ATTACHMENT_UNSAFE"
      | "ATTACHMENT_LIMIT"
      | "IDEMPOTENCY_CONFLICT"
      | "STALE_RECORD"
      | "TRANSITION_NOT_ALLOWED"
      | "NOT_APPROVED"
      | "ALREADY_CONVERTED"
      | "SERVICE_UNAVAILABLE",
  ) {
    super(code);
    this.name = "OwnerSubmissionError";
  }
}
