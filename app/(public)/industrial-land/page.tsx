import type { Metadata } from "next";
import { CategoryLanding } from "@/components/public/category-landing";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Industrial Land",
  description:
    "Explore industrial land with estate, authority, infrastructure and connectivity context.",
  alternates: { canonical: "/industrial-land" },
};
export default function Page() {
  return <CategoryLanding category="INDUSTRIAL" />;
}
