export type NearbyConnectivityItem = Readonly<{
  landmark: string;
  distance?: string | null;
  travelTime?: string | null;
}>;

export function NearbyConnectivity({
  summary,
  items = [],
}: Readonly<{
  summary?: string | null;
  items?: readonly NearbyConnectivityItem[];
}>) {
  const visibleItems = items.filter((item) => item.landmark.trim());
  if (!summary?.trim() && visibleItems.length === 0) return null;

  return (
    <section className="detail-section" aria-labelledby="nearby-connectivity-heading">
      <p className="eyebrow">Nearby &amp; connectivity</p>
      <h2 id="nearby-connectivity-heading">Access and surrounding connections</h2>
      {summary?.trim() ? <p className="section-copy">{summary}</p> : null}
      {visibleItems.length > 0 ? (
        <dl className="nearby-grid">
          {visibleItems.map((item) => (
            <div key={`${item.landmark}-${item.distance ?? ""}`}>
              <dt>{item.landmark}</dt>
              <dd>{[item.distance, item.travelTime].filter(Boolean).join(" · ")}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <p className="detail-note">
        Distances and travel times are shown only when approved for this property. Confirm route,
        access and current travel conditions before relying on them.
      </p>
    </section>
  );
}
