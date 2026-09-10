import type {
  AvailabilityStatus,
  LandCategory,
  LocationVisibility,
  PriceMode,
  TransactionType,
} from "@/types/database";
import type { Database as GeneratedDatabase } from "@/types/database.generated";

export type AdminPropertyDraftRecord = Readonly<{
  property: GeneratedDatabase["public"]["Tables"]["properties"]["Row"];
  districtName: string;
  areaUnitName: string;
  location: GeneratedDatabase["public"]["Tables"]["property_locations"]["Row"] | null;
  offer: GeneratedDatabase["public"]["Tables"]["property_offers"]["Row"] | null;
  parcel:
    | (GeneratedDatabase["public"]["Tables"]["property_parcels"]["Row"] & {
        identifier: GeneratedDatabase["public"]["Tables"]["parcel_identifiers"]["Row"] | null;
      })
    | null;
  planning: GeneratedDatabase["public"]["Tables"]["property_planning_context"]["Row"] | null;
  agricultural: GeneratedDatabase["public"]["Tables"]["property_agricultural"]["Row"] | null;
  na: GeneratedDatabase["public"]["Tables"]["property_na"]["Row"] | null;
  industrial: GeneratedDatabase["public"]["Tables"]["property_industrial"]["Row"] | null;
  partyLink: GeneratedDatabase["public"]["Tables"]["property_parties"]["Row"] | null;
  sourceLink: GeneratedDatabase["public"]["Tables"]["property_source_links"]["Row"] | null;
  mediaCount: number;
  hasApprovedCover: boolean;
  documentCount: number;
  verificationCount: number;
}>;

export type PropertyActivityItem = Readonly<{
  id: string;
  at: string;
  label: string;
  detail: string | null;
}>;

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
  externalMediaId?: string | null;
  mediaSubtype?: string | null;
  altText: string | null;
  caption?: string | null;
  width: number | null;
  height: number | null;
}>;

export type PublicAgriculturalDetailsDto = Readonly<{
  category: "AGRICULTURAL";
  tenureType: string | null;
  agriculturalUseStatus: string | null;
  irrigationStatus: string | null;
  primaryIrrigationSource: string | null;
  borewellCount: number | null;
  wellCount: number | null;
  canalAccessStatus: string | null;
  electricityStatus: string | null;
  fencingStatus: string | null;
  topography: string | null;
  landShape: string | null;
  structurePresent: boolean | null;
  roadTouch: boolean | null;
  roadWidthMetres: number | null;
  boundarySummary: string | null;
  currentCultivationStatus: string | null;
}>;

export type PublicNaDetailsDto = Readonly<{
  category: "NA";
  status: string | null;
  purpose: string | null;
  orderReference: string | null;
  orderDate: string | null;
  developmentPermissionStatus: string | null;
  layoutApprovalStatus: string | null;
  roadWidthMetres: number | null;
  frontageMetres: number | null;
  cornerPlot: boolean | null;
  waterStatus: string | null;
  electricityStatus: string | null;
  drainageStatus: string | null;
}>;

export type PublicIndustrialDetailsDto = Readonly<{
  category: "INDUSTRIAL";
  subtype: string | null;
  authorityName: string | null;
  tenure: string | null;
  gidcEstateName: string | null;
  gidcPlotNumber: string | null;
  gidcShedNumber: string | null;
  allotmentStatus: string | null;
  possessionStatus: string | null;
  transferStatus: string | null;
  permittedUse: string | null;
  existingShedPresent: boolean | null;
  shedArea: Readonly<{ value: number; unitCode: string | null }> | null;
  openArea: Readonly<{ value: number; unitCode: string | null }> | null;
  roadWidthMetres: number | null;
  truckLoadingAccess: string | null;
  powerStatus: string | null;
  sanctionedLoadKw: number | null;
  transformerStatus: string | null;
  waterStatus: string | null;
  drainageStatus: string | null;
  cetpStatus: string | null;
  etpStatus: string | null;
  gasStatus: string | null;
  connectivitySummary: string | null;
}>;

export type PublicCategoryDetailsDto =
  PublicAgriculturalDetailsDto | PublicNaDetailsDto | PublicIndustrialDetailsDto;

export type PublicPlanningDetailsDto = Readonly<{
  authorityName: string | null;
  zoneName: string | null;
  useClassification: string | null;
  tpSchemeNumber: string | null;
  tpPlotType: string | null;
  tpPlotNumber: string | null;
  publicNotes: string | null;
}>;

export type PublicParcelIdentifierDto = Readonly<{
  type: string;
  value: string;
  primary: boolean;
  parcelSequence: number;
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
    categoryDetails: PublicCategoryDetailsDto;
    planning: PublicPlanningDetailsDto;
    parcelIdentifiers: readonly PublicParcelIdentifierDto[];
  }>;
