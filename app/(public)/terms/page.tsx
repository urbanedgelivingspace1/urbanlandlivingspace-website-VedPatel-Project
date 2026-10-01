import type { Metadata } from "next";
import { InformationPage } from "@/components/public/information-page";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { NOINDEX_FOLLOW } from "@/lib/seo/robots";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = buildPublicMetadata({
  title: "Website Terms",
  description:
    "Terms for using the UrbanEdge Land Space website and public land-discovery information.",
  path: "/terms",
  robots: NOINDEX_FOLLOW,
});
export default async function Page() {
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <InformationPage
      eyebrow={t("terms.eyebrow")}
      title={t("terms.title")}
      intro={t("terms.intro")}
      updated="6 September 2026"
      body={
        locale === "en"
          ? "## Informational use\n\nWebsite content supports preliminary land discovery and communication. It is not a substitute for property-specific legal, revenue, planning, measurement, tax, financial or technical advice.\n\n## Listing information\n\nAvailability, price and property details can change. Public pages show the latest approved information available to UrbanEdge, but users should confirm material facts before acting. Price on Request does not disclose a numeric price.\n\n## Acceptable use\n\nDo not attempt to access admin areas, private documents, owner details, restricted coordinates or other non-public systems. Do not misuse forms, interfere with the service or reproduce content in a misleading way.\n\n## No transaction by website use\n\nBrowsing, enquiring or requesting a site visit does not reserve land, create a binding transaction or confirm a visit. UrbanEdge coordinates the next step manually."
          : t("terms.bodyLocalized")
      }
    />
  );
}
