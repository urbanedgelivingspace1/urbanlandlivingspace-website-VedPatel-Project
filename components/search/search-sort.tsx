import type { SearchQuery } from "@/features/search/domain/search-query";
import { serializeSearchQuery, withSearchChanges } from "@/features/search/domain/search-query";

export function SearchSortControl({ query }: Readonly<{ query: SearchQuery }>) {
  const parameters = new URLSearchParams(
    serializeSearchQuery(withSearchChanges(query, { sort: "DEFAULT" })),
  );
  return (
    <form action="/properties" method="get" className="search-sort">
      {[...parameters].map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <label>
        <span>Sort by</span>
        <select
          name="sort"
          defaultValue={
            {
              DEFAULT: "recommended",
              NEWEST: "newest",
              OLDEST: "oldest",
              PRICE_LOW: "price-asc",
              PRICE_HIGH: "price-desc",
              AREA_SMALL: "area-asc",
              AREA_LARGE: "area-desc",
            }[query.sort]
          }
        >
          <option value="recommended">Recommended</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="area-asc">Area: small to large</option>
          <option value="area-desc">Area: large to small</option>
        </select>
      </label>
      <button className="button button-outline button-compact" type="submit">
        Sort
      </button>
    </form>
  );
}
