import type {
  PublicPropertyCardDto,
  PublicPropertyDetailDto,
} from "@/features/properties/domain/contracts";

export function buildPublicPropertyCard(
  overrides: Partial<PublicPropertyCardDto> = {},
): PublicPropertyCardDto {
  return {
    id: "20000000-0000-4000-8000-000000000010",
    propertyCode: "UE-LS-000010",
    slug: "synthetic-agricultural-land",
    title: "Synthetic agricultural land",
    summary: "Synthetic public summary",
    category: "AGRICULTURAL",
    transactionType: "BUY",
    availability: "AVAILABLE",
    featured: true,
    publishedAt: "2026-09-05T00:00:00.000Z",
    area: { value: 2.5, unitCode: "acre", unitLabel: "Acre", symbol: "ac" },
    location: {
      visibility: "APPROXIMATE",
      label: "Sanand, Ahmedabad",
      point: { latitude: 22.99, longitude: 72.38, accuracyMetres: 2_000 },
    },
    price: {
      transactionType: "BUY",
      mode: "EXACT_TOTAL",
      currency: "INR",
      amount: 15_000_000,
      minimum: null,
      maximum: null,
      perUnit: null,
      unitCode: null,
      negotiable: true,
    },
    cover: null,
    ...overrides,
  };
}

export function buildPublicPropertyDetail(
  overrides: Partial<PublicPropertyDetailDto> = {},
): PublicPropertyDetailDto {
  return {
    ...buildPublicPropertyCard(),
    description: "Synthetic public description",
    googleMapsEmbedUrl: null,
    seo: { title: null, description: null, canonicalPath: null },
    media: [],
    verifications: [],
    categoryDetails: {
      category: "AGRICULTURAL",
      tenureType: "OLD_TENURE",
      agriculturalUseStatus: "IN_USE",
      irrigationStatus: "AVAILABLE",
      primaryIrrigationSource: "BOREWELL",
      borewellCount: 1,
      wellCount: 0,
      canalAccessStatus: null,
      electricityStatus: "AVAILABLE",
      fencingStatus: "PARTIAL",
      topography: "LEVEL",
      landShape: "RECTANGULAR",
      structurePresent: false,
      roadTouch: true,
      roadWidthMetres: 9,
      boundarySummary: "Synthetic boundary context",
      currentCultivationStatus: "CULTIVATED",
    },
    planning: {
      authorityName: "Synthetic planning authority",
      zoneName: "Agricultural zone",
      useClassification: "Agricultural",
      tpSchemeNumber: null,
      tpPlotType: null,
      tpPlotNumber: null,
      publicNotes: null,
    },
    parcelIdentifiers: [
      { type: "SURVEY_NUMBER", value: "TEST-42", primary: true, parcelSequence: 1 },
    ],
    ...overrides,
  };
}
