import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { JsonLd } from "@/components/public/json-ld";
import { SafeMarkdown } from "@/components/public/safe-markdown";
import { buildPublicBucketMediaUrl } from "@/lib/media/public-media-url";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { articleJsonLd } from "@/lib/seo/structured-data";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import {
  getPublicGuide,
  getPublicRedirect,
  listPublicGuides,
} from "@/server/queries/public-content";

type Props = Readonly<{ params: Promise<{ "guide-slug": string }> }>;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params)["guide-slug"];
  const guide = await getPublicGuide(slug);
  if (!guide) return { title: "Guide not found", robots: { index: false, follow: false } };
  const image = guide.hero
    ? buildPublicBucketMediaUrl("guide-media-public", guide.hero.objectPath)
    : null;
  return buildPublicMetadata({
    title: guide.seoTitle ?? guide.title,
    description: guide.seoDescription ?? guide.excerpt ?? guide.title,
    path: `/guides/${guide.slug}`,
    canonicalPath: guide.canonicalPath,
    robots: { index: true, follow: true },
    type: "article",
    publishedTime: guide.publishedAt,
    modifiedTime: guide.updatedAt,
    image:
      image && guide.hero
        ? {
            url: image,
            alt: guide.hero.altText,
            width: guide.hero.width,
            height: guide.hero.height,
          }
        : null,
  });
}

export default async function Page({ params }: Props) {
  const slug = (await params)["guide-slug"];
  const guide = await getPublicGuide(slug);
  if (!guide) {
    const redirect = await getPublicRedirect(`/guides/${slug}`);
    if (redirect) permanentRedirect(redirect.destinationPath);
    notFound();
  }
  const image = guide.hero
    ? buildPublicBucketMediaUrl("guide-media-public", guide.hero.objectPath)
    : null;
  const related = (await listPublicGuides(guide.categorySlug ?? undefined))
    .filter(({ id }) => id !== guide.id)
    .slice(0, 3);
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Guides", href: "/guides" },
    ...(guide.categoryName && guide.categorySlug
      ? [{ label: guide.categoryName, href: `/guides/category/${guide.categorySlug}` }]
      : []),
    { label: guide.title },
  ];
  return (
    <main className="guide-detail-page">
      <JsonLd
        data={articleJsonLd({
          title: guide.title,
          description: guide.seoDescription ?? guide.excerpt ?? guide.title,
          path: `/guides/${guide.slug}`,
          publishedAt: guide.publishedAt,
          updatedAt: guide.updatedAt,
          image,
        })}
      />
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <article>
        <header className="guide-article-header">
          <div className="site-container">
            <Breadcrumbs items={breadcrumbs} />
            <p className="eyebrow mt-8 text-[var(--brand-gold)]">
              {guide.categoryName ?? "Land guide"}
            </p>
            <h1>{guide.title}</h1>
            <p className="guide-excerpt">{guide.excerpt}</p>
            <p className="guide-date">
              Published{" "}
              {new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(
                new Date(guide.publishedAt),
              )}
              {guide.updatedAt !== guide.publishedAt
                ? ` · Updated ${new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(guide.updatedAt))}`
                : ""}
            </p>
          </div>
        </header>
        {image && guide.hero ? (
          <div className="site-container">
            <div className="guide-hero-image">
              <Image
                src={image}
                alt={guide.hero.altText}
                fill
                sizes="(max-width: 900px) 100vw, 900px"
              />
            </div>
          </div>
        ) : null}
        <div className="site-container guide-article-layout">
          <div className="guide-article-body">
            <SafeMarkdown value={guide.body} />
            <aside className="property-disclaimer">
              <strong>Educational scope</strong>
              <p>
                This guide supports preliminary understanding. Complete property-specific legal,
                revenue, planning, measurement, tax and transaction checks with appropriate
                professionals before proceeding.
              </p>
            </aside>
          </div>
          <aside className="guide-action-card">
            <p className="eyebrow">Your next step</p>
            <h2>Apply the guide to current land.</h2>
            <Link className="button button-gold" href="/properties">
              Explore published land
            </Link>
            <Link className="button button-outline" href="/requirements" prefetch={false}>
              Share a requirement
            </Link>
          </aside>
        </div>
      </article>
      {related.length ? (
        <section className="section section-light">
          <div className="site-container">
            <h2 className="section-title">Related guides</h2>
            <div className="mt-6 grid gap-4">
              {related.map((item) => (
                <Link className="text-link" href={`/guides/${item.slug}`} key={item.id}>
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
