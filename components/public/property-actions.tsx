import type { PublicBusinessConfig } from "@/lib/config/public-business";
import { buildTelephoneUrl, buildWhatsAppUrl } from "@/lib/config/public-business";
import type { PublicPropertyDetailDto } from "@/features/properties/domain/contracts";
import { isClosedPublicAvailability } from "@/lib/formatting/property-values";

import { MessageIcon, PhoneIcon } from "./icons";

export function PropertyActions({
  property,
  config,
  mobile = false,
}: Readonly<{
  property: PublicPropertyDetailDto;
  config: PublicBusinessConfig;
  mobile?: boolean;
}>) {
  const closed = isClosedPublicAvailability(property.availability);
  const whatsApp = buildWhatsAppUrl(config, {
    propertyCode: property.propertyCode,
    title: property.title,
  });
  const telephone = buildTelephoneUrl(config);
  const className = mobile
    ? `mobile-sticky-actions${closed ? " is-closed" : ""}`
    : "property-actions";

  if (closed) {
    return (
      <div className={className}>
        <Link href="/properties" className="button button-primary">
          Find similar land
        </Link>
        <Link href="/requirements" className="button button-outline" prefetch={false}>
          Tell us your requirement
        </Link>
      </div>
    );
  }

  return (
    <div className={className}>
      {!mobile ? (
        <a href="#property-contact" className="button button-primary">
          Enquire now
        </a>
      ) : null}
      {telephone ? (
        <a href={telephone} className="button button-outline">
          <PhoneIcon className="size-4" /> <span>{mobile ? "Call" : "Call UrbanEdge"}</span>
        </a>
      ) : (
        <span
          className="button button-disabled"
          aria-disabled="true"
          title="Business phone is not configured"
        >
          <PhoneIcon className="size-4" /> <span>Call</span>
        </span>
      )}
      {whatsApp ? (
        <a href={whatsApp} className="button button-gold" rel="noreferrer" target="_blank">
          <MessageIcon className="size-4" /> WhatsApp
        </a>
      ) : (
        <span
          className="button button-disabled"
          aria-disabled="true"
          title="WhatsApp is not configured"
        >
          <MessageIcon className="size-4" /> WhatsApp
        </span>
      )}
      <a href="#property-contact" className="button button-outline">
        {mobile ? "Request visit" : "Request site visit"}
      </a>
    </div>
  );
}
import Link from "next/link";
