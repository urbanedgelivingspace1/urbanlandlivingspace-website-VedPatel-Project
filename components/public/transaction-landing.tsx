import Link from "next/link";

import type { TransactionType } from "@/types/database";
import { loadFixedPublicSearch } from "@/server/queries/public-search";

import { Breadcrumbs } from "./breadcrumbs";
import { PropertyCollection } from "./property-collection";
import { SectionHeading } from "./section-heading";
import { ArrowIcon } from "./icons";
import { JsonLd } from "./json-ld";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { collectionJsonLd } from "@/lib/seo/structured-data";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate, type TranslationKey } from "@/lib/i18n/dictionaries";

const transactionTranslationKeys: Record<
  TransactionType,
  Readonly<{
    label: TranslationKey;
    title: TranslationKey;
    intro: TranslationKey;
    cta: TranslationKey;
  }>
> = {
  BUY: {
    label: "common.forPurchase",
    title: "transaction.buy.title",
    intro: "transaction.buy.intro",
    cta: "transaction.buy.cta",
  },
  RENT: {
    label: "common.forRent",
    title: "transaction.rent.title",
    intro: "transaction.rent.intro",
    cta: "transaction.rent.cta",
  },
  LEASE: {
    label: "common.forLease",
    title: "transaction.lease.title",
    intro: "transaction.lease.intro",
    cta: "transaction.lease.cta",
  },
};

export const transactionLandingContent: Record<
  TransactionType,
  {
    title: string;
    intro: string;
    cta: string;
    serviceContext: string;
    guidance: readonly Readonly<{ title: string; body: string }>[];
  }
> = {
  BUY: {
    title: "Land for purchase, with context before commitment.",
    intro:
      "Compare curated Agricultural, NA and Industrial opportunities across Ahmedabad and Gandhinagar.",
    cta: "Explore land for purchase",
    serviceContext:
      "UrbanEdge supports a purchase search by keeping enquiries tied to approved public information and a stable Property ID. The team can clarify the listing context, capture a more specific requirement and coordinate a manually confirmed visit. Independent legal, revenue, planning, measurement, tax, finance and technical advice remains necessary for the actual property and transaction. If no current listing fits, a structured requirement records the category, geography, area and budget context without implying that private or draft inventory is available. It remains a search brief, not an offer or availability promise. Dates, terms and next steps are confirmed directly for the selected property.",
    guidance: [
      {
        title: "Define the purchase purpose",
        body: "Clarify the land category, intended use, preferred geography, required access, area range and budget representation before comparing listings. A property that matches area and price may still require different planning, eligibility or infrastructure checks.",
      },
      {
        title: "Compare public facts consistently",
        body: "Use the same area unit, transaction basis and broad location context when making a shortlist. Keep the Property ID with every enquiry so the conversation stays tied to the correct published record.",
      },
      {
        title: "Plan checks before commitment",
        body: "Review title, revenue, planning, measurement, tax, access and transaction documents for the specific land with appropriate professionals. Published information and site visits support discovery but do not complete due diligence.",
      },
      {
        title: "Keep offer and approval questions distinct",
        body: "A purchase price, negotiation stage or seller statement does not establish title, permitted use, development potential or financeability. Record the commercial assumptions in the shortlist, then verify each material legal, revenue, planning and technical point against the actual property and proposed transaction before commitment.",
      },
    ],
  },
  RENT: {
    title: "Rental land for real operating needs.",
    intro:
      "Browse published rental opportunities while preserving the commercial terms recorded for each listing.",
    cta: "Explore land for rent",
    serviceContext:
      "UrbanEdge can help shortlist published rental land, preserve the stated commercial context and coordinate the next conversation with the correct Property ID. The parties and their professional advisers still need to confirm authority, permitted use, access, condition, term, possession, improvements, operating obligations and the final agreement for the specific site. If visible inventory is limited, a structured requirement can capture the operating brief without presenting an unreviewed owner submission as a rental opportunity. It remains a search brief, not an offer or availability promise. Dates, terms and next steps are confirmed directly for the selected property.",
    guidance: [
      {
        title: "Start with the operating need",
        body: "State the activity, area, access, duration, utilities, vehicle movement and any site improvements needed. Rental suitability depends on the actual use and the permissions and commercial terms that apply to the specific land.",
      },
      {
        title: "Read the offer as recorded",
        body: "Compare rent periods, deposits, escalation, possession, maintenance and permitted-use terms when they are available. Price on Request means no public numeric amount has been published and should not be guessed.",
      },
      {
        title: "Confirm before occupation",
        body: "Check authority, planning, safety, access, measurement, documentation and fit-out responsibilities with the appropriate professionals and parties. A visit request remains unconfirmed until UrbanEdge coordinates it manually.",
      },
      {
        title: "Document the practical handover",
        body: "Clarify the condition at possession, access arrangements, permitted alterations, utility metering, restoration duties and responsibility for approvals or recurring charges. These matters belong in the property-specific commercial and legal discussion, not in assumptions drawn from a short public listing.",
      },
    ],
  },
  LEASE: {
    title: "Lease opportunities with commercial context intact.",
    intro:
      "Discover land offered on lease, including the available category, area, location and infrastructure context.",
    cta: "Explore land for lease",
    serviceContext:
      "UrbanEdge uses the operating brief and published listing facts to support a focused lease search. The team can clarify visible information, register a structured requirement and coordinate a manually confirmed visit. Property-specific authority, permitted use, infrastructure, measurements, commercial obligations and documentation remain subject to review by the parties and appropriate professional advisers. When no published property matches, requirement capture supports a later brokerage conversation without manufacturing supply or exposing private submissions. It remains a search brief, not an offer or availability promise. Dates, terms and next steps are confirmed directly for the selected property.",
    guidance: [
      {
        title: "Describe the lease horizon",
        body: "Share the intended activity, preferred term, area, access, infrastructure and improvement needs. These details help distinguish a relevant lease opportunity from a listing that only matches broad geography.",
      },
      {
        title: "Compare commercial structure",
        body: "Review the public price mode and ask about term, deposit, escalation, possession, permitted use, transfer and exit conditions for the actual offer. Do not infer private asking terms from a Price on Request display.",
      },
      {
        title: "Complete property-specific review",
        body: "Confirm ownership authority, tenure, use, planning, access, utilities, measurements and lease documentation with appropriate professionals before proceeding. UrbanEdge supports brokerage coordination without guaranteeing operational approval.",
      },
      {
        title: "Plan changes over the full term",
        body: "Discuss escalation, renewal, transfer, improvements, maintenance, restoration and exit responsibilities alongside the proposed use. A longer lease horizon can make infrastructure and permission assumptions more significant, so keep them explicit and confirm them in the actual commercial and professional review.",
      },
    ],
  },
};

