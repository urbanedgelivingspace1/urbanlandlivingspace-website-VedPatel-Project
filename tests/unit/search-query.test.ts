import { describe, expect, it } from "vitest";

import {
  activeFilterCount,
  areaToSquareMetres,
  emptySearchQuery,
  hasIndexableSearchState,
  parseSearchParams,
  searchHref,
  withSearchChanges,
} from "@/features/search/domain/search-query";

describe("public search query contract", () => {
  it("creates the bounded canonical default", () => {
    const parsed = parseSearchParams({});
    expect(parsed.query).toMatchObject({
      page: 1,
      pageSize: 12,
      sort: "DEFAULT",
      areaUnit: "sq_ft",
    });
    expect(parsed.canonicalQueryString).toBe("");
    expect(parsed.shouldRedirect).toBe(false);
  });

  it("recognizes and canonicalizes an exact property ID entered as keyword", () => {
    const parsed = parseSearchParams({ q: "ue-ls-000123" });
    expect(parsed.query).toMatchObject({ keyword: null, propertyId: "UE-LS-000123" });
    expect(parsed.canonicalQueryString).toBe("propertyId=UE-LS-000123");
    expect(parsed.shouldRedirect).toBe(true);
  });

  it("normalizes repeated whitespace, parameter order and page one", () => {
    const parsed = parseSearchParams({ page: "1", transaction: "BUY", q: " Sanand   orchard " });
    expect(parsed.canonicalQueryString).toBe("q=Sanand+orchard&transaction=buy");
    expect(parsed.shouldRedirect).toBe(true);
  });

  it("drops unknown and invalid values", () => {
    const parsed = parseSearchParams({ category: "housing", sort: "random", bad: "private" });
    expect(parsed.query.category).toBeNull();
    expect(parsed.query.sort).toBe("DEFAULT");
    expect(parsed.canonicalQueryString).toBe("");
    expect(parsed.shouldRedirect).toBe(true);
  });

  it("swaps reversed ranges and omits zero bounds", () => {
    const parsed = parseSearchParams({
      minArea: "200",
      maxArea: "100",
      minPrice: "0",
      maxPrice: "500",
    });
    expect(parsed.query).toMatchObject({
      minimumArea: 100,
      maximumArea: 200,
      minimumPrice: null,
      maximumPrice: 500,
    });
  });

  it("makes POR mutually exclusive with numeric budget", () => {
    const parsed = parseSearchParams({ pricing: "por", minPrice: "100", maxPrice: "200" });
    expect(parsed.query).toMatchObject({ pricing: "POR", minimumPrice: null, maximumPrice: null });
    expect(parsed.canonicalQueryString).toBe("pricing=por");
  });

  it("retains only hierarchy-compatible geography", () => {
    expect(parseSearchParams({ taluka: "sanand", place: "iyava" }).query.taluka).toBeNull();
    expect(
      parseSearchParams({ district: "ahmedabad", taluka: "sanand", place: "iyava" }).query,
    ).toMatchObject({ district: "ahmedabad", taluka: "sanand", place: "iyava" });
  });

  it("retains category-specific filters only for their category", () => {
    expect(
      parseSearchParams({ category: "na", agriTenure: "old-tenure", naStatus: "approved" }).query,
    ).toMatchObject({ agriculturalTenure: null, naStatus: "approved" });
  });

  it("bounds pages and preserves filters while changing one dimension", () => {
    const query = parseSearchParams({ category: "industrial", page: "999999" }).query;
    expect(query.page).toBe(100);
    expect(searchHref(withSearchChanges(query, { sort: "NEWEST" }))).toBe(
      "/properties?category=industrial&sort=newest",
    );
  });

  it.each([
    ["recommended", "DEFAULT"],
    ["newest", "NEWEST"],
    ["oldest", "OLDEST"],
    ["price-asc", "PRICE_LOW"],
    ["price-desc", "PRICE_HIGH"],
    ["area-asc", "AREA_SMALL"],
    ["area-desc", "AREA_LARGE"],
  ] as const)("maps the %s sort to %s", (parameter, sort) => {
    expect(parseSearchParams({ sort: parameter }).query.sort).toBe(sort);
  });

  it("converts only supported strict area units to square metres", () => {
    expect(areaToSquareMetres(1, "acre")).toBeCloseTo(4046.8564224);
    expect(areaToSquareMetres(100, "sq_ft")).toBeCloseTo(9.290304);
  });

  it("distinguishes indexable discovery pages from filtered URLs", () => {
    expect(hasIndexableSearchState(emptySearchQuery())).toBe(true);
    expect(hasIndexableSearchState(parseSearchParams({ page: "2" }).query)).toBe(true);
    expect(hasIndexableSearchState(parseSearchParams({ q: "orchard" }).query)).toBe(false);
    expect(
      activeFilterCount(parseSearchParams({ category: "na", district: "ahmedabad" }).query),
    ).toBe(2);
  });
});
