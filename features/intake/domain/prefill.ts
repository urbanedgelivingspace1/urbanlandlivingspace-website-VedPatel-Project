import type { SearchParamsInput, SearchQuery } from "@/features/search/domain/search-query";
import { parseSearchParams, toSearchToken } from "@/features/search/domain/search-query";
import type { PublicAreaUnitRow, PublicGeographyOptionRow } from "@/types/database";

import {
  REQUIREMENT_SOURCE_CONTEXTS,
  type RequirementPrefill,
  type RequirementSourceContext,
} from "./contracts";

function first(input: SearchParamsInput, key: string): string | undefined {
  const value = input[key];
  return typeof value === "string" ? value : value?.[0];
}

export function parseRequirementPrefill(
  input: SearchParamsInput,
  geography: readonly PublicGeographyOptionRow[],
  units: readonly PublicAreaUnitRow[],
): RequirementPrefill {
  const query = parseSearchParams(input).query;
  const requestedSource = first(input, "source")?.toUpperCase();
  const sourceContext = REQUIREMENT_SOURCE_CONTEXTS.includes(
    requestedSource as RequirementSourceContext,
  )
    ? (requestedSource as RequirementSourceContext)
    : "DIRECT";
  const districtId = query.district
    ? geography.find((item) => toSearchToken(item.district_name) === query.district)?.district_id
    : undefined;
  const areaUnitId = units.find((unit) => unit.code === query.areaUnit)?.id;
  return {
    sourceContext,
    transaction: query.transaction ?? undefined,
    category: query.category ?? undefined,
    districtId,
    minimumArea: query.minimumArea ?? undefined,
    maximumArea: query.maximumArea ?? undefined,
    areaUnitId,
    budgetMinimum: query.minimumPrice ?? undefined,
    budgetMaximum: query.maximumPrice ?? undefined,
  };
}

export function requirementHref(
  query: SearchQuery,
  sourceContext: RequirementSourceContext = "SEARCH_ZERO",
): string {
  const params = new URLSearchParams({ source: sourceContext });
  if (query.transaction) params.set("transaction", query.transaction.toLowerCase());
  if (query.category)
    params.set(
      "category",
      query.category === "AGRICULTURAL" ? "agricultural" : query.category.toLowerCase(),
    );
  if (query.district) params.set("district", query.district);
  if (query.minimumArea !== null) params.set("minArea", String(query.minimumArea));
  if (query.maximumArea !== null) params.set("maxArea", String(query.maximumArea));
  if (query.minimumArea !== null || query.maximumArea !== null)
    params.set("areaUnit", query.areaUnit);
  if (query.minimumPrice !== null) params.set("minPrice", String(query.minimumPrice));
  if (query.maximumPrice !== null) params.set("maxPrice", String(query.maximumPrice));
  return `/requirements?${params.toString()}`;
}
