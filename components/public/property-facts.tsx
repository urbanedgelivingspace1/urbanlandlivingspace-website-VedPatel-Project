import type {
  PublicCategoryDetailsDto,
  PublicPlanningDetailsDto,
  PublicPropertyDetailDto,
} from "@/features/properties/domain/contracts";
import {
  formatPublicArea,
  formatPublicPrice,
  humanizePropertyValue,
} from "@/lib/formatting/property-values";

type Fact = readonly [label: string, value: string | number | boolean | null | undefined];

function displayValue(value: Fact[1]): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return typeof value === "number"
    ? new Intl.NumberFormat("en-IN").format(value)
    : humanizePropertyValue(value);
}

function FactGrid({ facts }: Readonly<{ facts: readonly Fact[] }>) {
  const visible = facts.flatMap(([label, value]) => {
    const display = displayValue(value);
    return display ? [{ label, display }] : [];
  });
  if (visible.length === 0)
    return (
      <p className="section-copy">Ask UrbanEdge for the currently available property details.</p>
    );
  return (
    <dl className="fact-grid">
      {visible.map((fact) => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.display}</dd>
        </div>
      ))}
    </dl>
  );
}

function categoryFacts(details: PublicCategoryDetailsDto): readonly Fact[] {
  if (details.category === "AGRICULTURAL") {
    return [
      ["Tenure context", details.tenureType],
      ["Agricultural use", details.agriculturalUseStatus],
      ["Irrigation", details.irrigationStatus],
      ["Primary water source", details.primaryIrrigationSource],
      ["Borewells", details.borewellCount],
      ["Wells", details.wellCount],
      ["Canal access", details.canalAccessStatus],
      ["Electricity", details.electricityStatus],
      ["Fencing", details.fencingStatus],
      ["Topography", details.topography],
      ["Land shape", details.landShape],
      ["Structure present", details.structurePresent],
      ["Road touch observed", details.roadTouch],
      ["Road width", details.roadWidthMetres === null ? null : `${details.roadWidthMetres} m`],
      ["Current cultivation", details.currentCultivationStatus],
    ];
  }
  if (details.category === "NA") {
    return [
      ["Recorded NA status", details.status],
      ["Recorded purpose", details.purpose],
      ["Order reference", details.orderReference],
      ["Order date", details.orderDate],
      ["Development permission", details.developmentPermissionStatus],
      ["Layout approval", details.layoutApprovalStatus],
      ["Road width", details.roadWidthMetres === null ? null : `${details.roadWidthMetres} m`],
      ["Frontage", details.frontageMetres === null ? null : `${details.frontageMetres} m`],
      ["Corner plot", details.cornerPlot],
      ["Water", details.waterStatus],
      ["Electricity", details.electricityStatus],
      ["Drainage", details.drainageStatus],
    ];
  }
  return [
    ["Industrial context", details.subtype],
    ["Estate", details.gidcEstateName],
    ["Authority", details.authorityName],
    ["Tenure", details.tenure],
    ["GIDC plot reference", details.gidcPlotNumber],
    ["GIDC shed reference", details.gidcShedNumber],
    ["Allotment status", details.allotmentStatus],
    ["Possession status", details.possessionStatus],
    ["Transfer status", details.transferStatus],
    ["Permitted use", details.permittedUse],
    ["Existing shed", details.existingShedPresent],
    [
      "Shed area",
      details.shedArea ? `${details.shedArea.value} ${details.shedArea.unitCode || ""}` : null,
    ],
    [
      "Open area",
      details.openArea ? `${details.openArea.value} ${details.openArea.unitCode || ""}` : null,
    ],
    ["Road width", details.roadWidthMetres === null ? null : `${details.roadWidthMetres} m`],
    ["Truck access", details.truckLoadingAccess],
    ["Power", details.powerStatus],
    [
      "Sanctioned load",
      details.sanctionedLoadKw === null ? null : `${details.sanctionedLoadKw} kW`,
    ],
    ["Transformer", details.transformerStatus],
    ["Water", details.waterStatus],
    ["Drainage", details.drainageStatus],
    ["CETP", details.cetpStatus],
    ["ETP", details.etpStatus],
    ["Gas", details.gasStatus],
    ["Connectivity", details.connectivitySummary],
  ];
}

function planningFacts(planning: PublicPlanningDetailsDto): readonly Fact[] {
  return [
    ["Planning authority", planning.authorityName],
    ["Development plan zone", planning.zoneName],
    ["Use classification", planning.useClassification],
    ["TP scheme", planning.tpSchemeNumber],
    [
      "TP plot",
      planning.tpPlotNumber ? `${planning.tpPlotType || ""} ${planning.tpPlotNumber}`.trim() : null,
    ],
  ];
}

export function PropertyFacts({ property }: Readonly<{ property: PublicPropertyDetailDto }>) {
  return (
    <>
      <section className="detail-section" aria-labelledby="land-characteristics">
        <p className="eyebrow">Land characteristics</p>
        <h2 id="land-characteristics">Information that helps you assess the land</h2>
        <FactGrid facts={categoryFacts(property.categoryDetails)} />
        {property.categoryDetails.category === "AGRICULTURAL" &&
        property.categoryDetails.boundarySummary ? (
          <p className="detail-note">
            <strong>Boundary context:</strong> {property.categoryDetails.boundarySummary}
          </p>
        ) : null}
        {property.categoryDetails.category === "NA" ? (
          <p className="detail-note">
            NA/status information reflects the available approved property evidence. It is not a
            guarantee of development permission or unrestricted use.
          </p>
        ) : null}
        {property.categoryDetails.category === "INDUSTRIAL" ? (
          <p className="detail-note">
            Industrial estate or GIDC context is shown only where recorded for this property;
            private industrial land is not presented as authority-allotted land.
          </p>
        ) : null}
      </section>

      <section className="detail-section" aria-labelledby="planning-context">
        <p className="eyebrow">Planning context</p>
        <h2 id="planning-context">Available planning information</h2>
        <FactGrid facts={planningFacts(property.planning)} />
        {property.planning.publicNotes ? (
          <p className="detail-note">{property.planning.publicNotes}</p>
        ) : null}
      </section>

      {property.parcelIdentifiers.length > 0 ? (
        <section className="detail-section" aria-labelledby="parcel-references">
          <p className="eyebrow">Parcel references</p>
          <h2 id="parcel-references">Available parcel references</h2>
          <dl className="fact-grid">
            {property.parcelIdentifiers.map((identifier, index) => (
              <div key={`${identifier.type}-${identifier.value}-${index}`}>
                <dt>{humanizePropertyValue(identifier.type)}</dt>
                <dd>{identifier.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </>
  );
}

export function CoreFactStrip({ property }: Readonly<{ property: PublicPropertyDetailDto }>) {
  return (
    <dl className="core-fact-strip">
      <div>
        <dt>Area</dt>
        <dd>{formatPublicArea(property.area)}</dd>
      </div>
      <div>
        <dt>Price</dt>
        <dd>{property.price ? formatPublicPrice(property.price) : "Price on request"}</dd>
      </div>
      <div>
        <dt>Transaction</dt>
        <dd>{humanizePropertyValue(property.transactionType)}</dd>
      </div>
      <div>
        <dt>Land type</dt>
        <dd>{property.category === "NA" ? "NA Land" : humanizePropertyValue(property.category)}</dd>
      </div>
    </dl>
  );
}
