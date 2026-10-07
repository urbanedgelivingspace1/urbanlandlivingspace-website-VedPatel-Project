import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { JsonLd } from "@/components/public/json-ld";
import { SearchActiveFilters } from "@/components/search/search-active-filters";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchPagination } from "@/components/search/search-pagination";
import { SearchResults } from "@/components/search/search-results";
import { SearchSortControl } from "@/components/search/search-sort";
import {
  activeFilterCount,
  hasIndexableSearchState,
  parseSearchParams,
  searchHref,
  type SearchParamsInput,
} from "@/features/search/domain/search-query";
import { loadPublicSearch } from "@/server/queries/public-search";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";
type PageProps = Readonly<{ searchParams: Promise<SearchParamsInput> }>;

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { query } = parseSearchParams(await searchParams);
  const canonical = searchHref(query);
  return {
    title: query.page > 1 ? `Land Properties — Page ${query.page}` : "Land Properties",
    description:
      "Search UrbanEdge's published Agricultural, NA and Industrial land across Ahmedabad and Gandhinagar.",
    alternates: { canonical },
    robots: { index: hasIndexableSearchState(query), follow: true },
    openGraph: {
      title: "Land Properties | UrbanEdge Land Space",
      description: "Curated published land across Ahmedabad and Gandhinagar.",
      url: canonical,
      type: "website",
    },
  };
}

const emptyFacets = {
  geography: [],
  categorySpecific: {
    agriculturalTenure: [],
    agriculturalIrrigation: [],
    naStatus: [],
    naPurpose: [],
    industrialType: [],
    industrialPower: [],
  },
} as const;

export default async function PropertiesPage({ searchParams }: PageProps) {
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const parsed = parseSearchParams(await searchParams);
  if (parsed.shouldRedirect)
    permanentRedirect(
      parsed.canonicalQueryString ? `/properties?${parsed.canonicalQueryString}` : "/properties",
    );
  const data = await loadPublicSearch(parsed.query);
  if (
    data.status === "ready" &&
    parsed.query.page > 1 &&
    (data.result.totalPages === 0 || parsed.query.page > data.result.totalPages)
  )
    notFound();
  const facets = data.status === "ready" ? data.facets : emptyFacets;
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: t("properties.breadcrumb") }];
  return (
    <main>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <section className="collection-hero search-hero">
        <div className="site-container py-10 sm:py-14">
          <Breadcrumbs items={breadcrumbs} />
          <p className="eyebrow mt-7 text-[var(--brand-gold)]">{t("properties.eyebrow")}</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">{t("properties.title")}</h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-200">{t("properties.description")}</p>
        </div>
      </section>
      <section className="search-section">
        <div className="site-container">
          {data.status === "ready" ? <SearchActiveFilters query={parsed.query} /> : null}
          <div className="search-mobile-toolbar">
            <SearchFilters query={parsed.query} facets={facets} />
          </div>
          <div className="search-workspace">
            {data.status === "ready" ? (
              <SearchFilters query={parsed.query} facets={facets} />
            ) : (
              <aside className="search-filter-rail">
                <p>Filters are temporarily unavailable.</p>
              </aside>
            )}
            <div className="search-results-panel">
              <div className="search-results-heading">
                <div>
                  <p className="eyebrow">{t("properties.inventory")}</p>
                  <h2>
                    {activeFilterCount(parsed.query)
                      ? t("properties.filtered")
                      : t("properties.all")}
                  </h2>
                </div>
                {data.status === "ready" ? <SearchSortControl query={parsed.query} /> : null}
              </div>
              <SearchResults
                query={parsed.query}
                result={data.status === "ready" ? data.result : null}
              />
              {data.status === "ready" ? (
                <SearchPagination query={parsed.query} totalPages={data.result.totalPages} />
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
