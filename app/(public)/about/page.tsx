import type { Metadata } from "next";
import { InformationPage } from "@/components/public/information-page";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = buildPublicMetadata({
  title: "About UrbanEdge Land Space",
  description:
    "How UrbanEdge curates public land information and supports discovery, enquiries and site visits across Ahmedabad and Gandhinagar.",
  path: "/about",
  robots: { index: true, follow: true },
});

export default async function Page() {
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <InformationPage
      eyebrow={t("about.eyebrow")}
      title={t("about.title")}
      intro={t("about.intro")}
      body={
        locale === "en"
          ? "## Land is our focus\n\nUrbanEdge Land Space specializes in Agricultural, NA and Industrial land for buy, rent and lease. We work with individual buyers, investors, developers, builders, industrial businesses, farmers, NRIs and landowners—without treating every requirement like a generic property search.\n\n## Ahmedabad and Gandhinagar expertise\n\nOur launch focus is the connected Ahmedabad–Gandhinagar land market. Local geography, village and taluka context, access, planning, infrastructure and intended use all shape whether a property is genuinely suitable.\n\n## Support for buyers and landowners\n\nBuyers can explore published opportunities or share a detailed requirement. Landowners can privately submit land they want to sell, rent or lease. UrbanEdge reviews owner information before any decision about a public listing, and restricted contact, document and exact-location details remain private.\n\n## How UrbanEdge works\n\nStart with a search or requirement, compare the available land information, speak with our team using the Property ID and request a site visit. UrbanEdge then coordinates the next conversation while property-specific legal, revenue, planning, measurement and technical checks remain tied to the actual land.\n\n## Responsible property information\n\nWhere UrbanEdge publishes a review summary, it explains the specific information considered and the important limits. We do not use a review as a blanket promise of clear title, legality, approval, suitability or return.\n\nUrbanEdge Land Space and UrbanEdge Living Space are equal partner brands within the wider UrbanEdge real-estate ecosystem, each focused on its own real-estate segment."
          : t("about.bodyLocalized")
      }
    />
  );
}
