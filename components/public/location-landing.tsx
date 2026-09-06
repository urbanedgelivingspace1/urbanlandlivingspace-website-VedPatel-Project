import Link from "next/link";

import type { PublicSeoPage } from "@/features/content/domain/contracts";
import { categoryLabels } from "@/lib/formatting/property-values";
import { collectionJsonLd } from "@/lib/seo/structured-data";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { loadFixedPublicSearch } from "@/server/queries/public-search";

import { Breadcrumbs } from "./breadcrumbs";
import { ArrowIcon } from "./icons";
import { JsonLd } from "./json-ld";
import { PropertyCollection } from "./property-collection";
import { SafeMarkdown } from "./safe-markdown";
import { SectionHeading } from "./section-heading";

const categoryPaths = {
  AGRICULTURAL: "agricultural-land",
  NA: "na-land",
  INDUSTRIAL: "industrial-land",
} as const;

export async function LocationLanding({
  page,
  city,
}: Readonly<{ page: PublicSeoPage; city: "ahmedabad" | "gandhinagar" }>) {
  const inventory = await loadFixedPublicSearch(
    { district: city, category: page.category ?? undefined },
    12,
  );
  const cityName = city === "ahmedabad" ? "Ahmedabad" : "Gandhinagar";
  const items = inventory.status === "ready" ? inventory.properties : [];
  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(page.category
      ? [{ label: cityName, href: `/locations/${city}` }]
      : [{ label: "Locations" }]),
    { label: page.category ? categoryLabels[page.category] : cityName },
  ];
  return (
    <main>
      <JsonLd
        data={collectionJsonLd({
          name: page.title,
          description: page.intro ?? page.title,
          path: `/${page.slug}`,
          items,
        })}
      />
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <section className="collection-hero location-hero">
        <div className="site-container py-14 sm:py-18 lg:py-22">
          <Breadcrumbs items={breadcrumbs} />
          <p className="eyebrow mt-8 text-[var(--brand-gold)]">Curated location guide</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">{page.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">{page.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="button button-gold" href="#location-inventory">
              Browse published land <ArrowIcon className="size-4" />
            </a>
            <Link
              className="button button-outline-light"
              href={`/requirements?district=${city}${page.category ? `&category=${page.category.toLowerCase()}` : ""}&source=LOCATION_PAGE`}
              prefetch={false}
            >
              Share your requirement
            </Link>
          </div>
        </div>
      </section>
      <section className="section section-light">
        <div className="site-container location-copy-grid">
          <article className="editorial-card">
            <SafeMarkdown value={page.body ?? ""} />
          </article>
          <aside className="location-next-steps" aria-labelledby="location-next-steps">
            <p className="eyebrow">Explore deliberately</p>
            <h2 id="location-next-steps">Useful next steps</h2>
            <Link
              href={`/properties?district=${city}${page.category ? `&category=${page.category === "AGRICULTURAL" ? "agricultural" : page.category.toLowerCase()}` : ""}`}
            >
              Refine this published search <ArrowIcon className="size-4" />
            </Link>
            <Link href="/guides">
              Read land guides <ArrowIcon className="size-4" />
            </Link>
            <Link href="/sell-your-land" prefetch={false}>
              Submit land for review <ArrowIcon className="size-4" />
            </Link>
          </aside>
        </div>
      </section>
      {!page.category ? (
        <section className="section">
          <div className="site-container">
            <SectionHeading
              eyebrow="Land categories"
              title={`Explore ${cityName} by land context`}
              description="Each category keeps its own public facts and professional-checking limits."
            />
            <div className="location-category-links mt-9">
              {Object.entries(categoryPaths).map(([category, path]) => (
                <Link key={path} href={`/locations/${city}/${path}`}>
                  <strong>{categoryLabels[category as keyof typeof categoryPaths]}</strong>
                  <span>View the curated page</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <section id="location-inventory" className="section scroll-mt-24">
        <div className="site-container">
          <SectionHeading
            eyebrow="Current published inventory"
            title={`${page.category ? categoryLabels[page.category] : "Land"} in ${cityName}`}
            description="Only public, published listings are shown. Closed and private inventory does not count as active supply."
          />
          <div className="mt-10">
            <PropertyCollection
              result={inventory}
              emptyTitle={`No matching published land is currently available in ${cityName}.`}
            />
          </div>
        </div>
      </section>
      <section className="cta-band">
        <div className="site-container cta-band-inner">
          <div>
            <p className="eyebrow text-[var(--brand-gold)]">Need a different fit?</p>
            <h2>Share the location, category and scale you need.</h2>
          </div>
          <Link
            href={`/requirements?district=${city}&source=LOCATION_PAGE`}
            className="button button-gold"
            prefetch={false}
          >
            Tell UrbanEdge your requirement <ArrowIcon className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
