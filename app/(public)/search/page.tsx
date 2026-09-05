import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { SearchEntryForm } from "@/components/search/search-entry-form";
import { parseSearchParams, type SearchParamsInput } from "@/features/search/domain/search-query";

export const metadata: Metadata = {
  title: "Search land",
  robots: { index: false, follow: true },
  alternates: { canonical: "/properties" },
};

export default async function SearchPage({
  searchParams,
}: Readonly<{ searchParams: Promise<SearchParamsInput> }>) {
  const input = await searchParams;
  if (Object.keys(input).length) {
    const parsed = parseSearchParams(input);
    permanentRedirect(
      parsed.canonicalQueryString ? `/properties?${parsed.canonicalQueryString}` : "/properties",
    );
  }
  return (
    <main>
      <section className="collection-hero">
        <div className="site-container py-14">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
          <p className="eyebrow mt-8">Property search</p>
          <h1 className="public-page-title mt-3 max-w-3xl text-white">Search published land.</h1>
          <div className="mt-8 max-w-3xl">
            <SearchEntryForm />
          </div>
        </div>
      </section>
    </main>
  );
}
