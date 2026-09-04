import type {
  AvailabilityStatus,
  LandCategory,
  LocationVisibility,
  PriceMode,
  TransactionType,
} from "@/types/database";

export type PublicLocationDto = Readonly<{
  visibility: LocationVisibility;
  label: string;
  point: Readonly<{ latitude: number; longitude: number; accuracyMetres: number | null }> | null;
}>;

export type PublicPriceDto = Readonly<{
  transactionType: TransactionType;
  mode: PriceMode;
  currency: "INR";
  amount: number | null;
  minimum: number | null;
  maximum: number | null;
  perUnit: number | null;
  unitCode: string | null;
  negotiable: boolean;
}>;

export type PublicMediaDto = Readonly<{
  id: string;
  mediaType?: string;
  objectPath: string | null;
  externalUrl?: string | null;
  externalProvider?: string | null;
  mediaSubtype?: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
}>;

export type PublicPropertyCardDto = Readonly<{
  id: string;
  propertyCode: string;
  slug: string;
  title: string;
  summary: string | null;
  category: LandCategory;
  transactionType: TransactionType;
  availability: AvailabilityStatus;
  featured: boolean;
  publishedAt: string;
  area: Readonly<{ value: number; unitCode: string; unitLabel: string; symbol: string | null }>;
  location: PublicLocationDto;
  price: PublicPriceDto | null;
  cover: PublicMediaDto | null;
}>;

export type PublicVerificationSummaryDto = Readonly<{
  code: string;
  label: string;
  explanation: string | null;
  status: "COMPLETED" | "COMPLETED_WITH_NOTE";
  reviewedAt: string | null;
  checkDate: string | null;
  scope: string;
  limitation: string;
  sourceClass:
    | "LEGAL_OFFICIAL_REQUIREMENT"
    | "OFFICIAL_ADMINISTRATIVE_PRACTICE"
    | "PROFESSIONAL_DUE_DILIGENCE"
    | "URBANEDGE_OPERATIONAL_POLICY";
}>;

export type PublicPropertyDetailDto = PublicPropertyCardDto &
  Readonly<{
    description: string | null;
    seo: Readonly<{
      title: string | null;
      description: string | null;
      canonicalPath: string | null;
    }>;
    media: readonly PublicMediaDto[];
    verifications: readonly PublicVerificationSummaryDto[];
  }>;
