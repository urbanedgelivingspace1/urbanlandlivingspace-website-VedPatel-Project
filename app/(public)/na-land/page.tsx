import type { Metadata } from "next";
import { CategoryLanding } from "@/components/public/category-landing";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "NA Land",
  description:
    "Explore curated NA land with carefully scoped status, planning, access and utility context.",
  alternates: { canonical: "/na-land" },
};
export default function Page() {
  return <CategoryLanding category="NA" />;
}
