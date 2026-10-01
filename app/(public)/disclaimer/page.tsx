import type { Metadata } from "next";
import { InformationPage } from "@/components/public/information-page";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { NOINDEX_FOLLOW } from "@/lib/seo/robots";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = buildPublicMetadata({
  title: "Land Information Disclaimer",
  description:
    "Important limits for UrbanEdge Land Space listings, guides and scoped review information.",
  path: "/disclaimer",
  robots: NOINDEX_FOLLOW,
});
export default async function Page() {
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <InformationPage
      eyebrow={t("disclaimer.eyebrow")}
      title={t("disclaimer.title")}
      intro={t("disclaimer.intro")}
      updated="6 September 2026"
      body={
        locale === "en"
          ? "## No universal verification claim\n\nA displayed review signal applies only to the named check, evidence scope and review date. It does not mean the property is fully verified, legally approved, title-clear or suitable for every intended use.\n\n## Location privacy\n\nA listing may use an exact, approximate or hidden public location. An approximate map point is deliberately public-safe and is not the private parcel coordinate. Contact UrbanEdge for the appropriate next-step process.\n\n## Planning and category language\n\nAgricultural, NA and Industrial descriptions reflect approved available context. They do not guarantee buyer eligibility, development rights, construction permission, authority approval, infrastructure capacity or future policy outcomes.\n\n## Commercial information\n\nPrice, availability and transaction terms can change. Price on Request omits a public numeric price. Sold, rented, leased and off-market pages are labelled as closed and should not be treated as active offers.\n\n## Independent due diligence\n\nBefore proceeding, complete property-specific legal, revenue, planning, measurement, tax, environmental, engineering and commercial checks with appropriate professionals and authorities."
          : t("disclaimer.bodyLocalized")
      }
    />
  );
}
