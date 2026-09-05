import type { AvailabilityStatus, LandCategory, TransactionType } from "@/types/database";

export const SEARCH_PAGE_SIZE = 12;
export const SEARCH_MAX_PAGE = 100;

export const searchSorts = [
  "DEFAULT",
  "NEWEST",
  "OLDEST",
  "PRICE_LOW",
  "PRICE_HIGH",
  "AREA_SMALL",
  "AREA_LARGE",
] as const;
export type SearchSort = (typeof searchSorts)[number];

export const searchAreaUnits = ["sq_ft", "sq_m", "sq_yd", "var", "acre", "hectare"] as const;
export type SearchAreaUnit = (typeof searchAreaUnits)[number];
export type SearchPricing = "LISTED" | "POR";

export type SearchParamsInput = Readonly<Record<string, string | readonly string[] | undefined>>;

export type SearchQuery = Readonly<{
  keyword: string | null;
  propertyId: string | null;
  category: LandCategory | null;
  transaction: TransactionType | null;
  district: string | null;
  taluka: string | null;
  place: string | null;
  locality: string | null;
  minimumArea: number | null;
  maximumArea: number | null;
  areaUnit: SearchAreaUnit;
  minimumPrice: number | null;
  maximumPrice: number | null;
  pricing: SearchPricing | null;
  availability: Exclude<AvailabilityStatus, "OFF_MARKET"> | null;
  agriculturalTenure: string | null;
  agriculturalIrrigation: string | null;
  naStatus: string | null;
  naPurpose: string | null;
  industrialType: string | null;
  industrialPower: string | null;
  sort: SearchSort;
  page: number;
  pageSize: number;
}>;

export type ParsedSearchQuery = Readonly<{
  query: SearchQuery;
  canonicalQueryString: string;
  shouldRedirect: boolean;
}>;

const allowedKeys = [
  "q",
  "propertyId",
  "category",
  "transaction",
  "district",
  "taluka",
  "place",
  "locality",
  "minArea",
  "maxArea",
  "areaUnit",
  "minPrice",
  "maxPrice",
  "pricing",
  "availability",
  "agriTenure",
  "agriIrrigation",
  "naStatus",
  "naPurpose",
  "industrialType",
  "industrialPower",
  "sort",
  "page",
] as const;

const allowedKeySet = new Set<string>(allowedKeys);
const propertyCodePattern = /^UE-LS-\d{6}$/i;
const tokenPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const categoryValues: Record<string, LandCategory> = {
  agricultural: "AGRICULTURAL",
  na: "NA",
  industrial: "INDUSTRIAL",
};
const transactionValues: Record<string, TransactionType> = {
  buy: "BUY",
  rent: "RENT",
  lease: "LEASE",
};
const availabilityValues: Record<string, Exclude<AvailabilityStatus, "OFF_MARKET">> = {
  available: "AVAILABLE",
  "under-negotiation": "UNDER_NEGOTIATION",
  sold: "SOLD",
  rented: "RENTED",
  leased: "LEASED",
};
const pricingValues: Record<string, SearchPricing> = { listed: "LISTED", por: "POR" };
const sortValues: Record<string, SearchSort> = {
  recommended: "DEFAULT",
  newest: "NEWEST",
  oldest: "OLDEST",
  "price-asc": "PRICE_LOW",
  "price-desc": "PRICE_HIGH",
  "area-asc": "AREA_SMALL",
  "area-desc": "AREA_LARGE",
};
const sortParameters: Record<SearchSort, string | null> = {
  DEFAULT: null,
  NEWEST: "newest",
  OLDEST: "oldest",
  PRICE_LOW: "price-asc",
  PRICE_HIGH: "price-desc",
  AREA_SMALL: "area-asc",
  AREA_LARGE: "area-desc",
};
const categoryParameters: Record<LandCategory, string> = {
  AGRICULTURAL: "agricultural",
  NA: "na",
  INDUSTRIAL: "industrial",
};
const transactionParameters: Record<TransactionType, string> = {
  BUY: "buy",
  RENT: "rent",
  LEASE: "lease",
};
const availabilityParameters: Record<Exclude<AvailabilityStatus, "OFF_MARKET">, string> = {
  AVAILABLE: "available",
  UNDER_NEGOTIATION: "under-negotiation",
  SOLD: "sold",
  RENTED: "rented",
  LEASED: "leased",
};

