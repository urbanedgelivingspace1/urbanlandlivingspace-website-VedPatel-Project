import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  SearchFacetOption,
  SearchFacets,
  SearchGeographyOption,
  SearchProvider,
  SearchResult,
} from "@/features/search/domain/contracts";
import {
  areaToSquareMetres,
  emptySearchQuery,
  toSearchToken,
  type SearchQuery,
} from "@/features/search/domain/search-query";
import { projectPublicPropertyCard } from "@/features/properties/queries/public-property-projector";
import type { Database, PublicPropertyListingRow } from "@/types/database";

const facetFields = "facet_key,land_category,value,label,result_count" as const;
const geographyFields =
  "district_id,district_name,subdistrict_id,subdistrict_name,place_id,place_name,locality_id,locality_name,locality_slug,locality_is_indexable" as const;

export class PostgresSearchProvider implements SearchProvider {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async search(query: SearchQuery): Promise<SearchResult> {
    const minimumArea =
      query.minimumArea === null ? null : areaToSquareMetres(query.minimumArea, query.areaUnit);
    const maximumArea =
      query.maximumArea === null ? null : areaToSquareMetres(query.maximumArea, query.areaUnit);
    const { data, error } = await this.client.rpc("search_public_properties", {
      requested_keyword: query.keyword,
      requested_property_code: query.propertyId,
      requested_category: query.category,
      requested_transaction: query.transaction,
      requested_district: query.district,
      requested_taluka: query.taluka,
      requested_place: query.place,
      requested_locality: query.locality,
      requested_minimum_area_sqm: minimumArea,
      requested_maximum_area_sqm: maximumArea,
      requested_minimum_price: query.minimumPrice,
      requested_maximum_price: query.maximumPrice,
      requested_pricing: query.pricing,
      requested_availability: query.availability,
      requested_agricultural_tenure: query.agriculturalTenure,
      requested_agricultural_irrigation: query.agriculturalIrrigation,
      requested_na_status: query.naStatus,
      requested_na_purpose: query.naPurpose,
      requested_industrial_type: query.industrialType,
      requested_industrial_power: query.industrialPower,
      requested_sort: query.sort,
      requested_page: query.page,
      requested_page_size: query.pageSize,
    });
    if (error) throw error;
    const rows = data ?? [];
    const totalCount = Number(rows[0]?.total_count ?? 0);
    return {
      properties: rows.map((row) => projectPublicPropertyCard(row as PublicPropertyListingRow)),
      totalCount,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: totalCount === 0 ? 0 : Math.ceil(totalCount / query.pageSize),
    };
  }

  async facets(): Promise<SearchFacets> {
    const [{ data: geography, error: geographyError }, { data: rawFacets, error: facetError }] =
      await Promise.all([
        this.client.from("public_geography_options").select(geographyFields).limit(1_000),
        this.client
          .from("public_property_search_filter_options")
          .select(facetFields)
          .order("label")
          .limit(300),
      ]);
    if (geographyError) throw geographyError;
    if (facetError) throw facetError;

    const option = (value: string | null, label: string | null): SearchFacetOption | null =>
      value && label ? { value, label, count: 0 } : null;
    const geographyOptions: SearchGeographyOption[] = geography.map((row) => ({
      district: {
        value: toSearchToken(row.district_name),
        label: row.district_name,
        count: 0,
      },
      taluka: option(
        row.subdistrict_name ? toSearchToken(row.subdistrict_name) : null,
        row.subdistrict_name,
      ),
      place: option(row.place_name ? toSearchToken(row.place_name) : null, row.place_name),
      locality: option(
        row.locality_name ? toSearchToken(row.locality_name) : null,
        row.locality_name,
      ),
    }));
    const buckets: Record<keyof SearchFacets["categorySpecific"], SearchFacetOption[]> = {
      agriculturalTenure: [],
      agriculturalIrrigation: [],
      naStatus: [],
      naPurpose: [],
      industrialType: [],
      industrialPower: [],
    };
    for (const row of rawFacets) {
      if (row.facet_key in buckets) {
        buckets[row.facet_key as keyof typeof buckets].push({
          value: row.value,
          label: row.label,
          count: Number(row.result_count),
        });
      }
    }
    return { geography: geographyOptions, categorySpecific: buckets };
  }

  async searchFixed(
    constraints: Parameters<SearchProvider["searchFixed"]>[0],
    limit = 12,
  ): Promise<SearchResult> {
    const pageSize = Math.max(1, Math.min(limit, 48));
    return this.search({
      ...emptySearchQuery(),
      category: constraints.category ?? null,
      transaction: constraints.transaction ?? null,
      pageSize,
    });
  }
}
