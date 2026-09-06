import { absoluteCanonical } from "./canonical";

export type BreadcrumbItem = Readonly<{ label: string; href?: string }>;

export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteCanonical(item.href) } : {}),
    })),
  } as const;
}
