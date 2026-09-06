import type { Metadata } from "next";
import { InformationPage } from "@/components/public/information-page";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  title: "About UrbanEdge Land Space",
  description:
    "How UrbanEdge curates public land information and supports discovery, enquiries and site visits across Ahmedabad and Gandhinagar.",
  path: "/about",
  robots: { index: true, follow: true },
});

export default function Page() {
  return (
    <InformationPage
      eyebrow="About UrbanEdge"
      title="A focused, human land-discovery service"
      intro="UrbanEdge Land Space brings curated public inventory, local context and brokerage support into one careful discovery experience."
      body={
        "## What we do\n\nUrbanEdge helps buyers and occupiers explore Agricultural, NA and Industrial land across Ahmedabad and Gandhinagar. We keep each published property tied to a stable Property ID and present only the location, commercial, category and media information approved for public use.\n\n## A curated publication boundary\n\nAn owner submission is not a live listing. Drafts, internal review notes, owner contact information, private evidence and restricted coordinates remain outside public discovery. A property appears publicly only after the separate publication checks pass.\n\n## Useful context, honest limits\n\nScoped review summaries describe only the checks actually completed. They are not a universal promise of legal clearance, title, permission, suitability or return. Buyers should complete property-specific legal, revenue, planning, measurement, tax and technical due diligence with appropriate professionals.\n\n## The brokerage journey\n\nExplore published land, enquire using the Property ID, discuss the requirement and request a manually coordinated visit. UrbanEdge supports the conversation while keeping commercial decisions and professional checks tied to the actual property."
      }
    />
  );
}
