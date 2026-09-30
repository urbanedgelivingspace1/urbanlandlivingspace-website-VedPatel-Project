import Link from "next/link";

import { PropertyCard } from "@/components/public/property-card";
import type { SearchResult } from "@/features/search/domain/contracts";
import { activeFilterCount, type SearchQuery } from "@/features/search/domain/search-query";
import { requirementHref } from "@/features/intake/domain/prefill";

export function SearchResults({
  query,
  result,
}: Readonly<{ query: SearchQuery; result: SearchResult | null }>) {
  if (!result)
    return (
      <div className="empty-state" role="status">
        <p className="eyebrow">Temporarily unavailable</p>
        <h3>Search is unavailable right now.</h3>
        <p>Please try again shortly or contact UrbanEdge for help with your land requirement.</p>
        <div className="empty-state-actions">
          <Link className="button button-primary" href="/properties">
            Retry
          </Link>
          <Link className="button button-outline" href="/contact" prefetch={false}>
            Contact UrbanEdge
          </Link>
        </div>
      </div>
    );
  if (!result.properties.length)
    return (
      <div className="empty-state search-zero-state">
        <p className="eyebrow">No matches</p>
        <h3>No published land matches this combination.</h3>
        <p>
          Remove one or two filters, explore a land category, or share a requirement for a more
          specific search.
        </p>
        <div className="search-zero-actions">
          <Link className="button button-primary" href="/properties">
            Clear filters
          </Link>
          <Link className="button button-outline" href="/agricultural-land">
            Agricultural land
          </Link>
          <Link className="button button-outline" href="/na-land">
            NA land
          </Link>
          <Link className="button button-outline" href="/industrial-land">
            Industrial land
          </Link>
          <Link className="button button-outline" href={requirementHref(query)} prefetch={false}>
            Share a requirement
          </Link>
        </div>
      </div>
    );
  return (
    <>
      <p className="search-result-summary" role="status">
        <strong>{result.totalCount}</strong> published{" "}
        {result.totalCount === 1 ? "property" : "properties"}
        {activeFilterCount(query) ? " matching your filters" : ""}
      </p>
      <div className="property-grid">
        {result.properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </>
  );
}
