import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SafeExternalMedia } from "@/components/media/safe-external-media";
import { AvailabilityBadge } from "@/components/public/availability-badge";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { ArrowIcon, LocationIcon } from "@/components/public/icons";
import { PropertyActions } from "@/components/public/property-actions";
import { CoreFactStrip, PropertyFacts } from "@/components/public/property-facts";
import { PropertyGallery } from "@/components/public/property-gallery";
import { PropertyCollection } from "@/components/public/property-collection";
import { PublicMap } from "@/components/public/public-map";
import { ShareButton } from "@/components/public/share-button";
import { VerificationExplainer } from "@/components/public/verification-explainer";
import type { PublicInventoryResult } from "@/server/queries/public-page-data";
import {
  loadPublicBusinessConfig,
  loadPublicInventory,
  loadPublicProperty,
} from "@/server/queries/public-page-data";
import {
  availabilityLabels,
  categoryLabels,
  formatPublicArea,
  formatPublicPrice,
  isClosedPublicAvailability,
  transactionLabels,
} from "@/lib/formatting/property-values";
import { buildPublicMediaUrl } from "@/lib/media/public-media-url";

type Props = Readonly<{ params: Promise<{ "property-slug": string }> }>;

export const dynamic = "force-dynamic";

function canonicalFor(slug: string, configured: string | null): string {
  const fallback = `/properties/${slug}`;
  return configured === fallback ? configured : fallback;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params)["property-slug"];
  const property = await loadPublicProperty(slug);
  if (!property) return { title: "Property not found", robots: { index: false, follow: false } };
  const canonical = canonicalFor(property.slug, property.seo.canonicalPath);
  const image = buildPublicMediaUrl(property.cover?.objectPath ?? null);
  return {
    title: property.seo.title || property.title,
    description:
      property.seo.description ||
      property.summary ||
      `${formatPublicArea(property.area)} ${categoryLabels[property.category]} in ${property.location.label}.`,
    alternates: { canonical },
    openGraph: {
      title: property.title,
      description:
        property.summary || `${categoryLabels[property.category]} — ${property.propertyCode}`,
      url: canonical,
      type: "website",
      ...(image
        ? {
            images: [
              {
                url: image,
                width: property.cover?.width ?? undefined,
                height: property.cover?.height ?? undefined,
                alt: property.cover?.altText || property.title,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const slug = (await params)["property-slug"];
  const property = await loadPublicProperty(slug);
  if (!property) notFound();

  const [config, relatedResult] = await Promise.all([
    loadPublicBusinessConfig(),
    loadPublicInventory({ category: property.category, limit: 4 }),
  ]);
  const related: PublicInventoryResult =
    relatedResult.status === "ready"
      ? {
          status: "ready",
          properties: relatedResult.properties.filter(({ id }) => id !== property.id).slice(0, 3),
        }
      : relatedResult;
  const closed = isClosedPublicAvailability(property.availability);
  const images = property.media.filter((item) => item.mediaType === "IMAGE");
  const galleryMedia = images.length > 0 ? images : property.cover ? [property.cover] : [];
  const externalMedia = property.media.filter(
    (item) =>
      (item.mediaType === "VIDEO" || item.mediaType === "PANORAMA_360") &&
      item.externalMediaId &&
      (item.externalProvider === "YOUTUBE" ||
        item.externalProvider === "VIMEO" ||
        item.externalProvider === "MATTERPORT"),
  );
  const brochures = property.media.filter(
    (item) => item.mediaType === "BROCHURE" && item.objectPath,
  );

  return (
    <main className="property-detail-page">
      <div className="site-container py-6 sm:py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Properties", href: "/properties" },
            { label: property.title },
          ]}
        />
      </div>

      <div className="site-container">
        {closed ? (
          <div className="closed-property-banner" role="status">
            <strong>
              This property is {availabilityLabels[property.availability].toLowerCase()}.
            </strong>
            <span>
              Its page remains available for reference, but it is not presented as active inventory.
            </span>
          </div>
        ) : null}
        <PropertyGallery media={galleryMedia} title={property.title} />

        <div className="property-title-block">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="property-pill dark">{categoryLabels[property.category]}</span>
              <span className="transaction-label">
                {transactionLabels[property.transactionType]}
              </span>
              <AvailabilityBadge status={property.availability} />
            </div>
            <p className="property-code mt-6">{property.propertyCode}</p>
            <h1>{property.title}</h1>
            <p className="property-detail-location">
              <LocationIcon className="size-5" />{" "}
              {property.location.label || "Location details available through UrbanEdge"}
            </p>
          </div>
          <ShareButton title={property.title} propertyCode={property.propertyCode} />
        </div>

        <CoreFactStrip property={property} />

        <div className="property-detail-layout">
          <div className="property-detail-main">
            <section className="detail-section" aria-labelledby="property-overview">
              <p className="eyebrow">Overview</p>
              <h2 id="property-overview">Property at a glance</h2>
              <p className="detail-description">
                {property.description ||
                  property.summary ||
                  "Speak with UrbanEdge for the approved public overview of this land opportunity."}
              </p>
            </section>

            <PropertyFacts property={property} />

            <section className="detail-section" aria-labelledby="location-heading">
              <p className="eyebrow">Location</p>
              <h2 id="location-heading">
                {property.location.visibility === "EXACT"
                  ? "Exact public location"
                  : property.location.visibility === "APPROXIMATE"
                    ? "Approximate location"
                    : "Location details through UrbanEdge"}
              </h2>
              <p className="section-copy">
                {property.location.label ||
                  "The public listing intentionally withholds detailed location information."}
              </p>
              <div className="mt-6">
                <PublicMap
                  location={property.location}
                  styleUrl={process.env.NEXT_PUBLIC_MAP_STYLE_URL || null}
                />
              </div>
            </section>

            <VerificationExplainer verifications={property.verifications} />

            {externalMedia.length > 0 || brochures.length > 0 ? (
              <section className="detail-section" aria-labelledby="property-media">
                <p className="eyebrow">More property media</p>
                <h2 id="property-media">Video, drone, brochure and 360°</h2>
                <div className="external-media-grid">
                  {externalMedia.map((item) => (
                    <SafeExternalMedia
                      key={item.id}
                      provider={item.externalProvider as "YOUTUBE" | "VIMEO" | "MATTERPORT"}
                      mediaId={item.externalMediaId as string}
                      title={
                        item.mediaSubtype === "DRONE"
                          ? "Drone video"
                          : item.mediaType === "PANORAMA_360"
                            ? "360° property experience"
                            : "Property video"
                      }
                    />
                  ))}
                </div>
                {brochures.map((item) => {
                  const url = buildPublicMediaUrl(item.objectPath);
                  return url ? (
                    <a
                      className="button button-outline mt-5"
                      href={url}
                      key={item.id}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open approved brochure
                    </a>
                  ) : null;
                })}
              </section>
            ) : null}

            <section
              id="property-contact"
              className="detail-section property-contact-section"
              aria-labelledby="contact-heading"
            >
              <p className="eyebrow">Speak with UrbanEdge</p>
              <h2 id="contact-heading">Use {property.propertyCode} when you contact us.</h2>
              <p>
                {closed
                  ? "This listing is closed. UrbanEdge can help you explore current alternatives."
                  : "Ask a question, discuss suitability or request help coordinating a site visit."}
              </p>
              <PropertyActions property={property} config={config} />
            </section>

            <section className="property-disclaimer" aria-label="Property information disclaimer">
              <strong>Important information</strong>
              <p>
                Property information is presented from approved public records and supplied material
                for preliminary discovery. Buyers should complete property-specific legal, revenue,
                planning, measurement and transaction due diligence with appropriate professionals
                before proceeding.
              </p>
            </section>
          </div>

          <aside className="property-sidebar" aria-label="Property commercial summary">
            <p className="eyebrow">Commercial summary</p>
            <strong className="property-price">
              {property.price ? formatPublicPrice(property.price) : "Price on request"}
            </strong>
            {property.price?.negotiable ? (
              <span className="negotiable-note">Negotiable</span>
            ) : null}
            <dl>
              <div>
                <dt>Area</dt>
                <dd>{formatPublicArea(property.area)}</dd>
              </div>
              <div>
                <dt>Availability</dt>
                <dd>{availabilityLabels[property.availability]}</dd>
              </div>
              <div>
                <dt>Property ID</dt>
                <dd>{property.propertyCode}</dd>
              </div>
            </dl>
            <PropertyActions property={property} config={config} />
          </aside>
        </div>

        <section className="section related-section">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Related land</p>
              <h2 className="section-title mt-2">
                Other {categoryLabels[property.category].toLowerCase()}
              </h2>
            </div>
            <Link
              href={
                property.category === "AGRICULTURAL"
                  ? "/agricultural-land"
                  : property.category === "NA"
                    ? "/na-land"
                    : "/industrial-land"
              }
              className="text-link"
            >
              See category <ArrowIcon className="size-4" />
            </Link>
          </div>
          <div className="mt-9">
            <PropertyCollection
              result={related}
              emptyTitle="No related published land is available right now."
            />
          </div>
        </section>
      </div>
      <PropertyActions property={property} config={config} mobile />
    </main>
  );
}
