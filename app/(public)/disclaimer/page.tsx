import type { Metadata } from "next";
import { InformationPage } from "@/components/public/information-page";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { NOINDEX_FOLLOW } from "@/lib/seo/robots";

export const metadata: Metadata = buildPublicMetadata({
  title: "Land Information Disclaimer",
  description:
    "Important limits for UrbanEdge Land Space listings, guides and scoped review information.",
  path: "/disclaimer",
  robots: NOINDEX_FOLLOW,
});
export default function Page() {
  return (
    <InformationPage
      eyebrow="Important information"
      title="Land information disclaimer"
      intro="Use UrbanEdge pages for preliminary discovery, then verify the actual property and proposed transaction with appropriate professionals."
      updated="6 September 2026"
      body={
        "## No universal verification claim\n\nA displayed review signal applies only to the named check, evidence scope and review date. It does not mean the property is fully verified, legally approved, title-clear or suitable for every intended use.\n\n## Location privacy\n\nA listing may use an exact, approximate or hidden public location. An approximate map point is deliberately public-safe and is not the private parcel coordinate. Contact UrbanEdge for the appropriate next-step process.\n\n## Planning and category language\n\nAgricultural, NA and Industrial descriptions reflect approved available context. They do not guarantee buyer eligibility, development rights, construction permission, authority approval, infrastructure capacity or future policy outcomes.\n\n## Commercial information\n\nPrice, availability and transaction terms can change. Price on Request omits a public numeric price. Sold, rented, leased and off-market pages are labelled as closed and should not be treated as active offers.\n\n## Independent due diligence\n\nBefore proceeding, complete property-specific legal, revenue, planning, measurement, tax, environmental, engineering and commercial checks with appropriate professionals and authorities."
      }
    />
  );
}
