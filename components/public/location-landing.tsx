import Link from "next/link";

import type { PublicSeoPage } from "@/features/content/domain/contracts";
import { collectionJsonLd } from "@/lib/seo/structured-data";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { loadFixedPublicSearch } from "@/server/queries/public-search";

import { Breadcrumbs } from "./breadcrumbs";
import { ArrowIcon } from "./icons";
import { JsonLd } from "./json-ld";
import { PropertyCollection } from "./property-collection";
import { SafeMarkdown } from "./safe-markdown";
import { SectionHeading } from "./section-heading";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate, type TranslationKey } from "@/lib/i18n/dictionaries";

const categoryPaths = {
  AGRICULTURAL: "agricultural-land",
  NA: "na-land",
  INDUSTRIAL: "industrial-land",
} as const;

const categoryTranslationKeys = {
  AGRICULTURAL: "nav.agricultural",
  NA: "nav.na",
  INDUSTRIAL: "nav.industrial",
} as const satisfies Record<keyof typeof categoryPaths, TranslationKey>;

export async function LocationLanding({
  page,
  city,
}: Readonly<{ page: PublicSeoPage; city: "ahmedabad" | "gandhinagar" }>) {
  const [inventory, locale] = await Promise.all([
    loadFixedPublicSearch({ district: city, category: page.category ?? undefined }, 12),
    getRequestLocale(),
  ]);
  const t = (key: TranslationKey) => translate(locale, key);
  const cityName = t(city === "ahmedabad" ? "common.ahmedabad" : "common.gandhinagar");
  const categoryName = page.category ? t(categoryTranslationKeys[page.category]) : null;
  const localizedTitle =
    locale === "en" ? page.title : `${categoryName ?? t("common.land")} — ${cityName}`;
  const localizedIntro = locale === "en" ? page.intro : t("location.localizedIntro");
  const localizedBody = locale === "en" ? (page.body ?? "") : t("location.localizedBody");
  const items = inventory.status === "ready" ? inventory.properties : [];
  const breadcrumbs = [
    { label: t("common.home"), href: "/" },
    ...(page.category
      ? [{ label: cityName, href: `/locations/${city}` }]
      : [{ label: t("common.locations") }]),
    { label: categoryName ?? cityName },
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
          <p className="eyebrow mt-8 text-[var(--brand-gold)]">{t("location.guide")}</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">{localizedTitle}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">{localizedIntro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="button button-gold" href="#location-inventory">
              {t("location.browse")} <ArrowIcon className="size-4" />
            </a>
            <Link
              className="button button-outline-light"
              href={`/requirements?district=${city}${page.category ? `&category=${page.category.toLowerCase()}` : ""}&source=LOCATION_PAGE`}
            >
              {t("common.shareRequirement")}
            </Link>
          </div>
        </div>
      </section>
      <section className="section section-light">
        <div className="site-container location-copy-grid">
          <article className="editorial-card">
            <SafeMarkdown value={localizedBody} />
          </article>
          <aside className="location-next-steps" aria-labelledby="location-next-steps">
            <p className="eyebrow">{t("location.exploreDeliberately")}</p>
            <h2 id="location-next-steps">{t("location.nextSteps")}</h2>
            <Link
              href={`/properties?district=${city}${page.category ? `&category=${page.category === "AGRICULTURAL" ? "agricultural" : page.category.toLowerCase()}` : ""}`}
            >
              {t("location.refine")} <ArrowIcon className="size-4" />
            </Link>
            <Link href="/guides">
              {t("common.readGuides")} <ArrowIcon className="size-4" />
            </Link>
            <Link href="/sell-your-land">
              {t("location.submit")} <ArrowIcon className="size-4" />
            </Link>
          </aside>
        </div>
      </section>
      {!page.category ? (
        <section className="section">
          <div className="site-container">
            <SectionHeading
              eyebrow={t("location.categories")}
              title={`Explore ${cityName} by land context`}
              description={t("location.categoryDescription")}
            />
            <div className="location-category-links mt-9">
              {Object.entries(categoryPaths).map(([category, path]) => (
                <Link key={path} href={`/locations/${city}/${path}`}>
                  <strong>
                    {t(categoryTranslationKeys[category as keyof typeof categoryPaths])}
                  </strong>
                  <span>{t("location.viewPage")}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <section id="location-inventory" className="section scroll-mt-24">
        <div className="site-container">
          <SectionHeading
            eyebrow={t("common.currentInventory")}
            title={`${categoryName ?? t("common.land")} — ${cityName}`}
            description={t("location.inventoryDescription")}
          />
          <div className="mt-10">
            <PropertyCollection
              result={inventory}
              emptyTitle={`No matching published land is currently available in ${cityName}.`}
              locale={locale}
            />
          </div>
        </div>
      </section>
      <section className="cta-band">
        <div className="site-container cta-band-inner">
          <div>
            <p className="eyebrow text-[var(--brand-gold)]">{t("location.differentFit")}</p>
            <h2>{t("location.differentFitTitle")}</h2>
          </div>
          <Link
            href={`/requirements?district=${city}&source=LOCATION_PAGE`}
            className="button button-gold"
          >
            {t("location.tellRequirement")} <ArrowIcon className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
