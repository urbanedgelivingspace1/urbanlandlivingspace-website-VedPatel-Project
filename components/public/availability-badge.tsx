import type { AvailabilityStatus } from "@/types/database";
import { availabilityLabels, isClosedPublicAvailability } from "@/lib/formatting/property-values";
import type { Locale } from "@/lib/i18n/config";
import { translate, type TranslationKey } from "@/lib/i18n/dictionaries";

const availabilityTranslationKeys = {
  AVAILABLE: "common.available",
  UNDER_NEGOTIATION: "common.underNegotiation",
  SOLD: "common.sold",
  RENTED: "common.rented",
  LEASED: "common.leased",
  OFF_MARKET: "common.temporarilyUnavailable",
} as const satisfies Record<AvailabilityStatus, TranslationKey>;

export function AvailabilityBadge({
  status,
  locale = "en",
}: Readonly<{ status: AvailabilityStatus; locale?: Locale }>) {
  return (
    <span
      className={`availability-badge ${isClosedPublicAvailability(status) ? "is-closed" : status === "UNDER_NEGOTIATION" ? "is-negotiating" : "is-available"}`}
    >
      <span aria-hidden="true" />
      {locale === "en"
        ? availabilityLabels[status]
        : translate(locale, availabilityTranslationKeys[status])}
    </span>
  );
}
