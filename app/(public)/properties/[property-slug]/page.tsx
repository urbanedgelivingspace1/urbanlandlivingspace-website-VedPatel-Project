import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { permanentRedirect } from "next/navigation";

import { AvailabilityBadge } from "@/components/public/availability-badge";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { ArrowIcon, LocationIcon } from "@/components/public/icons";
import { PropertyActions } from "@/components/public/property-actions";
import { PropertyInquiryForm } from "@/components/public/intake-forms";
import { submitPropertyInquiryAction } from "@/app/(public)/intake-actions";
import { CoreFactStrip, PropertyFacts } from "@/components/public/property-facts";
import { PropertyGallery } from "@/components/public/property-gallery";
import { PropertyCollection } from "@/components/public/property-collection";
import { PropertyBrochureLink } from "@/components/public/property-brochure-link";
import { GoogleMapsEmbed } from "@/components/public/google-maps-embed";
import { ShareButton } from "@/components/public/share-button";
import { VerificationExplainer } from "@/components/public/verification-explainer";
import type { PublicInventoryResult } from "@/server/queries/public-page-data";
import {
  loadPublicBusinessConfig,
  loadPublicInventory,
  loadPublicProperty,
} from "@/server/queries/public-page-data";
import {
  categoryLabels,
  formatPublicArea,
  formatPublicPrice,
  isClosedPublicAvailability,
} from "@/lib/formatting/property-values";
import type { availabilityLabels, transactionLabels } from "@/lib/formatting/property-values";
import { buildPublicMediaUrl } from "@/lib/media/public-media-url";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { propertyJsonLd } from "@/lib/seo/structured-data";
import { safeSeoText } from "@/lib/seo/privacy-safe-seo";
import { JsonLd } from "@/components/public/json-ld";
import { NearbyConnectivity } from "@/components/public/nearby-connectivity";
import { getPublicRedirect } from "@/server/queries/public-content";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate, type TranslationKey } from "@/lib/i18n/dictionaries";

const categoryTranslationKeys = {
  AGRICULTURAL: "nav.agricultural",
  NA: "nav.na",
  INDUSTRIAL: "nav.industrial",
} as const satisfies Record<keyof typeof categoryLabels, TranslationKey>;

const transactionTranslationKeys = {
  BUY: "common.forPurchase",
  RENT: "common.forRent",
  LEASE: "common.forLease",
} as const satisfies Record<keyof typeof transactionLabels, TranslationKey>;

const availabilityTranslationKeys = {
  AVAILABLE: "common.available",
  UNDER_NEGOTIATION: "common.underNegotiation",
  SOLD: "common.sold",
  RENTED: "common.rented",
  LEASED: "common.leased",
  OFF_MARKET: "common.temporarilyUnavailable",
} as const satisfies Record<keyof typeof availabilityLabels, TranslationKey>;

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
  const description = safeSeoText(
    property.seo.description,
    property.summary ||
      `${formatPublicArea(property.area)} ${categoryLabels[property.category]} in ${property.location.label}.`,
  );
  return buildPublicMetadata({
    title: safeSeoText(property.seo.title, property.title),
    description,
    path: canonical,
    canonicalPath: canonical,
    robots: { index: true, follow: true },
    image: image
      ? {
          url: image,
          width: property.cover?.width,
          height: property.cover?.height,
          alt: property.cover?.altText || property.title,
        }
      : null,
  });
}

