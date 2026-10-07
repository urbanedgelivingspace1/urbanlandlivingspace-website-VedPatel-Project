import type { Metadata } from "next";
import Link from "next/link";

import { ArrowIcon, CheckIcon, CompassIcon, PhoneIcon } from "@/components/public/icons";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { siteConfig } from "@/config/site";
import { PropertyCollection } from "@/components/public/property-collection";
import { JsonLd } from "@/components/public/json-ld";
import { SectionHeading } from "@/components/public/section-heading";
import { SearchEntryForm } from "@/components/search/search-entry-form";
import { loadPublicBusinessConfig, loadPublicInventory } from "@/server/queries/public-page-data";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { buildTelephoneUrl, buildWhatsAppUrl } from "@/lib/config/public-business";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPublicMetadata({
  title: siteConfig.name,
  absoluteTitle: true,
  description: siteConfig.description,
  path: "/",
  robots: { index: true, follow: true },
});

const categories = [
  {
    href: "/agricultural-land",
    index: "01",
    titleKey: "nav.agricultural",
    textKey: "home.agriculturalBody",
  },
  {
    href: "/na-land",
    index: "02",
    titleKey: "nav.na",
    textKey: "home.naBody",
  },
  {
    href: "/industrial-land",
    index: "03",
    titleKey: "nav.industrial",
    textKey: "home.industrialBody",
  },
] as const satisfies readonly Readonly<{
  href: string;
  index: string;
  titleKey: Parameters<typeof translate>[1];
  textKey: Parameters<typeof translate>[1];
}>[];

