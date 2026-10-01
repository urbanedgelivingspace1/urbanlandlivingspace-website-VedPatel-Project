import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/dictionaries";

export function OfficeMap({
  address,
  mapUrl,
  locale,
}: Readonly<{ address: string; mapUrl: string; locale: Locale }>) {
  const encodedAddress = encodeURIComponent(address);
  const embedUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;

  return (
    <section className="office-map" aria-labelledby="office-map-heading">
      <div className="office-map-copy">
        <p className="eyebrow">UrbanEdge office</p>
        <h2 className="section-title" id="office-map-heading">
          {translate(locale, "contact.officeMap")}
        </h2>
        <address>{address}</address>
        <div className="office-map-actions">
          <a className="button button-primary" href={mapUrl} rel="noreferrer" target="_blank">
            {translate(locale, "contact.openMaps")}
          </a>
          <a
            className="button button-outline"
            href={directionsUrl}
            rel="noreferrer"
            target="_blank"
          >
            {translate(locale, "contact.directions")}
          </a>
        </div>
      </div>
      <div className="office-map-frame">
        <iframe
          src={embedUrl}
          title={translate(locale, "contact.officeMap")}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <noscript>{translate(locale, "contact.mapFallback")}</noscript>
      </div>
    </section>
  );
}
