import type { AvailabilityStatus } from "@/types/database";
import { availabilityLabels, isClosedPublicAvailability } from "@/lib/formatting/property-values";

export function AvailabilityBadge({ status }: Readonly<{ status: AvailabilityStatus }>) {
  return (
    <span
      className={`availability-badge ${isClosedPublicAvailability(status) ? "is-closed" : status === "UNDER_NEGOTIATION" ? "is-negotiating" : "is-available"}`}
    >
      <span aria-hidden="true" />
      {availabilityLabels[status]}
    </span>
  );
}