export function transactionLandingEditorialText(transaction: TransactionType): string {
  const page = transactionLandingContent[transaction];
  return [
    page.intro,
    page.serviceContext,
    ...page.guidance.flatMap(({ title, body }) => [title, body]),
  ].join(" ");
}

export async function TransactionLanding({
  transaction,
}: Readonly<{ transaction: TransactionType }>) {
  const [inventory, locale] = await Promise.all([
    loadFixedPublicSearch({ transaction }, 12),
    getRequestLocale(),
  ]);
  const t = (key: TranslationKey) => translate(locale, key);
  const keys = transactionTranslationKeys[transaction];
  const page = {
    ...transactionLandingContent[transaction],
    title: t(keys.title),
    intro: t(keys.intro),
    cta: t(keys.cta),
    ...(locale === "en"
      ? {}
      : {
          serviceContext: t("landing.genericService"),
          guidance: [
            { title: t("landing.guidancePurpose"), body: t("landing.guidancePurposeBody") },
            { title: t("landing.guidanceFacts"), body: t("landing.guidanceFactsBody") },
            { title: t("landing.guidanceChecks"), body: t("landing.guidanceChecksBody") },
            {
              title: t("landing.guidanceAssumptions"),
              body: t("landing.guidanceAssumptionsBody"),
            },
          ],
        }),
  };
  const transactionLabel = t(keys.label);
  const path = `/${transaction.toLowerCase()}`;
  const breadcrumbs = [{ label: t("common.home"), href: "/" }, { label: transactionLabel }];
  return (
    <main>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <JsonLd
        data={collectionJsonLd({
          name: page.title,
          description: page.intro,
          path,
          items: inventory.properties,
        })}
      />
      <section className="collection-hero">
        <div className="site-container py-12 sm:py-16 lg:py-20">
          <Breadcrumbs items={breadcrumbs} />
          <p className="eyebrow mt-8 text-[var(--brand-gold)]">{transactionLabel}</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">{page.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">{page.intro}</p>
          <a href="#current-inventory" className="button button-gold mt-8">
            {page.cta} <ArrowIcon className="size-4" />
          </a>
        </div>
      </section>
      <section className="section section-light">
        <div className="site-container">
          <SectionHeading
            eyebrow={t("landing.transactionGuidance")}
            title={page.title}
            description={t("landing.transactionDescription")}
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
      <section id="current-inventory" className="section scroll-mt-24">
        <div className="site-container site-container-wide">
          <SectionHeading
            eyebrow={t("common.publishedInventory")}
            title={transactionLabel}
            description={t("landing.opportunitiesDescription")}
          />
          <div className="mt-10">
            <PropertyCollection result={inventory} locale={locale} />
          </div>
          <div className="mt-8">
            <Link
              href={`/requirements?transaction=${transaction.toLowerCase()}&source=TRANSACTION_${transaction}`}
              className="button button-outline"
            >
              {t("common.shareRequirement")}
            </Link>
          </div>
          <div className="mt-10">
            <Link
              href={`/properties?transaction=${transaction.toLowerCase()}`}
              className="text-link"
            >
              {t("common.refineSearch")} <ArrowIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
