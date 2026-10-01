import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/dictionaries";
import {
  OFFICIAL_OFFICE_DIRECTIONS_URL,
  OFFICIAL_OFFICE_MAP_EMBED_URL,
} from "@/lib/config/public-business";

export function OfficeMap({ address, locale }: Readonly<{ address: string; locale: Locale }>) {
  return (
    <section className="office-map" aria-labelledby="office-map-heading">
      <div className="office-map-copy">
        <p className="eyebrow">UrbanEdge office</p>
        <h2 className="section-title" id="office-map-heading">
          {translate(locale, "contact.officeMap")}
        </h2>
        <address>{address}</address>
        <div className="office-map-actions">
          <a
            className="button button-primary"
            href={OFFICIAL_OFFICE_DIRECTIONS_URL}
            rel="noreferrer"
            target="_blank"
          >
            {translate(locale, "contact.directions")}
          </a>
        </div>
      </div>
      <div className="office-map-frame">
        <iframe
          src={OFFICIAL_OFFICE_MAP_EMBED_URL}
          title="UrbanEdge Living Space office location on Google Maps"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
        <noscript>{translate(locale, "contact.mapFallback")}</noscript>
      </div>
    </section>
  );
}
