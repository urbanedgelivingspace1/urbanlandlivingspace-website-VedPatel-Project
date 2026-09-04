import type { PublicInventoryResult } from "@/server/queries/public-page-data";

import { PropertyCard } from "./property-card";

export function PropertyCollection({
  result,
  emptyTitle = "No published land is listed here yet.",
  emptyBody = "UrbanEdge is curating suitable opportunities. Tell us what you are looking for and our team can help when the requirement service opens.",
}: Readonly<{
  result: PublicInventoryResult;
  emptyTitle?: string;
  emptyBody?: string;
}>) {
  if (result.status === "unavailable") {
    return (
      <div className="empty-state" role="status">
        <p className="eyebrow">Temporarily unavailable</p>
        <h3>We could not load the latest land opportunities right now.</h3>
        <p>Please try again shortly. The rest of this page remains available.</p>
      </div>
    );
  }
  if (result.properties.length === 0) {
    return (
      <div className="empty-state">
        <p className="eyebrow">Curated inventory</p>
        <h3>{emptyTitle}</h3>
        <p>{emptyBody}</p>
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
