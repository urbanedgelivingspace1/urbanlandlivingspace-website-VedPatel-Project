import type { Metadata } from "next";
import { CategoryLanding } from "@/components/public/category-landing";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Agricultural Land",
  description:
    "Explore curated agricultural land with access, water, area and use context across Ahmedabad and Gandhinagar.",
  alternates: { canonical: "/agricultural-land" },
};
export default function Page() {
  return <CategoryLanding category="AGRICULTURAL" />;
}
