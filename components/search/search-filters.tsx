"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import type { SearchFacetOption, SearchFacets } from "@/features/search/domain/contracts";
import type { SearchQuery } from "@/features/search/domain/search-query";

function unique(options: readonly SearchFacetOption[]): SearchFacetOption[] {
  return [...new Map(options.map((option) => [option.value, option])).values()].sort((a, b) =>
    a.label.localeCompare(b.label),
  );
}

function SelectField({
  label,
  name,
  value,
  options,
  onChange,
}: Readonly<{
  label: string;
  name: string;
  value: string;
  options: readonly SearchFacetOption[];
  onChange?: (value: string) => void;
}>) {
  return (
    <label className="search-field">
      <span>{label}</span>
      <select name={name} defaultValue={value} onChange={(event) => onChange?.(event.target.value)}>
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
            {option.count ? ` (${option.count})` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterForm({
  query,
  facets,
  compact,
  onSubmit,
}: Readonly<{
  query: SearchQuery;
  facets: SearchFacets;
  compact?: boolean;
  onSubmit: () => void;
}>) {
  const [category, setCategory] = useState(query.category ?? "");
  const [district, setDistrict] = useState(query.district ?? "");
  const [taluka, setTaluka] = useState(query.taluka ?? "");
  const [place, setPlace] = useState(query.place ?? "");
  const districts = unique(facets.geography.map((item) => item.district));
  const talukas = unique(
    facets.geography
      .filter((item) => !district || item.district.value === district)
      .flatMap((item) => (item.taluka ? [item.taluka] : [])),
  );
  const places = unique(
    facets.geography
      .filter(
        (item) =>
          (!district || item.district.value === district) &&
          (!taluka || item.taluka?.value === taluka),
      )
      .flatMap((item) => (item.place ? [item.place] : [])),
  );
  const localities = unique(
    facets.geography
      .filter(
        (item) =>
          (!district || item.district.value === district) &&
          (!taluka || item.taluka?.value === taluka) &&
          (!place || item.place?.value === place),
      )
      .flatMap((item) => (item.locality ? [item.locality] : [])),
  );
  const availability = [
    { value: "available", label: "Available", count: 0 },
    { value: "under-negotiation", label: "Under negotiation", count: 0 },
    { value: "sold", label: "Sold", count: 0 },
    { value: "rented", label: "Rented", count: 0 },
    { value: "leased", label: "Leased", count: 0 },
  ];

  return (
    <form
      className={compact ? "search-filter-form is-compact" : "search-filter-form"}
      action="/properties"
      method="get"
      onSubmit={onSubmit}
    >
      <div className="search-field-grid">
        <label className="search-field search-field-wide">
          <span>Keyword or Property ID</span>
          <input
            name="q"
            defaultValue={query.keyword ?? query.propertyId ?? ""}
            maxLength={120}
            placeholder="Location, landmark or UE-LS-000123"
          />
        </label>
        <SelectField
          label="Land category"
          name="category"
          value={query.category?.toLowerCase() ?? ""}
          onChange={(value) => setCategory(value.toUpperCase())}
          options={[
            { value: "agricultural", label: "Agricultural", count: 0 },
            { value: "na", label: "NA land", count: 0 },
            { value: "industrial", label: "Industrial", count: 0 },
          ]}
        />
        <SelectField
          label="Transaction"
          name="transaction"
          value={query.transaction?.toLowerCase() ?? ""}
          options={[
            { value: "buy", label: "Buy", count: 0 },
            { value: "rent", label: "Rent", count: 0 },
            { value: "lease", label: "Lease", count: 0 },
          ]}
        />
        <SelectField
          label="District"
          name="district"
          value={query.district ?? ""}
          options={districts}
          onChange={(value) => {
            setDistrict(value);
            setTaluka("");
            setPlace("");
          }}
        />
        <SelectField
          label="Taluka"
          name="taluka"
          value={taluka}
          options={talukas}
          onChange={(value) => {
            setTaluka(value);
            setPlace("");
          }}
        />
        <SelectField
          label="Place / village"
          name="place"
          value={place}
          options={places}
          onChange={setPlace}
        />
        <SelectField
          label="Locality"
          name="locality"
          value={query.locality ?? ""}
          options={localities}
        />
        <SelectField
          label="Availability"
          name="availability"
          value={query.availability?.toLowerCase().replaceAll("_", "-") ?? ""}
          options={availability}
        />
        <SelectField
          label="Pricing"
          name="pricing"
          value={query.pricing?.toLowerCase() ?? ""}
          options={[
            { value: "listed", label: "Listed price", count: 0 },
            { value: "por", label: "Price on request", count: 0 },
          ]}
        />
        <label className="search-field">
          <span>Minimum price (₹)</span>
          <input
            name="minPrice"
            type="number"
            min="0"
            step="1"
            defaultValue={query.minimumPrice ?? ""}
          />
        </label>
        <label className="search-field">
          <span>Maximum price (₹)</span>
          <input
            name="maxPrice"
            type="number"
            min="0"
            step="1"
            defaultValue={query.maximumPrice ?? ""}
          />
        </label>
        <label className="search-field">
          <span>Minimum area</span>
          <input
            name="minArea"
            type="number"
            min="0"
            step="0.01"
            defaultValue={query.minimumArea ?? ""}
          />
        </label>
        <label className="search-field">
          <span>Maximum area</span>
          <input
            name="maxArea"
            type="number"
            min="0"
            step="0.01"
            defaultValue={query.maximumArea ?? ""}
          />
        </label>
        <SelectField
          label="Area unit"
          name="areaUnit"
          value={query.areaUnit}
          options={[
            { value: "sq_ft", label: "sq ft", count: 0 },
            { value: "sq_m", label: "sq m", count: 0 },
            { value: "sq_yd", label: "sq yd", count: 0 },
            { value: "var", label: "var", count: 0 },
            { value: "acre", label: "acre", count: 0 },
            { value: "hectare", label: "hectare", count: 0 },
          ]}
        />
        {category === "AGRICULTURAL" ? (
          <>
            <SelectField
              label="Tenure"
              name="agriTenure"
              value={query.agriculturalTenure ?? ""}
              options={facets.categorySpecific.agriculturalTenure}
            />
            <SelectField
              label="Irrigation"
              name="agriIrrigation"
              value={query.agriculturalIrrigation ?? ""}
              options={facets.categorySpecific.agriculturalIrrigation}
            />
          </>
        ) : null}
        {category === "NA" ? (
          <>
            <SelectField
              label="NA status"
              name="naStatus"
              value={query.naStatus ?? ""}
              options={facets.categorySpecific.naStatus}
            />
            <SelectField
              label="NA purpose"
              name="naPurpose"
              value={query.naPurpose ?? ""}
              options={facets.categorySpecific.naPurpose}
            />
          </>
        ) : null}
        {category === "INDUSTRIAL" ? (
          <>
            <SelectField
              label="Industrial type"
              name="industrialType"
              value={query.industrialType ?? ""}
              options={facets.categorySpecific.industrialType}
            />
            <SelectField
              label="Power"
              name="industrialPower"
              value={query.industrialPower ?? ""}
              options={facets.categorySpecific.industrialPower}
            />
          </>
        ) : null}
      </div>
      {query.sort !== "DEFAULT" ? (
        <input
          type="hidden"
          name="sort"
          value={
            {
              NEWEST: "newest",
              OLDEST: "oldest",
              PRICE_LOW: "price-asc",
              PRICE_HIGH: "price-desc",
              AREA_SMALL: "area-asc",
              AREA_LARGE: "area-desc",
              DEFAULT: "",
            }[query.sort]
          }
        />
      ) : null}
      <div className="search-filter-actions">
        <button className="button button-primary" type="submit">
          Apply filters
        </button>
        <Link className="button button-outline" href="/properties">
          Clear all
        </Link>
      </div>
    </form>
  );
}

export function SearchFilters({
  query,
  facets,
}: Readonly<{ query: SearchQuery; facets: SearchFacets }>) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement | null;
    const node = dialog.current;
    node?.querySelector<HTMLElement>("input,select,button,a")?.focus();
    document.body.style.overflow = "hidden";
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab" || !node) return;
      const focusable = [...node.querySelectorAll<HTMLElement>("input,select,button,a")];
      if (!focusable.length) return;
      const first = focusable[0]!;
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("keydown", handle);
      document.body.style.overflow = "";
      before?.focus();
    };
  }, [open]);

  return (
    <>
      <aside className="search-filter-rail" aria-label="Property filters">
        <div className="search-filter-heading">
          <p className="eyebrow">Refine results</p>
          <h2>Filters</h2>
        </div>
        <FilterForm query={query} facets={facets} onSubmit={() => setPending(true)} />
        {pending ? (
          <p className="search-pending" role="status">
            Updating results…
          </p>
        ) : null}
      </aside>
      <button
        className="button button-primary search-filter-trigger"
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        Filters
      </button>
      {open ? (
        <div
          className="search-sheet-backdrop"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOpen(false);
          }}
        >
          <div
            className="search-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={dialog}
          >
            <div className="search-sheet-header">
              <div>
                <p className="eyebrow">Refine results</p>
                <h2 id={titleId}>Property filters</h2>
              </div>
              <button type="button" aria-label="Close filters" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
            <FilterForm query={query} facets={facets} compact onSubmit={() => setPending(true)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
