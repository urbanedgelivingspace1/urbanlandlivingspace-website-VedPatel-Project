import "server-only";

import { unstable_cache } from "next/cache";

import type { SearchFacets, SearchResult } from "@/features/search/domain/contracts";
import type { SearchQuery } from "@/features/search/domain/search-query";
import { PostgresSearchProvider } from "@/server/search/postgres-search-provider";
import { createPublicServerClient } from "@/server/supabase/public";

export type PublicSearchPageData =
  | Readonly<{ status: "ready"; result: SearchResult; facets: SearchFacets }>
  | Readonly<{ status: "unavailable"; result: null; facets: null }>;

const loadCachedSearchResult = unstable_cache(
  async (query: SearchQuery): Promise<SearchResult> => {
    const provider = new PostgresSearchProvider(createPublicServerClient());
    return provider.search(query);
  },
  ["public-search-results"],
  { revalidate: 60, tags: ["public-properties"] },
);

const loadCachedSearchFacets = unstable_cache(
  async (): Promise<SearchFacets> => {
    const provider = new PostgresSearchProvider(createPublicServerClient());
    return provider.facets();
  },
  ["public-search-facets"],
  { revalidate: 300, tags: ["public-properties", "public-reference-data"] },
);

const loadCachedFixedPublicSearch = unstable_cache(
  async (constraints: Parameters<PostgresSearchProvider["searchFixed"]>[0], limit: number) => {
    const provider = new PostgresSearchProvider(createPublicServerClient());
    return provider.searchFixed(constraints, limit);
  },
  ["public-fixed-search"],
  { revalidate: 60, tags: ["public-properties"] },
);

function publicSearchProvider() {
  return new PostgresSearchProvider(createPublicServerClient());
}

export async function loadPublicSearch(query: SearchQuery): Promise<PublicSearchPageData> {
  try {
    if (process.env.APP_ENV === "test") {
      const provider = publicSearchProvider();
      const [result, facets] = await Promise.all([provider.search(query), provider.facets()]);
      return { status: "ready", result, facets };
    }
    const [result, facets] = await Promise.all([
      loadCachedSearchResult(query),
      loadCachedSearchFacets(),
    ]);
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
    const result =
      process.env.APP_ENV === "test"
        ? await publicSearchProvider().searchFixed(constraints, limit)
        : await loadCachedFixedPublicSearch(constraints, limit);
    return { status: "ready" as const, properties: result.properties };
  } catch {
    return { status: "unavailable" as const, properties: [] as const };
  }
}