function first(input: SearchParamsInput, key: string): string | undefined {
  const value = input[key];
  return typeof value === "string" ? value : value?.[0];
}

function cleanedText(value: string | undefined, maximum: number): string | null {
  const cleaned = value?.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, maximum) : null;
}

function enumValue<T>(value: string | undefined, values: Record<string, T>): T | null {
  const key = value?.trim().toLowerCase();
  return key ? (values[key] ?? null) : null;
}

function token(value: string | undefined): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized && normalized.length <= 180 && tokenPattern.test(normalized)
    ? normalized
    : null;
}

function positiveNumber(value: string | undefined, maximum: number): number | null {
  const normalized = value?.trim();
  if (!normalized || !/^\d+(?:\.\d{1,4})?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= maximum ? parsed : null;
}

function normalizedRange(
  minimum: number | null,
  maximum: number | null,
): readonly [number | null, number | null] {
  return minimum !== null && maximum !== null && minimum > maximum
    ? [maximum, minimum]
    : [minimum, maximum];
}

function pageNumber(value: string | undefined): number {
  if (!value?.trim() || !/^\d+$/.test(value.trim())) return 1;
  return Math.max(1, Math.min(Number(value), SEARCH_MAX_PAGE));
}

function rawQueryString(input: SearchParamsInput): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string") params.append(key, value);
    else value?.forEach((entry) => params.append(key, entry));
  }
  return params.toString();
}

function numberParameter(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
}

export function toSearchToken(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180);
}

export function areaToSquareMetres(value: number, unit: SearchAreaUnit): number {
  const factors: Record<SearchAreaUnit, number> = {
    sq_m: 1,
    sq_ft: 0.09290304,
    sq_yd: 0.83612736,
    var: 0.83612736,
    acre: 4046.8564224,
    hectare: 10_000,
  };
  return value * factors[unit];
}

export function serializeSearchQuery(query: SearchQuery): string {
  const params = new URLSearchParams();
  if (query.keyword) params.set("q", query.keyword);
  if (query.propertyId) params.set("propertyId", query.propertyId);
  if (query.category) params.set("category", categoryParameters[query.category]);
  if (query.transaction) params.set("transaction", transactionParameters[query.transaction]);
  if (query.district) params.set("district", query.district);
  if (query.taluka) params.set("taluka", query.taluka);
  if (query.place) params.set("place", query.place);
  if (query.locality) params.set("locality", query.locality);
  if (query.minimumArea !== null) params.set("minArea", numberParameter(query.minimumArea));
  if (query.maximumArea !== null) params.set("maxArea", numberParameter(query.maximumArea));
  if ((query.minimumArea !== null || query.maximumArea !== null) && query.areaUnit !== "sq_ft")
    params.set("areaUnit", query.areaUnit);
  if (query.minimumPrice !== null) params.set("minPrice", numberParameter(query.minimumPrice));
  if (query.maximumPrice !== null) params.set("maxPrice", numberParameter(query.maximumPrice));
  if (query.pricing) params.set("pricing", query.pricing === "POR" ? "por" : "listed");
  if (query.availability) params.set("availability", availabilityParameters[query.availability]);
  if (query.agriculturalTenure) params.set("agriTenure", query.agriculturalTenure);
  if (query.agriculturalIrrigation) params.set("agriIrrigation", query.agriculturalIrrigation);
  if (query.naStatus) params.set("naStatus", query.naStatus);
  if (query.naPurpose) params.set("naPurpose", query.naPurpose);
  if (query.industrialType) params.set("industrialType", query.industrialType);
  if (query.industrialPower) params.set("industrialPower", query.industrialPower);
  const sort = sortParameters[query.sort];
  if (sort) params.set("sort", sort);
  if (query.page > 1) params.set("page", String(query.page));
  return params.toString();
}

export function searchHref(query: SearchQuery): string {
  const parameters = serializeSearchQuery(query);
  return parameters ? `/properties?${parameters}` : "/properties";
}

export function emptySearchQuery(): SearchQuery {
  return parseSearchParams({}).query;
}

