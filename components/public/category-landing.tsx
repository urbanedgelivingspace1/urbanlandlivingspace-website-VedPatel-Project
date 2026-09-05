import Link from "next/link";

import type { LandCategory } from "@/types/database";
import { loadFixedPublicSearch } from "@/server/queries/public-search";

import { Breadcrumbs } from "./breadcrumbs";
import { PropertyCollection } from "./property-collection";
import { SectionHeading } from "./section-heading";
import { ArrowIcon, CheckIcon } from "./icons";

const content: Record<
  LandCategory,
  {
    eyebrow: string;
    title: string;
    intro: string;
    criteria: readonly string[];
    explanation: string;
    note: string;
  }
> = {
  AGRICULTURAL: {
    eyebrow: "Agricultural land",
    title: "Understand the land before you plan the next step.",
    intro:
      "Browse curated agricultural land across Ahmedabad and Gandhinagar with useful context on area, village or taluka, access, water and current use.",
    criteria: [
      "Village and taluka context",
      "Declared land area",
      "Road and farm access",
      "Irrigation and water",
      "Current agricultural use",
      "Fencing and topography",
    ],
    explanation:
      "Agricultural land is not one uniform asset class. Tenure, access, water, present use and the applicable buyer or transaction requirements all need property-specific consideration.",
    note: "UrbanEdge does not state that every person may purchase every agricultural property. Eligibility and transaction steps should be confirmed for the specific facts with appropriate professional guidance.",
  },
  NA: {
    eyebrow: "NA land",
    title: "Recorded land status, explained with the right limits.",
    intro:
      "Explore NA land with available public context on purpose, access, planning, utilities and the records presented for the individual property.",
    criteria: [
      "Recorded NA status and purpose",
      "Planning context",
      "Road width and frontage",
      "TP / OP / FP references",
      "Water and power",
      "Layout or permission status where supported",
    ],
    explanation:
      "NA is a land-use status, not a blanket promise of construction or development. Permitted use and development potential depend on the applicable records, plans, permissions and authorities.",
    note: "NA/status information is presented according to the available approved property evidence and remains subject to the applicable documents and authorities.",
  },
  INDUSTRIAL: {
    eyebrow: "Industrial land",
    title: "Land for operations, infrastructure and long-term access.",
    intro:
      "Discover industrial land for manufacturing, warehousing and logistics with practical context on estate, authority, utilities, truck access and connectivity.",
    criteria: [
      "GIDC or private context",
      "Estate and authority",
      "Road and truck access",
      "Power and utilities",
      "Shed and open area",
      "Highway and logistics connectivity",
    ],
    explanation:
      "Industrial requirements go beyond area and price. Access, power, water, drainage, tenure, permitted use and the distinction between authority-controlled estates and private industrial land matter.",
    note: "GIDC details are shown only where recorded for that property. Private industrial land is not represented as a GIDC allotment or authority-backed offering.",
  },
};

export async function CategoryLanding({ category }: Readonly<{ category: LandCategory }>) {
  const page = content[category];
  const inventory = await loadFixedPublicSearch({ category }, 12);
  const categoryParameter = category === "AGRICULTURAL" ? "agricultural" : category.toLowerCase();
  return (
    <main>
      <section className={`category-hero category-${category.toLowerCase()}`}>
        <div className="site-container relative z-10 py-14 sm:py-18 lg:py-24">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: page.eyebrow }]} />
          <p className="eyebrow mt-8 text-[var(--brand-gold)]">{page.eyebrow}</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">{page.title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            {page.intro}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#current-inventory" className="button button-gold">
              Browse current land <ArrowIcon className="size-4" />
            </a>
            <Link href="/requirements" className="button button-outline-light" prefetch={false}>
              Share your requirement
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="site-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeading eyebrow="What to consider" title={page.explanation} />
          <div className="criteria-grid">
            {page.criteria.map((criterion) => (
              <div key={criterion}>
                <CheckIcon className="size-5" />
                <span>{criterion}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="site-container mt-10">
          <p className="category-note">{page.note}</p>
        </div>
      </section>

      <section id="current-inventory" className="section scroll-mt-24">
        <div className="site-container">
          <SectionHeading
            eyebrow="Current published inventory"
            title={`${page.eyebrow} selected by UrbanEdge`}
            description="Every listing below comes from the approved published-property contract. Private owner and internal review information is never shown."
          />
          <div className="mt-10">
            <PropertyCollection
              result={inventory}
              emptyTitle={`No ${page.eyebrow.toLowerCase()} is publicly listed right now.`}
            />
          </div>
          <div className="mt-8">
            <Link className="text-link" href={`/properties?category=${categoryParameter}`}>
              Refine this search <ArrowIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="site-container cta-band-inner">
          <div>
            <p className="eyebrow text-[var(--brand-gold)]">A more specific brief?</p>
            <h2>Tell UrbanEdge the land, location and scale you need.</h2>
          </div>
          <Link href="/requirements" className="button button-gold" prefetch={false}>
            Share your requirement <ArrowIcon className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
