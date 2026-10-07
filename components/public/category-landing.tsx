import Link from "next/link";

import type { LandCategory } from "@/types/database";
import { loadFixedPublicSearch } from "@/server/queries/public-search";

import { Breadcrumbs } from "./breadcrumbs";
import { PropertyCollection } from "./property-collection";
import { SectionHeading } from "./section-heading";
import { ArrowIcon, CheckIcon } from "./icons";
import { JsonLd } from "./json-ld";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { collectionJsonLd } from "@/lib/seo/structured-data";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate, type TranslationKey } from "@/lib/i18n/dictionaries";

const categoryTranslationKeys: Record<
  LandCategory,
  Readonly<{ eyebrow: TranslationKey; title: TranslationKey; intro: TranslationKey }>
> = {
  AGRICULTURAL: {
    eyebrow: "nav.agricultural",
    title: "category.agricultural.title",
    intro: "category.agricultural.intro",
  },
  NA: { eyebrow: "nav.na", title: "category.na.title", intro: "category.na.intro" },
  INDUSTRIAL: {
    eyebrow: "nav.industrial",
    title: "category.industrial.title",
    intro: "category.industrial.intro",
  },
};

export const categoryLandingContent: Record<
  LandCategory,
  {
    eyebrow: string;
    title: string;
    intro: string;
    criteria: readonly string[];
    explanation: string;
    note: string;
    serviceContext: string;
    guidance: readonly Readonly<{ title: string; body: string }>[];
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
    serviceContext:
      "UrbanEdge supports the discovery stage by presenting approved listing facts, keeping each enquiry tied to a stable Property ID and coordinating the next conversation. The brokerage team can clarify what has been published and arrange a manually confirmed visit; it does not replace the independent advisers needed to assess records, eligibility, measurements, access or the proposed agricultural activity.",
    guidance: [
      {
        title: "Start with intended agricultural use",
        body: "Compare the land against the activity you actually need to support. Current cultivation, water sources, approach road, physical shape and nearby context can affect practical fit, while the recorded tenure and buyer circumstances affect which professional questions should come next.",
      },
      {
        title: "Keep area and access precise",
        body: "Read the displayed area together with its original unit and public location context. Ask how access is recorded and observed rather than treating a map view or nearby road as proof of a legal right of way.",
      },
      {
        title: "Separate discovery from due diligence",
        body: "A published listing and a site visit help shortlist land. They do not replace checks of revenue records, title history, measurements, restrictions, buyer eligibility, water or electricity arrangements and the documents for the proposed transaction.",
      },
      {
        title: "Use the location hierarchy",
        body: "Compare district, taluka, village and nearby-landmark context at the level approved for public display. A broad label helps discovery but does not identify a parcel boundary. Keep survey references, coordinates and record extracts within the property-specific professional review rather than inferring them from a category page.",
      },
    ],
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
    serviceContext:
      "UrbanEdge keeps discovery separate from approval. The team can help compare published facts, identify the correct Property ID, capture a requirement and coordinate a manually confirmed visit. Legal, revenue, planning, architectural and technical professionals should assess the actual records and proposal before a buyer, tenant or lessee relies on a particular use or development assumption.",
    guidance: [
      {
        title: "Read NA status with its purpose",
        body: "A recorded NA context should be considered alongside the stated purpose, relevant order, planning position and the activity you propose. The label alone is not permission for every building, layout or commercial use.",
      },
      {
        title: "Compare the usable site context",
        body: "Road width, frontage, utilities, plot shape and planning references can be useful screening facts when they are supported for public display. Confirm their source, date and application to the actual parcel before relying on them.",
      },
      {
        title: "Plan the property-specific checks",
        body: "Use suitable legal, revenue, planning, measurement, tax and technical professionals to examine the relevant records and proposed use. UrbanEdge can support discovery and coordination without guaranteeing a development outcome.",
      },
      {
        title: "Keep the proposal separate from the listing",
        body: "Describe the activity, building or layout you are considering, then ask which planning and technical questions apply. A listing can report approved public records and physical context, but a future proposal needs its own assessment and cannot inherit permission from nearby development or marketing language.",
      },
    ],
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
    serviceContext:
      "UrbanEdge helps turn an operating brief into a focused search across published inventory. The team can clarify the public listing context, keep enquiries connected to the correct Property ID and coordinate site visits, while authority, environmental, engineering, legal and commercial specialists remain responsible for property-specific permissions, infrastructure assessment and transaction advice.",
    guidance: [
      {
        title: "Begin with the operating brief",
        body: "Define the intended process, vehicle movement, open and covered area, utilities, workforce access and transaction structure before comparing land. A large area alone does not establish operational suitability.",
      },
      {
        title: "Distinguish authority and private contexts",
        body: "An authority-controlled estate and private industrial land may involve different tenure, transfer, use and infrastructure questions. UrbanEdge shows GIDC or other authority context only when recorded for the specific published property.",
      },
      {
        title: "Verify infrastructure and permissions",
        body: "Power, water, drainage, truck access, environmental requirements, permitted use, measurements and transaction documents need property-specific confirmation. Public listing facts are a starting point, not an operating approval.",
      },
      {
        title: "Compare total operational fit",
        body: "Consider workforce and vehicle access, utility capacity, drainage, loading, buffers, expansion space and responsibilities under the proposed transaction. Record which facts are published, which are seller statements and which require direct confirmation from an authority, utility or qualified technical adviser.",
      },
    ],
  },
};