export function parseSearchParams(input: SearchParamsInput): ParsedSearchQuery {
  let keyword = cleanedText(first(input, "q"), 120);
  let propertyId = cleanedText(first(input, "propertyId"), 13);
  if (propertyId && !propertyCodePattern.test(propertyId)) propertyId = null;
  if (!propertyId && keyword && propertyCodePattern.test(keyword)) {
    propertyId = keyword;
    keyword = null;
  }
  propertyId = propertyId?.toUpperCase() ?? null;

  const category = enumValue(first(input, "category"), categoryValues);
  const transaction = enumValue(first(input, "transaction"), transactionValues);
  const district = token(first(input, "district"));
  const taluka = district ? token(first(input, "taluka")) : null;
  const place = taluka ? token(first(input, "place")) : null;
  const locality = place ? token(first(input, "locality")) : null;
  let [minimumArea, maximumArea] = normalizedRange(
    positiveNumber(first(input, "minArea"), 1_000_000_000),
    positiveNumber(first(input, "maxArea"), 1_000_000_000),
  );
  const parsedAreaUnit = first(input, "areaUnit")?.trim().toLowerCase();
  const areaUnit = searchAreaUnits.includes(parsedAreaUnit as SearchAreaUnit)
    ? (parsedAreaUnit as SearchAreaUnit)
    : "sq_ft";
  if (minimumArea === 0) minimumArea = null;
  if (maximumArea === 0) maximumArea = null;

  let [minimumPrice, maximumPrice] = normalizedRange(
    positiveNumber(first(input, "minPrice"), 1_000_000_000_000_000),
    positiveNumber(first(input, "maxPrice"), 1_000_000_000_000_000),
  );
  if (minimumPrice === 0) minimumPrice = null;
  if (maximumPrice === 0) maximumPrice = null;
  const pricing = enumValue(first(input, "pricing"), pricingValues);
  if (pricing === "POR") {
    minimumPrice = null;
    maximumPrice = null;
  }

  const query: SearchQuery = {
    keyword,
    propertyId,
    category,
    transaction,
    district,
    taluka,
    place,
    locality,
    minimumArea,
    maximumArea,
    areaUnit,
    minimumPrice,
    maximumPrice,
    pricing,
    availability: enumValue(first(input, "availability"), availabilityValues),
    agriculturalTenure: category === "AGRICULTURAL" ? token(first(input, "agriTenure")) : null,
    agriculturalIrrigation:
      category === "AGRICULTURAL" ? token(first(input, "agriIrrigation")) : null,
    naStatus: category === "NA" ? token(first(input, "naStatus")) : null,
    naPurpose: category === "NA" ? token(first(input, "naPurpose")) : null,
    industrialType: category === "INDUSTRIAL" ? token(first(input, "industrialType")) : null,
    industrialPower: category === "INDUSTRIAL" ? token(first(input, "industrialPower")) : null,
    sort: enumValue(first(input, "sort"), sortValues) ?? "DEFAULT",
    page: pageNumber(first(input, "page")),
    pageSize: SEARCH_PAGE_SIZE,
  };
  const canonicalQueryString = serializeSearchQuery(query);
  const hasUnknownKey = Object.keys(input).some((key) => !allowedKeySet.has(key));
  return {
    query,
    canonicalQueryString,
    shouldRedirect: hasUnknownKey || rawQueryString(input) !== canonicalQueryString,
  };
}

export function withSearchChanges(query: SearchQuery, changes: Partial<SearchQuery>): SearchQuery {
  return { ...query, ...changes, page: changes.page ?? 1 };
}

export function activeFilterCount(query: SearchQuery): number {
  return [
    query.keyword,
    query.propertyId,
    query.category,
    query.transaction,
    query.district,
    query.taluka,
    query.place,
    query.locality,
    query.minimumArea !== null || query.maximumArea !== null,
    query.minimumPrice !== null || query.maximumPrice !== null,
    query.pricing,
    query.availability,
    query.agriculturalTenure,
    query.agriculturalIrrigation,
    query.naStatus,
    query.naPurpose,
    query.industrialType,
    query.industrialPower,
  ].filter(Boolean).length;
}

export function hasIndexableSearchState(query: SearchQuery): boolean {
  const withoutPage = withSearchChanges(query, { page: 1 });
  return activeFilterCount(withoutPage) === 0 && withoutPage.sort === "DEFAULT";
}
