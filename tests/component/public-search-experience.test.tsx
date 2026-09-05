import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SearchActiveFilters } from "@/components/search/search-active-filters";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchPagination } from "@/components/search/search-pagination";
import { SearchResults } from "@/components/search/search-results";
import { emptySearchQuery, parseSearchParams } from "@/features/search/domain/search-query";
import { buildPublicPropertyCard } from "@/tests/builders/public-property";

const facets = {
  geography: [
    {
      district: { value: "ahmedabad", label: "Ahmedabad", count: 0 },
      taluka: { value: "sanand", label: "Sanand", count: 0 },
      place: { value: "iyava", label: "Iyava", count: 0 },
      locality: null,
    },
  ],
  categorySpecific: {
    agriculturalTenure: [{ value: "old-tenure", label: "Old tenure", count: 2 }],
    agriculturalIrrigation: [],
    naStatus: [],
    naPurpose: [],
    industrialType: [],
    industrialPower: [],
  },
} as const;

describe("M11 public search experience", () => {
  it("renders canonical cards and a result count", () => {
    render(
      <SearchResults
        query={emptySearchQuery()}
        result={{
          properties: [buildPublicPropertyCard()],
          totalCount: 1,
          page: 1,
          pageSize: 12,
          totalPages: 1,
        }}
      />,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Synthetic agricultural land/ })).toHaveAttribute(
      "href",
      "/properties/synthetic-agricultural-land",
    );
  });

  it("renders recovery paths for a valid zero-result search", () => {
    render(
      <SearchResults
        query={parseSearchParams({ q: "missing" }).query}
        result={{ properties: [], totalCount: 0, page: 1, pageSize: 12, totalPages: 0 }}
      />,
    );
    expect(screen.getByRole("heading", { name: /No published land matches/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clear filters" })).toHaveAttribute(
      "href",
      "/properties",
    );
  });

  it("uses removable canonical active-filter chips", () => {
    render(
      <SearchActiveFilters
        query={parseSearchParams({ category: "na", district: "ahmedabad" }).query}
      />,
    );
    expect(screen.getByRole("link", { name: /Category: NA/ })).toHaveAttribute(
      "href",
      "/properties?district=ahmedabad",
    );
  });

  it("opens and closes the accessible mobile filter dialog", async () => {
    const user = userEvent.setup();
    render(<SearchFilters query={emptySearchQuery()} facets={facets} />);
    await user.click(screen.getByRole("button", { name: "Filters" }));
    expect(screen.getByRole("dialog", { name: "Property filters" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("preserves query state through numbered pagination", () => {
    render(
      <SearchPagination
        query={parseSearchParams({ category: "industrial", page: "2" }).query}
        totalPages={4}
      />,
    );
    expect(screen.getByRole("link", { name: "3" })).toHaveAttribute(
      "href",
      "/properties?category=industrial&page=3",
    );
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
  });
});