export default async function PropertyDetailPage({ params }: Props) {
  const slug = (await params)["property-slug"];
  const property = await loadPublicProperty(slug);
  if (!property) {
    const redirect = await getPublicRedirect(`/properties/${slug}`);
    if (redirect) permanentRedirect(redirect.destinationPath);
    notFound();
  }

  const [config, relatedResult, locale] = await Promise.all([
    loadPublicBusinessConfig(),
    loadPublicInventory({ category: property.category, limit: 4 }),
    getRequestLocale(),
  ]);
  const t = (key: TranslationKey) => translate(locale, key);
  const categoryLabel = t(categoryTranslationKeys[property.category]);
  const transactionLabel = t(transactionTranslationKeys[property.transactionType]);
  const availabilityLabel = t(availabilityTranslationKeys[property.availability]);
  const related: PublicInventoryResult =
    relatedResult.status === "ready"
      ? {
          status: "ready",
          properties: relatedResult.properties.filter(({ id }) => id !== property.id).slice(0, 3),
        }
      : relatedResult;
  const closed = isClosedPublicAvailability(property.availability);
  const images = property.media.filter((item) => item.mediaType === "IMAGE");
  const galleryMedia = property.cover
    ? [property.cover, ...images.filter((item) => item.id !== property.cover?.id)]
    : images;
  const brochures = property.media.filter(
    (item) =>
      item.mediaType === "BROCHURE" &&
      (item.objectPath ||
        (item.externalProvider === "GOOGLE_DRIVE" && Boolean(item.externalMediaId))),
  );
  const categoryPath =
    property.category === "AGRICULTURAL"
      ? "/agricultural-land"
      : property.category === "NA"
        ? "/na-land"
        : "/industrial-land";
  const breadcrumbItems = [
    { label: t("common.home"), href: "/" },
    { label: categoryLabel, href: categoryPath },
    { label: property.location.label || t("common.land") },
    { label: property.title },
  ];

  return (
    <main className="property-detail-page">
      <JsonLd data={propertyJsonLd(property, breadcrumbItems)} />
      <div className="site-container py-6 sm:py-8">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="site-container site-container-wide">
        {closed ? (
          <div className="closed-property-banner" role="status">
            <strong>{availabilityLabel}</strong>
            <span>
              Its page remains available for reference, but it is not presented as active inventory.
            </span>
          </div>
        ) : null}
        <PropertyGallery media={galleryMedia} title={property.title} coverId={property.cover?.id} />

        <div className="property-title-block">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="property-pill dark">{categoryLabel}</span>
              <span className="transaction-label">{transactionLabel}</span>
              <AvailabilityBadge status={property.availability} locale={locale} />
            </div>
            <p className="property-code mt-6">{property.propertyCode}</p>
            <h1>{property.title}</h1>
            <p className="property-detail-location">
              <LocationIcon className="size-5" />{" "}
              {property.location.label || t("common.locationUnavailable")}
            </p>
          </div>
          <div className="property-title-actions">
            <ShareButton title={property.title} propertyCode={property.propertyCode} />
            {brochures[0] ? <PropertyBrochureLink brochure={brochures[0]} /> : null}
          </div>
        </div>

        <CoreFactStrip property={property} />

        <div className="property-detail-layout">
          <div className="property-detail-main">
            <section className="detail-section" aria-labelledby="property-overview">
              <p className="eyebrow">{t("property.overview")}</p>
              <h2 id="property-overview">{t("property.glance")}</h2>
              <p className="detail-description">
                {property.description || property.summary || t("property.overviewFallback")}
              </p>
            </section>

            <PropertyFacts property={property} />

            <section className="detail-section" aria-labelledby="location-heading">
              <p className="eyebrow">{t("property.location")}</p>
              <h2 id="location-heading">{t("property.location")}</h2>
              <p className="section-copy location-title">
                {property.location.label || t("property.locationHidden")}
              </p>
              <div className="mt-6">
                {property.googleMapsEmbedUrl ? (
                  <GoogleMapsEmbed
                    url={property.googleMapsEmbedUrl}
                    title={property.location.label || property.title}
                  />
                ) : (
                  <div className="map-fallback">
                    <strong>Map location is not available for this property.</strong>
                    <p>Contact our team for property-specific location details.</p>
                  </div>
                )}
              </div>
            </section>

            <NearbyConnectivity
              summary={
                property.categoryDetails.category === "INDUSTRIAL"
                  ? property.categoryDetails.connectivitySummary
                  : null
              }
            />

            {property.verifications.length > 0 ? (
              <VerificationExplainer verifications={property.verifications} />
            ) : null}

            <section
              id="property-contact"
              className="detail-section property-contact-section"
              aria-labelledby="contact-heading"
            >
              <p className="eyebrow">{t("property.contactEyebrow")}</p>
              <h2 id="contact-heading">Use {property.propertyCode} when you contact us.</h2>
              <p>
                {closed
                  ? "This listing is closed. UrbanEdge can help you explore current alternatives."
                  : t("property.contactBody")}
              </p>
              <PropertyActions property={property} config={config} />
              {!closed ? (
                <div id="property-inquiry" className="mt-8 scroll-mt-24">
                  <PropertyInquiryForm
                    action={submitPropertyInquiryAction.bind(null, {
                      propertySlug: property.slug,
                    })}
                    idempotencyKey={randomUUID()}
                    turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                  />
                </div>
              ) : null}
            </section>

            <section className="property-disclaimer" aria-label="Property information disclaimer">
              <strong>{t("property.important")}</strong>
              <p>
                Property information is provided for initial discovery from records and material
                available to UrbanEdge. Buyers should complete property-specific legal, revenue,
                planning, measurement and transaction checks with appropriate professionals before
                proceeding.
              </p>
            </section>
          </div>

          <aside className="property-sidebar" aria-label="Property commercial summary">
            <p className="eyebrow">{t("property.commercial")}</p>
            <strong className="property-price">
              {property.price
                ? property.price.mode === "PRICE_ON_REQUEST"
                  ? t("common.priceOnRequest")
                  : formatPublicPrice(property.price)
                : t("common.priceOnRequest")}
            </strong>
            {property.price?.negotiable ? (
              <span className="negotiable-note">{t("common.negotiable")}</span>
            ) : null}
            <dl>
              <div>
                <dt>{t("property.area")}</dt>
                <dd>{formatPublicArea(property.area)}</dd>
              </div>
              <div>
                <dt>{t("property.availability")}</dt>
                <dd>{availabilityLabel}</dd>
              </div>
              <div>
                <dt>{t("property.id")}</dt>
                <dd>{property.propertyCode}</dd>
              </div>
            </dl>
            <PropertyActions property={property} config={config} />
          </aside>
        </div>

        <section className="section related-section">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">{t("property.related")}</p>
              <h2 className="section-title mt-2">{categoryLabel}</h2>
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
              {t("property.seeCategory")} <ArrowIcon className="size-4" />
            </Link>
          </div>
          <div className="mt-9">
            <PropertyCollection
              result={related}
              emptyTitle="No related published land is available right now."
              locale={locale}
            />
          </div>
        </section>
      </div>
      <PropertyActions property={property} config={config} mobile />
    </main>
  );
}
