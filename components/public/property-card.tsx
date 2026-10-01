import Link from "next/link";

import type { PublicPropertyCardDto } from "@/features/properties/domain/contracts";
import { formatPublicArea, formatPublicPrice } from "@/lib/formatting/property-values";
import type { Locale } from "@/lib/i18n/config";
import { translate, type TranslationKey } from "@/lib/i18n/dictionaries";

import { AreaIcon, ArrowIcon, LocationIcon } from "./icons";
import { AvailabilityBadge } from "./availability-badge";
import { PropertyImage } from "./property-image";

const categoryTranslationKeys = {
  AGRICULTURAL: "nav.agricultural",
  NA: "nav.na",
  INDUSTRIAL: "nav.industrial",
} as const satisfies Record<PublicPropertyCardDto["category"], TranslationKey>;

const transactionTranslationKeys = {
  BUY: "common.forPurchase",
  RENT: "common.forRent",
  LEASE: "common.forLease",
} as const satisfies Record<PublicPropertyCardDto["transactionType"], TranslationKey>;

export function PropertyCard({
  property,
  locale = "en",
}: Readonly<{ property: PublicPropertyCardDto; locale?: Locale }>) {
  const t = (key: TranslationKey) => translate(locale, key);
  return (
    <article className="property-card group">
      <Link href={`/properties/${property.slug}`} className="property-card-media">
        <PropertyImage
          objectPath={property.cover?.objectPath ?? null}
          alt={property.cover?.altText ?? property.title}
          sizes="(max-width: 767px) calc(100vw - 2.5rem), (max-width: 1199px) 50vw, 390px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
        />
        <div className="property-card-badges">
          <span className="property-pill">{t(categoryTranslationKeys[property.category])}</span>
          <AvailabilityBadge status={property.availability} locale={locale} />
        </div>
      </Link>

      <div className="property-card-body">
        <div className="flex items-center justify-between gap-3">
          <p className="property-code">{property.propertyCode}</p>
          <span className="transaction-label">
            {t(transactionTranslationKeys[property.transactionType])}
          </span>
        </div>
        <h3 className="property-card-title">
          <Link href={`/properties/${property.slug}`}>{property.title}</Link>
        </h3>
        <p className="property-location">
          <LocationIcon className="size-4 shrink-0" />
          <span>{property.location.label || t("common.locationUnavailable")}</span>
        </p>
        <div className="property-card-facts">
          <span>
            <AreaIcon className="size-4" /> {formatPublicArea(property.area)}
          </span>
          <strong>
            {property.price
              ? property.price.mode === "PRICE_ON_REQUEST"
                ? t("common.priceOnRequest")
                : formatPublicPrice(property.price)
              : t("common.priceOnRequest")}
          </strong>
        </div>
        {property.price?.negotiable ? (
          <p className="mt-2 text-xs text-slate-500">{t("common.negotiable")}</p>
        ) : null}
        <Link className="property-card-link" href={`/properties/${property.slug}`}>
          {t("common.viewDetails")} <ArrowIcon className="size-4" />
        </Link>
      </div>
    </article>
  );
}