export function categoryLandingEditorialText(category: LandCategory): string {
  const page = categoryLandingContent[category];
  return [
    page.intro,
    page.explanation,
    page.note,
    page.serviceContext,
    ...page.criteria,
    ...page.guidance.flatMap(({ title, body }) => [title, body]),
  ].join(" ");
}

export async function CategoryLanding({ category }: Readonly<{ category: LandCategory }>) {
  const [inventory, locale] = await Promise.all([
    loadFixedPublicSearch({ category }, 12),
    getRequestLocale(),
  ]);
  const t = (key: TranslationKey) => translate(locale, key);
  const keys = categoryTranslationKeys[category];
  const localizedGuidance = [
    { title: t("landing.guidancePurpose"), body: t("landing.guidancePurposeBody") },
    { title: t("landing.guidanceFacts"), body: t("landing.guidanceFactsBody") },
    { title: t("landing.guidanceChecks"), body: t("landing.guidanceChecksBody") },
    { title: t("landing.guidanceAssumptions"), body: t("landing.guidanceAssumptionsBody") },
  ];
  const page = {
    ...categoryLandingContent[category],
    eyebrow: t(keys.eyebrow),
    title: t(keys.title),
    intro: t(keys.intro),
    ...(locale === "en"
      ? {}
      : {
          criteria: [
            t("landing.criteriaLocation"),
            t("landing.criteriaArea"),
            t("landing.criteriaUtilities"),
            t("landing.criteriaUse"),
            t("landing.criteriaRoad"),
            t("landing.criteriaChecks"),
          ],
          explanation: t("landing.genericExplanation"),
          note: t("landing.genericNote"),
          serviceContext: t("landing.genericService"),
          guidance: localizedGuidance,
        }),
  };
  const categoryParameter = category === "AGRICULTURAL" ? "agricultural" : category.toLowerCase();
  const categoryPath =
    category === "AGRICULTURAL" ? "/agricultural-land" : `/${category.toLowerCase()}-land`;
  const breadcrumbs = [{ label: t("common.home"), href: "/" }, { label: page.eyebrow }];
  return (
    <main>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <JsonLd
        data={collectionJsonLd({
          name: page.eyebrow,
          description: page.intro,
          path: categoryPath,
          items: inventory.properties,
        })}
      />
      <section className={`category-hero category-${category.toLowerCase()}`}>
        <div className="site-container relative z-10 py-12 sm:py-16 lg:py-20">
          <Breadcrumbs items={breadcrumbs} />
          <p className="eyebrow mt-8 text-[var(--brand-gold)]">{page.eyebrow}</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">{page.title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            {page.intro}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#current-inventory" className="button button-gold">
              {t("landing.browseCurrent")} <ArrowIcon className="size-4" />
            </a>
            <Link
              href={`/requirements?category=${categoryParameter}&source=CATEGORY_${category}`}
              className="button button-outline-light"
            >
              {t("common.shareRequirement")}
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="site-container">
          <SectionHeading
            eyebrow={t("landing.buyerGuidance")}
            title={t("landing.questionsTitle")}
            description={t("landing.guidanceDescription")}
          />
          <div className="guide-grid mt-10">
            {page.guidance.map((item) => (
              <article className="guide-card" key={item.title}>
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <p className="category-note mt-8">{page.serviceContext}</p>
          <div className="mt-8 flex flex-wrap gap-5">
            <Link className="text-link" href="/guides">
              {t("common.readGuides")} <ArrowIcon className="size-4" />
            </Link>
            <Link className="text-link" href="/locations/ahmedabad">
              {t("common.ahmedabad")} <ArrowIcon className="size-4" />
            </Link>
            <Link className="text-link" href="/locations/gandhinagar">
              {t("common.gandhinagar")} <ArrowIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="site-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeading eyebrow={t("landing.whatToConsider")} title={page.explanation} />
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
        <div className="site-container site-container-wide">
          <SectionHeading
            eyebrow={t("common.currentInventory")}
            title={page.eyebrow}
            description={t("landing.inventoryDescription")}
          />
          <div className="mt-10">
            <PropertyCollection
              result={inventory}
              emptyTitle={
                locale === "en"
                  ? `No ${page.eyebrow.toLowerCase()} is publicly listed right now.`
                  : t("common.emptyInventory")
              }
              locale={locale}
            />
          </div>
          <div className="mt-8">
            <Link className="text-link" href={`/properties?category=${categoryParameter}`}>
              {t("common.refineSearch")} <ArrowIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="site-container cta-band-inner">
          <div>
            <p className="eyebrow text-[var(--brand-gold)]">{t("landing.specificBrief")}</p>
            <h2>{t("landing.specificBriefTitle")}</h2>
          </div>
          <Link
            href={`/requirements?category=${categoryParameter}&source=CATEGORY_${category}`}
            className="button button-gold"
          >
            {t("common.shareRequirement")} <ArrowIcon className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
