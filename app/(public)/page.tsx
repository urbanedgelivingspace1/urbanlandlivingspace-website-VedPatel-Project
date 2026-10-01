import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowIcon,
  CheckIcon,
  CompassIcon,
  MessageIcon,
  PhoneIcon,
} from "@/components/public/icons";
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
  title: "Curated Land in Ahmedabad & Gandhinagar",
  description:
    "Discover curated Agricultural, NA and Industrial land with UrbanEdge guidance across Ahmedabad and Gandhinagar.",
  path: "/",
  robots: { index: true, follow: true },
});

const categories = [
  {
    href: "/agricultural-land",
    index: "01",
    title: "Agricultural Land",
    text: "Location, access, irrigation, tenure and the land context that shapes agricultural use.",
  },
  {
    href: "/na-land",
    index: "02",
    title: "NA Land",
    text: "NA status, permitted purpose, area, access and the commercial context around each site.",
  },
  {
    href: "/industrial-land",
    index: "03",
    title: "Industrial Land",
    text: "Industrial use, infrastructure, connectivity, power and access context for operations.",
  },
] as const;

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
        <div className="site-container relative z-10 grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-28">
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
              <Link href="/sell-your-land" className="button button-outline-light" prefetch={false}>
                {t("home.sell")}
              </Link>
            </div>
          </div>
          <div className="discovery-panel" aria-labelledby="discovery-heading">
            <span className="discovery-index">LAND SEARCH</span>
            <h2 id="discovery-heading">{t("home.searchTitle")}</h2>
            <p>{t("home.searchBody")}</p>
            <div className="mt-5">
              <SearchEntryForm />
            </div>
            <div className="discovery-transactions" aria-label="Quick transaction links">
              <Link href="/buy">{t("home.browseBuy")}</Link>
              <Link href="/rent">{t("home.browseRent")}</Link>
              <Link href="/lease">{t("home.browseLease")}</Link>
            </div>
          </div>
        </div>
        <div className="hero-proof">
          <div className="site-container grid gap-px sm:grid-cols-3">
            <span>
              <strong>Ahmedabad &amp; Gandhinagar</strong> focused local land guidance
            </span>
            <span>
              <strong>Agricultural · NA · Industrial</strong> purpose-built land discovery
            </span>
            <span>
              <strong>Direct UrbanEdge support</strong> from requirement to site visit
            </span>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="site-container">
          <SectionHeading
            eyebrow="Discover by land type"
            title="Three categories. Different questions. One considered process."
            description="Land should be understood on its own terms—not through apartment-style filters or generic promises."
          />
          <div className="category-card-grid mt-10">
            {categories.map((category) => (
              <Link href={category.href} className="category-card" key={category.href}>
                <span>{category.index}</span>
                <h3>{category.title}</h3>
                <p>{category.text}</p>
                <b>
                  Explore category <ArrowIcon className="size-4" />
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
              eyebrow="Selected opportunities"
              title="Featured published land"
              description="A limited selection of current land, with clear location, area, price and availability details."
            />
            <Link href="/properties" className="text-link shrink-0">
              View all land <ArrowIcon className="size-4" />
            </Link>
          </div>
          <div className="mt-10">
            <PropertyCollection
              result={featured}
              emptyTitle="Can't find the right land?"
              emptyBody="Tell UrbanEdge what you're looking for and our team can assist with suitable opportunities."
              contactConfig={config}
            />
          </div>
        </div>
      </section>

      <section className="requirement-band">
        <div className="site-container requirement-band-inner">
          <div>
            <p className="eyebrow">Looking for something specific?</p>
            <h2>Share your requirement with our land advisory team.</h2>
            <p>
              Tell us the location, land type, area and budget you have in mind. UrbanEdge will
              review it privately and contact you to discuss suitable options.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/requirements" className="button button-primary" prefetch={false}>
              Share Your Requirement
            </Link>
            {whatsapp ? (
              <a
                className="button button-whatsapp"
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
              >
                <MessageIcon className="size-4" /> WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section trust-section">
        <div className="site-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow text-[var(--brand-gold)]">Why UrbanEdge</p>
            <h2 className="section-title mt-3 text-white">
              Local context, careful communication and a human next step.
            </h2>
            <span className="gold-rule" />
            <p className="mt-5 max-w-xl leading-8 text-slate-300">
              UrbanEdge helps buyers, investors, developers, businesses and landowners move from a
              broad requirement to a useful local conversation—without publishing private owner or
              property information.
            </p>
          </div>
          <div className="trust-grid">
            {[
              "Local land specialization",
              "Buyer and investor requirement support",
              "Private landowner submissions",
              "Clear property references",
              "Responsible information review",
              "Site-visit coordination",
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
            eyebrow="How the brokerage journey works"
            title="Clear steps, with UrbanEdge beside you."
            align="center"
          />
          <ol className="process-grid mt-12">
            {[
              ["01", "Share the need", "Search published land or tell us your requirement."],
              ["02", "Compare", "Review the location, area, price and relevant land details."],
              ["03", "Speak with us", "Use the Property ID for a focused conversation."],
              ["04", "Request a visit", "UrbanEdge will coordinate and confirm the schedule."],
              ["05", "Take the next step", "Continue with the property-specific checks you need."],
            ].map(([n, t, d]) => (
              <li key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section service-area-section">
        <div className="site-container grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Focused service area"
              title="Ahmedabad and Gandhinagar, understood locally."
              description="UrbanEdge begins with two connected land markets where local geography, access, planning and buyer intent can be discussed with useful context."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/locations/ahmedabad" className="button button-primary">
                Ahmedabad
              </Link>
              <Link href="/locations/gandhinagar" className="button button-outline">
                Gandhinagar
              </Link>
            </div>
          </div>
          <div className="service-area-card">
            <CompassIcon className="size-8" />
            <p>Primary service corridor</p>
            <h3>
              Ahmedabad <span>↔</span> Gandhinagar
            </h3>
            <small>Urban, peri-urban, agricultural and industrial opportunity areas</small>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="verification-panel">
            <p className="eyebrow">A careful trust model</p>
            <h2>“Reviewed” should always tell you what it means.</h2>
            <p>
              Where information has been reviewed, UrbanEdge explains what was checked and any
              limits. A review supports discovery; it is not a title guarantee or blanket approval.
            </p>
            <div className="scope-example">
              <span>Property Information Review</span>
              <strong>What UrbanEdge has reviewed</strong>
              <small>Specific scope · review date · important limits</small>
            </div>
          </div>
          <div className="guide-preview">
            <p className="eyebrow">Land guides</p>
            <h2>Useful context before the conversation.</h2>
            <p>
              Practical guides for comparing land, preparing questions and understanding what to
              check before a transaction.
            </p>
            <Link className="text-link mt-5" href="/guides">
              Read land guides <ArrowIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="sell-band">
        <div className="site-container grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow text-[var(--brand-gold)]">For landowners</p>
            <h2>Sell, rent or lease your land with UrbanEdge.</h2>
            <p>
              Share your land details through our private review process. UrbanEdge may contact you,
              and nothing is published automatically.
            </p>
          </div>
          <Link href="/sell-your-land" className="button button-gold" prefetch={false}>
            Share your land <ArrowIcon className="size-4" />
          </Link>
        </div>
      </section>
      <section className="final-band">
        <div className="site-container text-center">
          <p className="eyebrow">Speak with a local land specialist</p>
          <h2>Explore published land—or tell UrbanEdge exactly what you need.</h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/properties" className="button button-primary">
              Explore land
            </Link>
            <Link href="/requirements" className="button button-outline" prefetch={false}>
              Tell UrbanEdge your requirement
            </Link>
            {telephone ? (
              <a className="button button-outline" href={telephone}>
                <PhoneIcon className="size-4" /> Call UrbanEdge
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