export default async function HomePage() {
  const [featured, config, locale] = await Promise.all([
    loadPublicInventory({ featuredOnly: true, limit: 6 }),
    loadPublicBusinessConfig(),
    getRequestLocale(),
  ]);
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const telephone = buildTelephoneUrl(config);
  const whatsapp = buildWhatsAppUrl(config);
  return (
    <main>
      <JsonLd data={organizationJsonLd(config)} />
      <JsonLd data={websiteJsonLd()} />
      <section className="home-hero">
        <div className="survey-lines" aria-hidden="true" />
        <div className="site-container relative z-10 grid gap-10 py-14 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-20">
          <div>
            <p className="eyebrow text-[var(--brand-gold)]">{t("home.area")}</p>
            <h1 className="hero-title mt-4">
              {t("home.titleLead")}
              <br />
              <em>{t("home.titlePlace")}</em>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              {t("home.intro")}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/properties" className="button button-gold">
                {t("home.explore")} <ArrowIcon className="size-4" />
              </Link>
              <Link href="/sell-your-land" className="button button-outline-light">
                {t("home.sell")}
              </Link>
            </div>
          </div>
          <div className="discovery-panel" aria-labelledby="discovery-heading">
            <span className="discovery-index">{t("home.searchLabel")}</span>
            <h2 id="discovery-heading">{t("home.searchTitle")}</h2>
            <p>{t("home.searchBody")}</p>
            <div className="mt-5">
              <SearchEntryForm />
            </div>
            <div className="discovery-transactions" aria-label={t("home.quickTransactions")}>
              <Link href="/buy">{t("home.browseBuy")}</Link>
              <Link href="/rent">{t("home.browseRent")}</Link>
              <Link href="/lease">{t("home.browseLease")}</Link>
            </div>
          </div>
        </div>
        <div className="hero-proof">
          <div className="site-container grid gap-px sm:grid-cols-3">
            <span>
              <strong>{t("home.proofAreaTitle")}</strong> {t("home.proofAreaBody")}
            </span>
            <span>
              <strong>{t("home.proofTypesTitle")}</strong> {t("home.proofTypesBody")}
            </span>
            <span>
              <strong>{t("home.proofSupportTitle")}</strong> {t("home.proofSupportBody")}
            </span>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="site-container">
          <SectionHeading
            eyebrow={t("home.categoriesEyebrow")}
            title={t("home.categoriesTitle")}
            description={t("home.categoriesBody")}
          />
          <div className="category-card-grid mt-10">
            {categories.map((category) => (
              <Link href={category.href} className="category-card" key={category.href}>
                <span>{category.index}</span>
                <h3>{t(category.titleKey)}</h3>
                <p>{t(category.textKey)}</p>
                <b>
                  {t("home.exploreCategory")} <ArrowIcon className="size-4" />
                </b>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow={t("home.featuredEyebrow")}
              title={t("home.featuredTitle")}
              description={t("home.featuredBody")}
            />
            <Link href="/properties" className="text-link shrink-0">
              {t("home.viewAll")} <ArrowIcon className="size-4" />
            </Link>
          </div>
          <div className="mt-10">
            <PropertyCollection
              result={featured}
              emptyTitle={t("home.emptyTitle")}
              emptyBody={t("home.emptyBody")}
              contactConfig={config}
              locale={locale}
            />
          </div>
        </div>
      </section>

      <section className="requirement-band">
        <div className="site-container requirement-band-inner">
          <div>
            <p className="eyebrow">{t("home.requirementEyebrow")}</p>
            <h2>{t("home.requirementTitle")}</h2>
            <p>{t("home.requirementBody")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/requirements" className="button button-primary">
              {t("common.shareYourRequirement")}
            </Link>
            {whatsapp ? (
              <a
                className="button button-whatsapp"
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon className="size-4" /> {t("nav.whatsapp")}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section trust-section">
        <div className="site-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow text-[var(--brand-gold)]">{t("home.whyEyebrow")}</p>
            <h2 className="section-title mt-3 text-white">{t("home.whyTitle")}</h2>
            <span className="gold-rule" />
            <p className="mt-5 max-w-xl leading-8 text-slate-300">{t("home.whyBody")}</p>
          </div>
          <div className="trust-grid">
            {[
              t("home.trustLocal"),
              t("home.trustBuyers"),
              t("home.trustOwners"),
              t("home.trustReferences"),
              t("home.trustReview"),
              t("home.trustVisits"),
            ].map((item) => (
              <div key={item}>
                <CheckIcon className="size-5" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="site-container">
          <SectionHeading
            eyebrow={t("home.journeyEyebrow")}
            title={t("home.journeyTitle")}
            align="center"
          />
          <ol className="process-grid mt-12">
            {[
              ["01", t("home.step1Title"), t("home.step1Body")],
              ["02", t("home.step2Title"), t("home.step2Body")],
              ["03", t("home.step3Title"), t("home.step3Body")],
              ["04", t("home.step4Title"), t("home.step4Body")],
              ["05", t("home.step5Title"), t("home.step5Body")],
            ].map(([number, title, description]) => (
              <li key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section service-area-section">
        <div className="site-container grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow={t("home.serviceEyebrow")}
              title={t("home.serviceTitle")}
              description={t("home.serviceBody")}
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/locations/ahmedabad" className="button button-primary">
                {t("home.ahmedabadLand")}
              </Link>
              <Link href="/locations/gandhinagar" className="button button-outline">
                {t("home.gandhinagarLand")}
              </Link>
            </div>
          </div>
          <div className="service-area-card">
            <CompassIcon className="size-8" />
            <p>{t("home.corridor")}</p>
            <h3>
              {t("common.ahmedabad")} <span>↔</span> {t("common.gandhinagar")}
            </h3>
            <small>{t("home.corridorBody")}</small>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="verification-panel">
            <p className="eyebrow">{t("home.reviewEyebrow")}</p>
            <h2>{t("home.reviewTitle")}</h2>
            <p>{t("home.reviewBody")}</p>
            <div className="scope-example">
              <span>{t("home.reviewLabel")}</span>
              <strong>{t("home.reviewScope")}</strong>
              <small>{t("home.reviewLimits")}</small>
            </div>
          </div>
          <div className="guide-preview">
            <p className="eyebrow">{t("home.guidesEyebrow")}</p>
            <h2>{t("home.guidesTitle")}</h2>
            <p>{t("home.guidesBody")}</p>
            <Link className="text-link mt-5" href="/guides">
              {t("common.readGuides")} <ArrowIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="sell-band">
        <div className="site-container grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow text-[var(--brand-gold)]">{t("home.ownersEyebrow")}</p>
            <h2>{t("home.ownersTitle")}</h2>
            <p>{t("home.ownersBody")}</p>
          </div>
          <Link href="/sell-your-land" className="button button-gold">
            {t("home.shareLand")} <ArrowIcon className="size-4" />
          </Link>
        </div>
      </section>
      <section className="final-band">
        <div className="site-container text-center">
          <p className="eyebrow">{t("home.finalEyebrow")}</p>
          <h2>{t("home.finalTitle")}</h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/properties" className="button button-primary">
              {t("common.exploreLand")}
            </Link>
            <Link href="/requirements" className="button button-outline">
              {t("location.tellRequirement")}
            </Link>
            {telephone ? (
              <a className="button button-outline" href={telephone}>
                <PhoneIcon className="size-4" /> {t("common.callUrbanEdge")}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
