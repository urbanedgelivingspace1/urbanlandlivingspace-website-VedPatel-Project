import Link from "next/link";

import type { PublicGuide, PublicGuideCategory } from "@/features/content/domain/contracts";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { collectionJsonLd } from "@/lib/seo/structured-data";

import { Breadcrumbs } from "./breadcrumbs";
import { GuideCard } from "./guide-card";
import { JsonLd } from "./json-ld";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate, type TranslationKey } from "@/lib/i18n/dictionaries";

export async function GuideIndex({
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
  const locale = await getRequestLocale();
  const t = (key: TranslationKey) => translate(locale, key);
  const localizedTitle = title === "Land guides for clearer next steps" ? t("guides.title") : title;
  const localizedDescription = description.startsWith("Practical education for discovering")
    ? t("guides.description")
    : description;
  const path = category ? `/guides/category/${category.slug}` : "/guides";
  const breadcrumbs = [
    { label: t("common.home"), href: "/" },
    ...(category ? [{ label: t("nav.guides"), href: "/guides" }] : []),
    { label: category?.name ?? t("nav.guides") },
  ];
  return (
    <main>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <JsonLd
        data={collectionJsonLd({
          name: localizedTitle,
          description: localizedDescription,
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
          <p className="eyebrow mt-8 text-[var(--brand-gold)]">{t("guides.editorial")}</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">{localizedTitle}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">{localizedDescription}</p>
        </div>
      </section>
      <section className="section section-light">
        <div className="site-container">
          <nav className="guide-category-nav" aria-label={t("guides.categories")}>
            <Link href="/guides">{t("guides.all")}</Link>
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
                <h2>{t("guides.empty")}</h2>
                <p>{t("guides.emptyBody")}</p>
                <Link className="button button-outline" href="/properties">
                  {t("common.exploreLand")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="cta-band">
        <div className="site-container cta-band-inner">
          <div>
            <p className="eyebrow text-[var(--brand-gold)]">{t("guides.context")}</p>
            <h2>{t("guides.cta")}</h2>
          </div>
          <Link className="button button-gold" href="/properties">
            {t("common.exploreLand")}
          </Link>
        </div>
      </section>
    </main>
  );
}
