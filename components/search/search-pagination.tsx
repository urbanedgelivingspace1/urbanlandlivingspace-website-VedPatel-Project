import Link from "next/link";
import {
  searchHref,
  withSearchChanges,
  type SearchQuery,
} from "@/features/search/domain/search-query";

export function SearchPagination({
  query,
  totalPages,
}: Readonly<{ query: SearchQuery; totalPages: number }>) {
  if (totalPages <= 1) return null;
  const start = Math.max(1, Math.min(query.page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  return (
    <nav className="search-pagination" aria-label="Search result pages">
      {query.page > 1 ? (
        <Link href={searchHref(withSearchChanges(query, { page: query.page - 1 }))}>Previous</Link>
      ) : (
        <span>Previous</span>
      )}
      {pages.map((page) => (
        <Link
          key={page}
          href={searchHref(withSearchChanges(query, { page }))}
          aria-current={page === query.page ? "page" : undefined}
        >
          {page}
        </Link>
      ))}
      {query.page < totalPages ? (
        <Link href={searchHref(withSearchChanges(query, { page: query.page + 1 }))}>Next</Link>
      ) : (
        <span>Next</span>
      )}
    </nav>
  );
}
