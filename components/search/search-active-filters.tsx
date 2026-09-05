import Link from "next/link";

import {
  searchHref,
  withSearchChanges,
  type SearchQuery,
} from "@/features/search/domain/search-query";

export function SearchActiveFilters({ query }: Readonly<{ query: SearchQuery }>) {
  const filters: Array<{ label: string; change: Partial<SearchQuery> }> = [];
  const add = (value: unknown, label: string, change: Partial<SearchQuery>) => {
    if (value) filters.push({ label, change });
  };
  add(query.keyword, `Keyword: ${query.keyword}`, { keyword: null });
  add(query.propertyId, `ID: ${query.propertyId}`, { propertyId: null });
  add(query.category, `Category: ${query.category}`, {
    category: null,
    agriculturalTenure: null,
    agriculturalIrrigation: null,
    naStatus: null,
    naPurpose: null,
    industrialType: null,
    industrialPower: null,
  });
  add(query.transaction, `Transaction: ${query.transaction}`, { transaction: null });
  add(query.district, `District: ${query.district}`, {
    district: null,
    taluka: null,
    place: null,
    locality: null,
  });
  add(query.taluka, `Taluka: ${query.taluka}`, { taluka: null, place: null, locality: null });
  add(query.place, `Place: ${query.place}`, { place: null, locality: null });
  add(query.locality, `Locality: ${query.locality}`, { locality: null });
  add(query.availability, `Status: ${query.availability}`, { availability: null });
  add(query.pricing, `Pricing: ${query.pricing}`, { pricing: null });
  if (query.minimumPrice !== null || query.maximumPrice !== null)
    filters.push({
      label: `Price: ₹${query.minimumPrice ?? 0}–${query.maximumPrice ?? "any"}`,
      change: { minimumPrice: null, maximumPrice: null },
    });
  if (query.minimumArea !== null || query.maximumArea !== null)
    filters.push({
      label: `Area: ${query.minimumArea ?? 0}–${query.maximumArea ?? "any"} ${query.areaUnit}`,
      change: { minimumArea: null, maximumArea: null },
    });
  for (const [value, label, key] of [
    [query.agriculturalTenure, "Tenure", "agriculturalTenure"],
    [query.agriculturalIrrigation, "Irrigation", "agriculturalIrrigation"],
    [query.naStatus, "NA status", "naStatus"],
    [query.naPurpose, "NA purpose", "naPurpose"],
    [query.industrialType, "Industrial type", "industrialType"],
    [query.industrialPower, "Power", "industrialPower"],
  ] as const)
    add(value, `${label}: ${value}`, { [key]: null });
  if (!filters.length) return null;
  return (
    <div className="search-chips" aria-label="Active filters">
      {filters.map((filter) => (
        <Link key={filter.label} href={searchHref(withSearchChanges(query, filter.change))}>
          {filter.label}
          <span aria-hidden="true">×</span>
        </Link>
      ))}
      <Link className="clear" href="/properties">
        Clear all
      </Link>
    </div>
  );
}
