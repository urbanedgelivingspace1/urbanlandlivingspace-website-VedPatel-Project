import "server-only";

import type { SearchFacets, SearchResult } from "@/features/search/domain/contracts";
import type { SearchQuery } from "@/features/search/domain/search-query";
import { PostgresSearchProvider } from "@/server/search/postgres-search-provider";
import { createPublicServerClient } from "@/server/supabase/public";

export type PublicSearchPageData =
  | Readonly<{ status: "ready"; result: SearchResult; facets: SearchFacets }>
  | Readonly<{ status: "unavailable"; result: null; facets: null }>;

export async function loadPublicSearch(query: SearchQuery): Promise<PublicSearchPageData> {
  try {
    const provider = new PostgresSearchProvider(createPublicServerClient());
    const [result, facets] = await Promise.all([provider.search(query), provider.facets()]);
    return { status: "ready", result, facets };
  } catch {
    return { status: "unavailable", result: null, facets: null };
  }
}

export async function loadFixedPublicSearch(
  constraints: Parameters<PostgresSearchProvider["searchFixed"]>[0],
  limit = 12,
) {
  try {
    const provider = new PostgresSearchProvider(createPublicServerClient());
    const result = await provider.searchFixed(constraints, limit);
    return { status: "ready" as const, properties: result.properties };
  } catch {
    return { status: "unavailable" as const, properties: [] as const };
  }
}
