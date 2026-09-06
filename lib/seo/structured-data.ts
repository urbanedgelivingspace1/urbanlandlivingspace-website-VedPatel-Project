import type { PublicPropertyDetailDto } from "@/features/properties/domain/contracts";
import {
  categoryLabels,
  formatPublicArea,
  formatPublicPrice,
} from "@/lib/formatting/property-values";
import { buildPublicMediaUrl } from "@/lib/media/public-media-url";
import { absoluteCanonical } from "./canonical";
import type { BreadcrumbItem } from "./breadcrumbs";
import { breadcrumbJsonLd } from "./breadcrumbs";

const availability: Record<PublicPropertyDetailDto["availability"], string> = {
  AVAILABLE: "https://schema.org/InStock",
  UNDER_NEGOTIATION: "https://schema.org/LimitedAvailability",
  SOLD: "https://schema.org/OutOfStock",
  RENTED: "https://schema.org/OutOfStock",
  LEASED: "https://schema.org/OutOfStock",
  OFF_MARKET: "https://schema.org/OutOfStock",
};

export function organizationJsonLd(
  config: Readonly<{
    phone: string | null;
    email: string | null;
    officeAddress: string | null;
    livingSpaceUrl: string | null;
  }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${absoluteCanonical("/")}#organization`,
    name: "UrbanEdge Land Space",
    url: absoluteCanonical("/"),
    areaServed: ["Ahmedabad", "Gandhinagar"],
    ...(config.phone ? { telephone: config.phone } : {}),
    ...(config.email ? { email: config.email } : {}),
    ...(config.officeAddress ? { address: config.officeAddress } : {}),
    ...(config.livingSpaceUrl ? { sameAs: [config.livingSpaceUrl] } : {}),
  } as const;
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteCanonical("/")}#website`,
    name: "UrbanEdge Land Space",
    url: absoluteCanonical("/"),
    inLanguage: "en-IN",
    publisher: { "@id": `${absoluteCanonical("/")}#organization` },
  } as const;
}

export function propertyJsonLd(
  property: PublicPropertyDetailDto,
  breadcrumbs: readonly BreadcrumbItem[],
) {
  const url = absoluteCanonical(`/properties/${property.slug}`);
  const image = buildPublicMediaUrl(property.cover?.objectPath ?? null);
  const numericPrice = property.price?.mode === "EXACT_TOTAL" ? property.price.amount : null;
  const place = property.location.label
    ? {
        "@type": "Place",
        name: property.location.label,
        ...(property.location.point
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: property.location.point.latitude,
                longitude: property.location.point.longitude,
              },
            }
          : {}),
      }
    : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${url}#listing`,
    url,
    name: property.title,
    description:
      property.description ??
      property.summary ??
      `${formatPublicArea(property.area)} ${categoryLabels[property.category]}`,
    identifier: property.propertyCode,
    datePosted: property.publishedAt,
    inLanguage: "en-IN",
    ...(image ? { image: [image] } : {}),
    ...(place ? { about: place } : {}),
    ...(property.price
      ? {
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "INR",
            availability: availability[property.availability],
            ...(numericPrice !== null ? { price: numericPrice } : {}),
            description: formatPublicPrice(property.price),
          },
        }
      : {}),
    breadcrumb: breadcrumbJsonLd(breadcrumbs),
  } as const;
}

export function collectionJsonLd(
  input: Readonly<{
    name: string;
    description: string;
    path: string;
    items: readonly { title: string; slug?: string; path?: string }[];
  }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: absoluteCanonical(input.path),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: input.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: absoluteCanonical(item.path ?? `/properties/${item.slug ?? ""}`),
      })),
    },
  } as const;
}

export function articleJsonLd(
  input: Readonly<{
    title: string;
    description: string;
    path: string;
    publishedAt: string;
    updatedAt: string;
    image?: string | null;
  }>,
) {
  const url = absoluteCanonical(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    mainEntityOfPage: url,
    url,
    inLanguage: "en-IN",
    publisher: { "@id": `${absoluteCanonical("/")}#organization` },
    ...(input.image ? { image: [input.image] } : {}),
  } as const;
}
