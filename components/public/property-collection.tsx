import Link from "next/link";

import type { PublicBusinessConfig } from "@/lib/config/public-business";
import { buildTelephoneUrl, buildWhatsAppUrl } from "@/lib/config/public-business";
import type { PublicInventoryResult } from "@/server/queries/public-page-data";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/dictionaries";

import { PhoneIcon } from "./icons";

import { PropertyCard } from "./property-card";

export function PropertyCollection({
  result,
  emptyTitle = "No published land is listed here yet.",
  emptyBody = "Tell UrbanEdge what you are looking for and our team can assist with suitable opportunities.",
  contactConfig,
  locale = "en",
}: Readonly<{
  result: PublicInventoryResult;
  emptyTitle?: string;
  emptyBody?: string;
  contactConfig?: PublicBusinessConfig;
  locale?: Locale;
}>) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const localizedEmptyTitle =
    emptyTitle === "No published land is listed here yet."
      ? t("common.emptyInventory")
      : emptyTitle;
  const localizedEmptyBody =
    emptyBody ===
    "Tell UrbanEdge what you are looking for and our team can assist with suitable opportunities."
      ? t("common.emptyInventoryHelp")
      : emptyBody;
  if (result.status === "unavailable") {
    return (
      <div className="empty-state" role="status">
        <p className="eyebrow">{t("common.temporarilyUnavailable")}</p>
        <h3>{t("common.inventoryUnavailable")}</h3>
        <p>{t("common.tryAgain")}</p>
        <div className="empty-state-actions">
          <Link className="button button-primary" href="/properties">
            {t("common.retry")}
          </Link>
          <Link className="button button-outline" href="/contact">
            {t("nav.contact")}
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
        <p className="eyebrow">{t("common.curatedInventory")}</p>
        <h3>{localizedEmptyTitle}</h3>
        <p>{localizedEmptyBody}</p>
        <div className="empty-state-actions">
          <Link className="button button-primary" href="/requirements">
            {t("common.shareYourRequirement")}
          </Link>
          {whatsapp ? (
            <a className="button button-whatsapp" href={whatsapp} target="_blank" rel="noreferrer">
              <WhatsAppIcon className="size-4" /> {t("common.whatsappUrbanEdge")}
            </a>
          ) : null}
          {telephone ? (
            <a className="button button-outline" href={telephone}>
              <PhoneIcon className="size-4" /> {t("common.callUrbanEdge")}
            </a>
          ) : null}
        </div>
      </div>
    );
  }
  return (
    <div className="property-grid">
      {result.properties.map((property) => (
        <PropertyCard key={property.id} property={property} locale={locale} />
      ))}
    </div>
  );
}
