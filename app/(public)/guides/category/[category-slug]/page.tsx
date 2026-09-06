import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GuideIndex } from "@/components/public/guide-index";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { isGuideCategoryIndexable } from "@/lib/seo/indexability";
import { listPublicGuideCategories, listPublicGuides } from "@/server/queries/public-content";

type Props = Readonly<{ params: Promise<{ "category-slug": string }> }>;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params)["category-slug"];
  const categories = await listPublicGuideCategories();
  const category = categories.find((item) => item.slug === slug);
  if (!category)
    return { title: "Guide category not found", robots: { index: false, follow: false } };
  const guides = await listPublicGuides(slug);
  return buildPublicMetadata({
    title: `${category.name} Guides`,
    description:
      category.description ?? `Published ${category.name.toLowerCase()} guides from UrbanEdge.`,
    path: `/guides/category/${slug}`,
    robots: { index: isGuideCategoryIndexable(category.description, guides), follow: true },
  });
}

export default async function Page({ params }: Props) {
  const slug = (await params)["category-slug"];
  const [categories, guides] = await Promise.all([
    listPublicGuideCategories(),
    listPublicGuides(slug),
  ]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  return (
    <GuideIndex
      guides={guides}
      categories={categories}
      title={`${category.name} guides`}
      description={category.description ?? undefined}
      category={category}
    />
  );
}
