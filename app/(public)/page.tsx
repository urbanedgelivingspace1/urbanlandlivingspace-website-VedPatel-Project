import type { Metadata } from "next";
import Link from "next/link";

import { ArrowIcon, CheckIcon, CompassIcon } from "@/components/public/icons";
import { PropertyCollection } from "@/components/public/property-collection";
import { JsonLd } from "@/components/public/json-ld";
import { SectionHeading } from "@/components/public/section-heading";
import { SearchEntryForm } from "@/components/search/search-entry-form";
import { loadPublicBusinessConfig, loadPublicInventory } from "@/server/queries/public-page-data";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";
import { buildPublicMetadata } from "@/lib/seo/metadata";

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
    text: "Area, access, water and present-use context for rural and peri-urban land.",
  },
  {
    href: "/na-land",
    index: "02",
    title: "NA Land",
    text: "Recorded status, purpose, planning and access information—without development guarantees.",
  },
  {
    href: "/industrial-land",
    index: "03",
    title: "Industrial Land",
    text: "Infrastructure, authority, estate and logistics context for operating decisions.",
  },
] as const;

export default async function HomePage() {
  const [featured, config] = await Promise.all([
    loadPublicInventory({ featuredOnly: true, limit: 6 }),
    loadPublicBusinessConfig(),
  ]);
  return (
    <main>
      <JsonLd data={organizationJsonLd(config)} />
      <JsonLd data={websiteJsonLd()} />
      <section className="home-hero">
        <div className="survey-lines" aria-hidden="true" />
        <div className="site-container relative z-10 grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-28">
          <div>
            <p className="eyebrow text-[var(--brand-gold)]">Ahmedabad · Gandhinagar</p>
            <h1 className="hero-title mt-4">
              Land opportunities,
              <br />
              <em>curated by UrbanEdge.</em>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              Agricultural, NA and industrial land with the public facts buyers need—and local
              guidance from first enquiry to site visit.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/properties" className="button button-gold">
                Explore land <ArrowIcon className="size-4" />
              </Link>
              <Link href="/sell-your-land" className="button button-outline-light" prefetch={false}>
                Sell your land
              </Link>
            </div>
          </div>
          <div className="discovery-panel" aria-labelledby="discovery-heading">
            <span className="discovery-index">LAND / 01</span>
            <h2 id="discovery-heading">Begin with what matters.</h2>
            <p>
              Choose a land type or transaction to see the most relevant published opportunities.
            </p>
            <div className="mt-5">
              <SearchEntryForm />
            </div>
            <div className="discovery-links">
              <Link href="/agricultural-land">
                Agricultural <ArrowIcon className="size-4" />
              </Link>
              <Link href="/na-land">
                NA Land <ArrowIcon className="size-4" />
              </Link>
              <Link href="/industrial-land">
                Industrial <ArrowIcon className="size-4" />
              </Link>
            </div>
            <div className="discovery-transactions">
              <Link href="/buy">Buy</Link>
              <Link href="/rent">Rent</Link>
              <Link href="/lease">Lease</Link>
            </div>
          </div>
        </div>
        <div className="hero-proof">
          <div className="site-container grid grid-cols-2 gap-px sm:grid-cols-4">
            <span>
              <strong>3</strong> specialist land categories
            </span>
            <span>
              <strong>2</strong> focused service districts
            </span>
            <span>
              <strong>ID</strong> on every published listing
            </span>
            <span>
              <strong>Human</strong> brokerage guidance
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
              description="A limited selection of current public inventory, shown through the same safe card system used across the site."
            />
            <Link href="/properties" className="text-link shrink-0">
              View all land <ArrowIcon className="size-4" />
            </Link>
          </div>
          <div className="mt-10">
            <PropertyCollection
              result={featured}
              emptyTitle="No featured land is publicly listed right now."
              emptyBody="Explore the full published collection or return soon as UrbanEdge curates new opportunities."
            />
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
              UrbanEdge helps buyers move from discovery to informed conversation. We present
              approved public facts, make property identity easy to reference and keep private owner
              information private.
            </p>
          </div>
          <div className="trust-grid">
            {[
              "Curated published inventory",
              "Ahmedabad and Gandhinagar focus",
              "Immutable Property ID",
              "Privacy-aware location display",
              "Scoped review language",
              "Site-visit assistance",
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
              ["01", "Discover", "Browse curated public inventory."],
              ["02", "Understand", "Review land, location and commercial context."],
              ["03", "Enquire", "Reference one clear Property ID."],
              ["04", "Visit", "Coordinate an appropriate site visit."],
              ["05", "Proceed", "Take the next step with relevant guidance."],
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
              UrbanEdge uses scoped language for specific checks and their limitations. We do not
              use a generic “Verified” badge or imply clear title, guaranteed legality or guaranteed
              development.
            </p>
            <div className="scope-example">
              <span>Example structure</span>
              <strong>Information reviewed</strong>
              <small>Defined scope · review date · limitation</small>
            </div>
          </div>
          <div className="guide-preview">
            <p className="eyebrow">Land guides</p>
            <h2>Useful context before the conversation.</h2>
            <p>
              Read reviewed guidance on comparing public facts, preparing questions and planning
              property-specific professional checks.
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
            <p className="eyebrow text-[var(--brand-gold)]">Own land?</p>
            <h2>Bring your land opportunity to UrbanEdge.</h2>
            <p>
              Share the category, location and basic details. Submission does not mean automatic
              acceptance or publication.
            </p>
          </div>
          <Link href="/sell-your-land" className="button button-gold" prefetch={false}>
            Sell your land <ArrowIcon className="size-4" />
          </Link>
        </div>
      </section>
      <section className="final-band">
        <div className="site-container text-center">
          <p className="eyebrow">Your land search can start simply</p>
          <h2>Explore what is published—or tell us what you need.</h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/properties" className="button button-primary">
              Explore land
            </Link>
            <Link href="/requirements" className="button button-outline" prefetch={false}>
              Tell UrbanEdge your requirement
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
