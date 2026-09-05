import Link from "next/link";

import type { TransactionType } from "@/types/database";
import { transactionLabels } from "@/lib/formatting/property-values";
import { loadFixedPublicSearch } from "@/server/queries/public-search";

import { Breadcrumbs } from "./breadcrumbs";
import { PropertyCollection } from "./property-collection";
import { SectionHeading } from "./section-heading";
import { ArrowIcon } from "./icons";

const copy: Record<TransactionType, { title: string; intro: string; cta: string }> = {
  BUY: {
    title: "Land for purchase, with context before commitment.",
    intro:
      "Compare curated Agricultural, NA and Industrial opportunities across Ahmedabad and Gandhinagar.",
    cta: "Explore land for purchase",
  },
  RENT: {
    title: "Rental land for real operating needs.",
    intro:
      "Browse published rental opportunities while preserving the commercial terms recorded for each listing.",
    cta: "Explore land for rent",
  },
  LEASE: {
    title: "Lease opportunities with commercial context intact.",
    intro:
      "Discover land offered on lease, including the available category, area, location and infrastructure context.",
    cta: "Explore land for lease",
  },
};

export async function TransactionLanding({
  transaction,
}: Readonly<{ transaction: TransactionType }>) {
  const page = copy[transaction];
  const inventory = await loadFixedPublicSearch({ transaction }, 12);
  return (
    <main>
      <section className="collection-hero">
        <div className="site-container py-14 sm:py-18 lg:py-22">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: transactionLabels[transaction] }]}
          />
          <p className="eyebrow mt-8 text-[var(--brand-gold)]">{transactionLabels[transaction]}</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">{page.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">{page.intro}</p>
          <a href="#current-inventory" className="button button-gold mt-8">
            {page.cta} <ArrowIcon className="size-4" />
          </a>
        </div>
      </section>
      <section id="current-inventory" className="section scroll-mt-24">
        <div className="site-container">
          <SectionHeading
            eyebrow="Published inventory"
            title={`${transactionLabels[transaction]} opportunities`}
            description="Browse current listings, then open a property for its approved land, location and commercial details."
          />
          <div className="mt-10">
            <PropertyCollection result={inventory} />
          </div>
          <div className="mt-8">
            <Link
              href={`/requirements?transaction=${transaction.toLowerCase()}&source=TRANSACTION_${transaction}`}
              className="button button-outline"
              prefetch={false}
            >
              Share a {transactionLabels[transaction].toLowerCase()} requirement
            </Link>
          </div>
          <div className="mt-10">
            <Link
              href={`/properties?transaction=${transaction.toLowerCase()}`}
              className="text-link"
            >
              Refine this search <ArrowIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
