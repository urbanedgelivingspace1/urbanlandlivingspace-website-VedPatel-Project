import Link from "next/link";

import type { PublicGuide, PublicGuideCategory } from "@/features/content/domain/contracts";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { collectionJsonLd } from "@/lib/seo/structured-data";

import { Breadcrumbs } from "./breadcrumbs";
import { GuideCard } from "./guide-card";
import { JsonLd } from "./json-ld";

export function GuideIndex({
  guides,
  categories,
  title = "Land guides for clearer next steps",
  description = "Practical education for discovering, comparing and enquiring about land without replacing property-specific professional advice.",
  category,
}: Readonly<{
  guides: readonly PublicGuide[];
  categories: readonly PublicGuideCategory[];
  title?: string;
  description?: string;
  category?: PublicGuideCategory;
}>) {
  const path = category ? `/guides/category/${category.slug}` : "/guides";
  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(category ? [{ label: "Guides", href: "/guides" }] : []),
    { label: category?.name ?? "Guides" },
  ];
  return (
    <main>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <JsonLd
        data={collectionJsonLd({
          name: title,
          description,
          path,
          items: guides.map((guide) => ({
            title: guide.title,
            path: `/guides/${guide.slug}`,
          })),
        })}
      />
      <section className="collection-hero guides-hero">
        <div className="site-container py-14 sm:py-18 lg:py-22">
          <Breadcrumbs items={breadcrumbs} />
          <p className="eyebrow mt-8 text-[var(--brand-gold)]">UrbanEdge editorial</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">{description}</p>
        </div>
      </section>
      <section className="section section-light">
        <div className="site-container">
          <nav className="guide-category-nav" aria-label="Guide categories">
            <Link href="/guides">All guides</Link>
            {categories.map((category) => (
              <Link href={`/guides/category/${category.slug}`} key={category.id}>
                {category.name}
              </Link>
            ))}
          </nav>
          <div className="guide-grid mt-10">
            {guides.length ? (
              guides.map((guide) => <GuideCard guide={guide} key={guide.id} />)
            ) : (
              <div className="public-empty-state">
                <h2>No published guides in this category yet.</h2>
                <p>Explore current land or contact UrbanEdge while editorial review continues.</p>
                <Link className="button button-outline" href="/properties">
                  Explore land
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="cta-band">
        <div className="site-container cta-band-inner">
          <div>
            <p className="eyebrow text-[var(--brand-gold)]">Put the context to work</p>
            <h2>Explore published land or share a structured requirement.</h2>
          </div>
          <Link className="button button-gold" href="/properties">
            Explore land
          </Link>
        </div>
      </section>
    </main>
  );
}
