import type { PublicPropertyCardDto } from "@/features/properties/domain/contracts";
import type { LandCategory } from "@/types/database";

import type { SearchQuery } from "./search-query";

export type SearchFacetOption = Readonly<{
  value: string;
  label: string;
  count: number;
}>;

export type SearchGeographyOption = Readonly<{
  district: SearchFacetOption;
  taluka: SearchFacetOption | null;
  place: SearchFacetOption | null;
  locality: SearchFacetOption | null;
}>;

export type SearchFacets = Readonly<{
  geography: readonly SearchGeographyOption[];
  categorySpecific: Readonly<
    Record<
      | "agriculturalTenure"
      | "agriculturalIrrigation"
      | "naStatus"
      | "naPurpose"
      | "industrialType"
      | "industrialPower",
      readonly SearchFacetOption[]
    >
  >;
}>;

export type SearchResult = Readonly<{
  properties: readonly PublicPropertyCardDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>;

export interface SearchProvider {
  search(query: SearchQuery): Promise<SearchResult>;
  facets(): Promise<SearchFacets>;
  searchFixed(
    constraints: Readonly<{ category?: LandCategory; transaction?: SearchQuery["transaction"] }>,
    limit?: number,
  ): Promise<SearchResult>;
}
