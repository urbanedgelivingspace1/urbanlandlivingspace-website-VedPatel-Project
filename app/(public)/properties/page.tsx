import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { PropertyCollection } from "@/components/public/property-collection";
import { loadPublicInventory } from "@/server/queries/public-page-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Published Land Properties",
  description:
    "Browse UrbanEdge's currently published Agricultural, NA and Industrial land across Ahmedabad and Gandhinagar.",
  alternates: { canonical: "/properties" },
  openGraph: {
    title: "Published Land Properties | UrbanEdge Land Space",
    description: "Curated published land across Ahmedabad and Gandhinagar.",
    url: "/properties",
    type: "website",
  },
};

export default async function PropertiesPage() {
  const inventory = await loadPublicInventory({ limit: 24 });
  return (
    <main>
      <section className="collection-hero">
        <div className="site-container py-14 sm:py-18">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Properties" }]} />
          <p className="eyebrow mt-8 text-[var(--brand-gold)]">Published collection</p>
          <h1 className="public-page-title mt-3 max-w-3xl text-white">
            Land selected for a closer look.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
            Browse current Agricultural, NA and Industrial inventory across UrbanEdge’s focused
            service area.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="site-container">
          <div className="collection-intro">
            <div>
              <p className="eyebrow">Current inventory</p>
              <h2>All published properties</h2>
            </div>
            <span>Use category and transaction pages to narrow your starting point.</span>
          </div>
          <div className="mt-9">
            <PropertyCollection result={inventory} />
          </div>
        </div>
      </section>
    </main>
  );
}
