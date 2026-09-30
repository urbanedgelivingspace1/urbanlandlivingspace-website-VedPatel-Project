import Link from "next/link";

import type { PublicPropertyCardDto } from "@/features/properties/domain/contracts";
import {
  categoryLabels,
  formatPublicArea,
  formatPublicPrice,
  transactionLabels,
} from "@/lib/formatting/property-values";

import { AreaIcon, ArrowIcon, LocationIcon } from "./icons";
import { AvailabilityBadge } from "./availability-badge";
import { PropertyImage } from "./property-image";

export function PropertyCard({ property }: Readonly<{ property: PublicPropertyCardDto }>) {
  return (
    <article className="property-card group">
      <Link href={`/properties/${property.slug}`} className="property-card-media">
        <PropertyImage
          objectPath={property.cover?.objectPath ?? null}
          alt={property.cover?.altText ?? property.title}
          sizes="(max-width: 767px) calc(100vw - 2.5rem), (max-width: 1199px) 50vw, 390px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
        />
        <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-4">
          <span className="property-pill">{categoryLabels[property.category]}</span>
          <AvailabilityBadge status={property.availability} />
        </div>
      </Link>

      <div className="property-card-body">
        <div className="flex items-center justify-between gap-3">
          <p className="property-code">{property.propertyCode}</p>
          <span className="transaction-label">{transactionLabels[property.transactionType]}</span>
        </div>
        <h3 className="property-card-title">
          <Link href={`/properties/${property.slug}`}>{property.title}</Link>
        </h3>
        <p className="property-location">
          <LocationIcon className="size-4 shrink-0" />
          <span>{property.location.label || "Location details available through UrbanEdge"}</span>
        </p>
        <div className="property-card-facts">
          <span>
            <AreaIcon className="size-4" /> {formatPublicArea(property.area)}
          </span>
          <strong>{property.price ? formatPublicPrice(property.price) : "Price on request"}</strong>
        </div>
        {property.price?.negotiable ? (
          <p className="mt-2 text-xs text-slate-500">Negotiable</p>
        ) : null}
        <Link className="property-card-link" href={`/properties/${property.slug}`}>
          View details <ArrowIcon className="size-4" />
        </Link>
      </div>
    </article>
  );
}
