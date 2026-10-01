import Link from "next/link";

import type { PublicBusinessConfig } from "@/lib/config/public-business";
import { buildTelephoneUrl, buildWhatsAppUrl } from "@/lib/config/public-business";
import type { PublicInventoryResult } from "@/server/queries/public-page-data";

import { MessageIcon, PhoneIcon } from "./icons";

import { PropertyCard } from "./property-card";

export function PropertyCollection({
  result,
  emptyTitle = "No published land is listed here yet.",
  emptyBody = "Tell UrbanEdge what you are looking for and our team can assist with suitable opportunities.",
  contactConfig,
}: Readonly<{
  result: PublicInventoryResult;
  emptyTitle?: string;
  emptyBody?: string;
  contactConfig?: PublicBusinessConfig;
}>) {
  if (result.status === "unavailable") {
    return (
      <div className="empty-state" role="status">
        <p className="eyebrow">Temporarily unavailable</p>
        <h3>We could not load the latest land opportunities right now.</h3>
        <p>Please try again shortly or contact UrbanEdge for help with your requirement.</p>
        <div className="empty-state-actions">
          <Link className="button button-primary" href="/properties">
            Retry
          </Link>
          <Link className="button button-outline" href="/contact" prefetch={false}>
            Contact UrbanEdge
          </Link>
        </div>
      </div>
    );
  }
  if (result.properties.length === 0) {
    const telephone = contactConfig ? buildTelephoneUrl(contactConfig) : null;
    const whatsapp = contactConfig ? buildWhatsAppUrl(contactConfig) : null;
    return (
      <div className="empty-state">
        <p className="eyebrow">Curated inventory</p>
        <h3>{emptyTitle}</h3>
        <p>{emptyBody}</p>
        <div className="empty-state-actions">
          <Link className="button button-primary" href="/requirements" prefetch={false}>
            Share Your Requirement
          </Link>
          {whatsapp ? (
            <a className="button button-whatsapp" href={whatsapp} target="_blank" rel="noreferrer">
              <MessageIcon className="size-4" /> WhatsApp UrbanEdge
            </a>
          ) : null}
          {telephone ? (
            <a className="button button-outline" href={telephone}>
              <PhoneIcon className="size-4" /> Call UrbanEdge
            </a>
          ) : null}
        </div>
      </div>
    );
  }
  return (
    <div className="property-grid">
      {result.properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
