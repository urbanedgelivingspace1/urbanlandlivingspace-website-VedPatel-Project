import type { Metadata } from "next";
import { InformationPage } from "@/components/public/information-page";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { NOINDEX_FOLLOW } from "@/lib/seo/robots";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = buildPublicMetadata({
  title: "Privacy Notice",
  description:
    "How UrbanEdge Land Space handles public enquiries, buyer requirements and owner submissions.",
  path: "/privacy",
  robots: NOINDEX_FOLLOW,
});
export default async function Page() {
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <InformationPage
      eyebrow={t("privacy.eyebrow")}
      title={t("privacy.title")}
      intro={t("privacy.intro")}
      updated="6 September 2026"
      body={
        locale === "en"
          ? "## Information you provide\n\nEnquiry, requirement, contact, site-visit and owner-submission forms collect the details needed for the stated brokerage purpose. Some owner documents and exact property location details are treated as private operational information.\n\n## How information is used\n\nUrbanEdge uses submitted information to review the request, communicate, manage brokerage operations, prevent abuse and keep a necessary audit trail. A submission does not automatically become public inventory.\n\n## Public and private boundaries\n\nPublished property pages use a restricted public projection. Owner contact information, CRM records, private documents, internal notes, review evidence and private coordinates are not included in public HTML, metadata, structured data or sitemaps.\n\n## Retention and requests\n\nRecords are retained according to operational, legal and security needs. Contact UrbanEdge using the published business channels for a privacy question or request. Final production retention and rights wording remains subject to owner and legal approval."
          : t("privacy.bodyLocalized")
      }
    />
  );
}
