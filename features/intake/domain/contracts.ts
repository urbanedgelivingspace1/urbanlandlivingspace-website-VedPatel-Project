import type { LandCategory, TransactionType } from "@/types/database";

export const PUBLIC_PRIVACY_NOTICE_VERSION = "M13-CONTACT-PLACEHOLDER-2026-09-05";

export const PUBLIC_INTAKE_ACTIONS = [
  "PROPERTY_INQUIRY",
  "BUYER_REQUIREMENT",
  "SITE_VISIT_REQUEST",
  "GENERAL_CONTACT",
] as const;
export type PublicIntakeAction = (typeof PUBLIC_INTAKE_ACTIONS)[number];

export const REQUIREMENT_SOURCE_CONTEXTS = [
  "DIRECT",
  "SEARCH_ZERO",
  "CATEGORY_AGRICULTURAL",
  "CATEGORY_NA",
  "CATEGORY_INDUSTRIAL",
  "TRANSACTION_BUY",
  "TRANSACTION_RENT",
  "TRANSACTION_LEASE",
] as const;
export type RequirementSourceContext = (typeof REQUIREMENT_SOURCE_CONTEXTS)[number];

export type PublicIntakeFormState = Readonly<{
  status: "idle" | "error" | "success";
  message: string;
  errors?: Readonly<Record<string, readonly string[]>>;
  values?: Readonly<Record<string, string>>;
  propertyReference?: string;
}>;

export const initialPublicIntakeState: PublicIntakeFormState = {
  status: "idle",
  message: "",
};

export type PublicFormOption = Readonly<{ value: string; label: string }>;
export type RequirementPrefill = Readonly<{
  sourceContext: RequirementSourceContext;
  transaction?: TransactionType;
  category?: LandCategory;
  districtId?: string;
  minimumArea?: number;
  maximumArea?: number;
  areaUnitId?: string;
  budgetMinimum?: number;
  budgetMaximum?: number;
}>;

export type PublicIntakeResult = Readonly<{
  replayed: boolean;
  propertyReference?: string;
}>;

export class PublicIntakeError extends Error {
  constructor(
    readonly code:
      | "RATE_LIMITED"
      | "BOT_REJECTED"
      | "BOT_CONFIGURATION_REQUIRED"
      | "UNTRUSTED_ORIGIN"
      | "PROPERTY_UNAVAILABLE"
      | "IDEMPOTENCY_CONFLICT"
      | "INVALID_REQUEST"
      | "SERVICE_UNAVAILABLE",
  ) {
    super(code);
    this.name = "PublicIntakeError";
  }
}
