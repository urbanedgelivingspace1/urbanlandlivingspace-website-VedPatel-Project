"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { DeleteDraftButton } from "@/components/admin/delete-draft-button";
import type { AdminPropertyReferenceData } from "@/features/admin/contracts";
import {
  initialPropertyFormState,
  type PropertyFormState,
} from "@/features/properties/domain/property-form-state";
import { parseGoogleMapsEmbedInput } from "@/lib/validation/google-maps-embed";

type FormAction = (state: PropertyFormState, formData: FormData) => Promise<PropertyFormState>;

type Props = Readonly<{
  action: FormAction;
  references: AdminPropertyReferenceData;
  initialValues?: Readonly<Record<string, string | number | boolean | null | undefined>>;
  submitLabel: string;
  allowTestPresets?: boolean;
  propertyId?: string;
  deleteAction?: (data: FormData) => Promise<void>;
}>;

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm disabled:bg-slate-100";
const labelClass = "text-sm font-semibold text-slate-800";

function buildSampleData(
  category: "AGRICULTURAL" | "NA" | "INDUSTRIAL",
  references: AdminPropertyReferenceData,
): Record<string, string | boolean> {
  const districtId =
    (category === "NA"
      ? references.districts.find((d) => d.name.toLowerCase().includes("gandhinagar"))?.id
      : references.districts.find((d) => d.name.toLowerCase().includes("ahmedabad"))?.id) ??
    references.districts[0]?.id ??
    "00000000-0000-4000-8000-000000000003";

  const acreUnitId =
    references.areaUnits.find((u) => u.code === "acre")?.id ??
    references.areaUnits[0]?.id ??
    "10000000-0000-4000-8000-000000000006";

  const sqYdUnitId =
    references.areaUnits.find((u) => u.code === "sq_yd")?.id ??
    references.areaUnits[0]?.id ??
    "10000000-0000-4000-8000-000000000003";

  const sqMUnitId =
    references.areaUnits.find((u) => u.code === "sq_m")?.id ??
    references.areaUnits[0]?.id ??
    "10000000-0000-4000-8000-000000000001";

  const partyId = references.parties[0]?.id ?? "";
  const testSuffix = Math.floor(100 + Math.random() * 900);

  if (category === "NA") {
    return {
      landCategory: "NA",
      primaryTransactionType: "BUY",
      listingTitle: `Prime 1200 Sq Yd NA Commercial Plot in Gandhinagar #${testSuffix}`,
      publicSlug: `prime-1200-sq-yd-na-commercial-plot-gandhinagar-${testSuffix}`,
      shortDescription:
        "NA commercial plot with recorded road frontage and available planning details.",
      description:
        "High-visibility non-agricultural plot with recorded commercial-use context, dual-road corner access, and available utility information. Confirm permissions for the intended project independently.",
      districtId,
      publicAddress: "Koba Circle, Gandhinagar Highway, Gandhinagar, Gujarat",
      googleMapsEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d72.63!3d23.16",
      landmarkText: "Opposite Tech City Gate 1",
      displayAreaValue: "1200",
      displayAreaUnitId: sqYdUnitId,
      priceMode: "EXACT_TOTAL",
      priceAmount: "45000000",
      priceMinimum: "",
      priceMaximum: "",
      pricePerUnit: "",
      priceUnitId: "",
      negotiable: false,
      commercialTerms:
        "Standard commercial settlement. Possession handed over upon registered sale deed.",
      locationVisibility: "APPROXIMATE",
      privateLatitude: "23.165412",
      privateLongitude: "72.634125",
      publicLatitude: "23.165000",
      publicLongitude: "72.634000",
      publicAccuracyMetres: "150",
      locationNotes: "Corner plot marked by perimeter fencing and demarcated survey pegs.",
      parcelLabel: "Commercial Plot CP-14",
      parcelAreaValue: "1200",
      parcelAreaUnitId: sqYdUnitId,
      identifierType: "CITY_SURVEY_NUMBER",
      identifierValue: "CS-8891",
      identifierVisibility: "ADMIN_ONLY",
      parcelNotesInternal: "NA order no. NA/2024/7711 verified with collectorate records.",
      reservationStatus: "Commercial zone under TP Scheme 14",
      roadReservationStatus: "24m TP road fully cleared",
      planningPublicNotes: "Zoned Commercial High-Density (FSI 2.7).",
      planningInternalNotes: "Fire and drainage documents received for internal review.",
      tenureType: "",
      irrigationStatus: "",
      currentCultivationStatus: "",
      roadTouch: false,
      naStatus: "ORDER_ISSUED",
      naPurpose: "Commercial / Office Complex",
      developmentPermissionStatus: "OWNER_REPORTED_LAYOUT_PERMISSION",
      frontageMetres: "32.5",
      cornerPlot: true,
      restrictionSummary: "Height permission up to 45m subject to standard aviation buffer.",
      industrialSubtype: "",
      industrialAuthorityName: "",
      industrialTenure: "",
      gidcPlotNumber: "",
      powerStatus: "",
      existingShedPresent: false,
      connectivitySummary: "",
      categoryRoadWidthMetres: "24",
      partyId,
      partyRole: "AUTHORIZED_REPRESENTATIVE",
      ownershipSharePercent: partyId ? "100" : "",
      partyNotesInternal: partyId ? "Power of attorney registered in Gandhinagar office." : "",
      removePartyLink: false,
      sourceType: "DIRECT_OWNER",
      sourceName: "Sanjay Shah",
      sourceReference: "Institutional broker network referral",
      sourceNotesInternal: "Owner supplied a legal-review document; no title conclusion recorded.",
    };
  }

  if (category === "INDUSTRIAL") {
    return {
      landCategory: "INDUSTRIAL",
      primaryTransactionType: "LEASE",
      listingTitle: `5000 Sq Metre Industrial GIDC Plot with Power Feeder #${testSuffix}`,
      publicSlug: `5000-sq-m-industrial-gidc-plot-sanand-ii-${testSuffix}`,
      shortDescription:
        "GIDC industrial allotment with 300 kVA power sanction and heavy vehicle access.",
      description:
        "Ready-to-occupy industrial land parcel situated in GIDC Sanand II. Complete with industrial tenure approval, boundary wall, high-tension power connection, and proximity to national freight corridor.",
      districtId,
      publicAddress: "Engineering Zone, GIDC Phase II, Sanand, Ahmedabad, Gujarat",
      googleMapsEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d72.37!3d22.99",
      landmarkText: "Near GIDC Water Treatment Facility",
      displayAreaValue: "5000",
      displayAreaUnitId: sqMUnitId,
      priceMode: "EXACT_TOTAL",
      priceAmount: "35000000",
      priceMinimum: "",
      priceMaximum: "",
      pricePerUnit: "",
      priceUnitId: "",
      negotiable: true,
      commercialTerms: "Transfer fee payable by transferee as per GIDC circular guidelines.",
      locationVisibility: "APPROXIMATE",
      privateLatitude: "22.991240",
      privateLongitude: "72.374520",
      publicLatitude: "22.991000",
      publicLongitude: "72.375000",
      publicAccuracyMetres: "200",
      locationNotes: "Industrial plot boundary stones inspected and documented.",
      parcelLabel: "GIDC Industrial Plot E-42",
      parcelAreaValue: "5000",
      parcelAreaUnitId: sqMUnitId,
      identifierType: "GIDC_PLOT_NUMBER",
      identifierValue: "Plot E-42/Sanand-II",
      identifierVisibility: "ADMIN_ONLY",
      parcelNotesInternal: "Allotment letter reference GIDC/RM/SAN/2023/108.",
      reservationStatus: "GIDC Industrial Zone - Engineering & Auto Ancillary",
      roadReservationStatus: "30m arterial industrial road",
      planningPublicNotes: "Red / Orange category clearance permissible as per GPCB norms.",
      planningInternalNotes: "GPCB consent to establish valid till 2028.",
      tenureType: "",
      irrigationStatus: "",
      currentCultivationStatus: "",
      roadTouch: false,
      naStatus: "",
      naPurpose: "",
      developmentPermissionStatus: "",
      frontageMetres: "",
      cornerPlot: false,
      restrictionSummary: "",
      industrialSubtype: "ENGINEERING_PLOT",
      industrialAuthorityName: "Gujarat Industrial Development Corporation (GIDC)",
      industrialTenure: "99_YEAR_LEASE",
      gidcPlotNumber: "Plot E-42",
      powerStatus: "300 kVA dedicated transformer installed",
      existingShedPresent: false,
      connectivitySummary: "2 km from State Highway with direct container trailer turning radius.",
      categoryRoadWidthMetres: "30",
      partyId,
      partyRole: "OWNER",
      ownershipSharePercent: partyId ? "100" : "",
      partyNotesInternal: partyId ? "Original lessee company representative." : "",
      removePartyLink: false,
      sourceType: "GOVERNMENT_ALLOTMENT",
      sourceName: "GIDC Allotment Records",
      sourceReference: "Allotment File SAN-II-E-42",
      sourceNotesInternal: "Possession receipt and water connection active.",
    };
  }

  // Default: AGRICULTURAL
  return {
    landCategory: "AGRICULTURAL",
    primaryTransactionType: "BUY",
    listingTitle: `Sanand 2.5 Acre Farmland Near Bavla Road #${testSuffix}`,
    publicSlug: `sanand-2-5-acre-farmland-bavla-road-${testSuffix}`,
    shortDescription:
      "Fertile agricultural parcel with direct canal access and wide road frontage in Sanand.",
    description:
      "Agricultural parcel offered for farming or long-term land use, with recorded cultivation, water, and road information in Ahmedabad district. Buyers should confirm suitability and permissions for their intended use.",
    districtId,
    publicAddress: "Sanand-Bavla Road, Sanand, Ahmedabad, Gujarat",
    googleMapsEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d72.38!3d22.98",
    landmarkText: "Near GIDC Gate 2",
    displayAreaValue: "2.5",
    displayAreaUnitId: acreUnitId,
    priceMode: "EXACT_TOTAL",
    priceAmount: "12500000",
    priceMinimum: "",
    priceMaximum: "",
    pricePerUnit: "",
    priceUnitId: "",
    negotiable: true,
    commercialTerms: "10% token upon agreement to sell; balance at registered sale deed execution.",
    locationVisibility: "APPROXIMATE",
    privateLatitude: "22.986754",
    privateLongitude: "72.381423",
    publicLatitude: "22.987000",
    publicLongitude: "72.381000",
    publicAccuracyMetres: "250",
    locationNotes:
      "Owner supplied a revenue map and identified visible boundary markers for review.",
    parcelLabel: "Block A - Main Farmland",
    parcelAreaValue: "2.5",
    parcelAreaUnitId: acreUnitId,
    identifierType: "SURVEY_NUMBER",
    identifierValue: "Survey 142/P",
    identifierVisibility: "ADMIN_ONLY",
    parcelNotesInternal: "7/12 record received; no title conclusion recorded.",
    reservationStatus: "OWNER_REPORTED_NO_TP_RESERVATION",
    roadReservationStatus: "18m proposed TP road on west boundary",
    planningPublicNotes: "No green belt or defense buffer zone restrictions.",
    planningInternalNotes: "Cross-checked against AUDA Development Plan 2031.",
    tenureType: "OLD_TENURE",
    irrigationStatus: "CANAL_AND_BOREWELL",
    currentCultivationStatus: "Active seasonal cotton and wheat",
    roadTouch: true,
    naStatus: "",
    naPurpose: "",
    developmentPermissionStatus: "",
    frontageMetres: "",
    cornerPlot: false,
    restrictionSummary: "",
    industrialSubtype: "",
    industrialAuthorityName: "",
    industrialTenure: "",
    gidcPlotNumber: "",
    powerStatus: "",
    existingShedPresent: false,
    connectivitySummary: "",
    categoryRoadWidthMetres: "12",
    partyId,
    partyRole: "OWNER",
    ownershipSharePercent: partyId ? "100" : "",
    partyNotesInternal: partyId ? "Primary titleholder registered in revenue records." : "",
    removePartyLink: false,
    sourceType: "DIRECT_OWNER",
    sourceName: "Rameshbhai Patel",
    sourceReference: "Direct landowner intake audit 2026",
    sourceNotesInternal:
      "Initial documents received and reviewed in person; no legal conclusion recorded.",
  };
}

export function PropertyDraftForm({
  action,
  references,
  initialValues = {},
  submitLabel,
  allowTestPresets = false,
  propertyId,
  deleteAction,
}: Props) {
  const [state, formAction, pending] = useActionState(action, initialPropertyFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const submissionStarted = useRef(false);
  const [sampleNotice, setSampleNotice] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(
    String(initialValues.landCategory ?? "AGRICULTURAL"),
  );
  const [mapInput, setMapInput] = useState(String(initialValues.googleMapsEmbedUrl ?? ""));

  const value = (name: string) => state.values[name] ?? initialValues[name] ?? "";
  const checked = (name: string) => state.values[name] === "on" || initialValues[name] === true;
  const fieldError = (name: string) => state.errors[name]?.join(" ");

  useEffect(() => {
    if (!pending) submissionStarted.current = false;
  }, [pending, state]);

  const applyValuesToForm = (values: Record<string, string | boolean>) => {
    const form = formRef.current;
    if (!form) return;

    for (const [key, val] of Object.entries(values)) {
      const item = form.elements.namedItem(key);
      if (!item) continue;

      if (item instanceof HTMLInputElement && item.type === "checkbox") {
        item.checked = Boolean(val);
        item.dispatchEvent(new Event("change", { bubbles: true }));
      } else if (
        item instanceof HTMLInputElement ||
        item instanceof HTMLSelectElement ||
        item instanceof HTMLTextAreaElement
      ) {
        item.value = String(val);
        item.dispatchEvent(new Event("input", { bubbles: true }));
        item.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  };

  const handleFillSample = (category: "AGRICULTURAL" | "NA" | "INDUSTRIAL" = "AGRICULTURAL") => {
    const data = buildSampleData(category, references);
    flushSync(() => {
      setSelectedCategory(category);
      setMapInput(String(data.googleMapsEmbedUrl ?? ""));
    });
    applyValuesToForm(data);
    const categoryLabels = {
      AGRICULTURAL: "Agricultural Farmland",
      NA: "NA Commercial",
      INDUSTRIAL: "Industrial Plot",
    };
    setSampleNotice(
      `✓ Form prefilled with ${categoryLabels[category]} example data! All fields populated. Click "${submitLabel}" below to save.`,
    );
  };

  const handleClearForm = () => {
    const form = formRef.current;
    if (!form) return;
    form.reset();
    flushSync(() => {
      setSelectedCategory(String(initialValues.landCategory ?? "AGRICULTURAL"));
      setMapInput(String(initialValues.googleMapsEmbedUrl ?? ""));
    });
    setSampleNotice("Form cleared.");
  };

  const input = (
    name: string,
    label: string,
    options?: Readonly<{ type?: string; step?: string; placeholder?: string }>,
  ) => (
    <label className={labelClass}>
      {label}
      <input
        className={inputClass}
        name={name}
        type={options?.type ?? "text"}
        step={options?.step}
        placeholder={options?.placeholder}
        defaultValue={String(value(name))}
        aria-invalid={Boolean(fieldError(name))}
      />
      {fieldError(name) ? (
        <span className="mt-1 block text-xs text-red-700">{fieldError(name)}</span>
      ) : null}
    </label>
  );

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-6"
      noValidate
      onSubmit={(event) => {
        if (submissionStarted.current) {
          event.preventDefault();
          return;
        }
        submissionStarted.current = true;
      }}
    >
      {/* Testing helper toolbar (rendered strictly in non-production environments) */}
      {allowTestPresets ? (
        <div
          data-testid="test-fill-helper"
          className="rounded-xl border border-amber-300 bg-amber-50/90 p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500 text-white font-bold text-sm shadow-sm">
                ⚡
              </span>
              <div>
                <p className="text-sm font-bold text-amber-950">Test Form Prefill</p>
                <p className="text-xs text-amber-800">
                  Populate all fields with a realistic, schema-valid Gujarat property example in one
                  click.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="btn-fill-sample-draft"
                data-testid="btn-fill-sample-draft"
                onClick={() => handleFillSample("AGRICULTURAL")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-gold-deep,#996b00)] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110 active:scale-95 transition"
              >
                <span>⚡ Fill sample draft (Agricultural)</span>
              </button>
              <button
                type="button"
                data-testid="btn-fill-sample-na"
                onClick={() => handleFillSample("NA")}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-400 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100/50 active:scale-95 transition"
              >
                <span>NA sample</span>
              </button>
              <button
                type="button"
                data-testid="btn-fill-sample-industrial"
                onClick={() => handleFillSample("INDUSTRIAL")}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-400 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100/50 active:scale-95 transition"
              >
                <span>Industrial sample</span>
              </button>
              <button
                type="button"
                onClick={handleClearForm}
                className="rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-amber-200/50 transition"
              >
                Reset
              </button>
            </div>
          </div>
          {sampleNotice ? (
            <div
              role="status"
              className="mt-3 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-100/70 px-3 py-2 text-xs font-medium text-amber-900"
            >
              <span>{sampleNotice}</span>
              <button
                type="button"
                onClick={() => setSampleNotice(null)}
                className="text-amber-700 hover:text-amber-950 font-bold ml-2"
                aria-label="Dismiss notice"
              >
                ✕
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {state.message ? (
        <p
          role="status"
          className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
        >
          {state.message}
        </p>
      ) : null}

      <FormSection
        title="Basic Details"
        description="Choose the land type and transaction, then add a helpful title if you have one."
      >
        <label className={labelClass}>
          Land category
          <select
            className={inputClass}
            name="landCategory"
            defaultValue={String(value("landCategory") || "AGRICULTURAL")}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="AGRICULTURAL">Agricultural</option>
            <option value="NA">NA</option>
            <option value="INDUSTRIAL">Industrial</option>
          </select>
        </label>
        <label className={labelClass}>
          Primary transaction
          <select
            className={inputClass}
            name="primaryTransactionType"
            defaultValue={String(value("primaryTransactionType") || "BUY")}
          >
            <option value="BUY">Buy</option>
            <option value="RENT">Rent</option>
            <option value="LEASE">Lease</option>
          </select>
        </label>
        {input("listingTitle", "Property title (optional)")}
        {input("publicSlug", "Website address (generated automatically when blank)")}
        <label className={`${labelClass} md:col-span-2`}>
          Short description
          <textarea
            className={inputClass}
            name="shortDescription"
            rows={2}
            defaultValue={String(value("shortDescription"))}
          />
        </label>
        <label className={`${labelClass} md:col-span-2`}>
          Description
          <textarea
            className={inputClass}
            name="description"
            rows={5}
            defaultValue={String(value("description"))}
          />
        </label>
      </FormSection>

      <FormSection
        title="Location & Land Details"
        description="Record the district, known landmark or address, and total area."
      >
        <label className={labelClass}>
          District
          <select
            className={inputClass}
            name="districtId"
            required
            defaultValue={String(value("districtId"))}
          >
            <option value="">Select district</option>
            {references.districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
          {fieldError("districtId") ? (
            <span className="mt-1 block text-xs text-red-700">{fieldError("districtId")}</span>
          ) : null}
        </label>
        {input("landmarkText", "Nearby landmark")}
        {input("displayAreaValue", "Area", { type: "number", step: "0.0001" })}
        <label className={labelClass}>
          Area unit
          <select
            className={inputClass}
            name="displayAreaUnitId"
            required
            defaultValue={String(value("displayAreaUnitId"))}
          >
            <option value="">Select unit</option>
            {references.areaUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
                {unit.symbol ? ` (${unit.symbol})` : ""}
              </option>
            ))}
          </select>
        </label>
      </FormSection>

      <FormSection
        title="Price"
        description="Choose how the price should be presented and enter only the matching amount fields."
      >
        <label className={labelClass}>
          Price mode
          <select
            className={inputClass}
            name="priceMode"
            defaultValue={String(value("priceMode") || "PRICE_ON_REQUEST")}
          >
            <option value="PRICE_ON_REQUEST">Price on request</option>
            <option value="EXACT_TOTAL">Exact total</option>
            <option value="PRICE_RANGE">Price range</option>
            <option value="PER_UNIT">Per unit</option>
          </select>
        </label>
        {input("priceAmount", "Exact amount (INR)", { type: "number", step: "0.01" })}
        {input("priceMinimum", "Minimum (INR)", { type: "number", step: "0.01" })}
        {input("priceMaximum", "Maximum (INR)", { type: "number", step: "0.01" })}
        {input("pricePerUnit", "Price per unit (INR)", { type: "number", step: "0.0001" })}
        <label className={labelClass}>
          Price basis unit
          <select
            className={inputClass}
            name="priceUnitId"
            defaultValue={String(value("priceUnitId"))}
          >
            <option value="">Select when using per-unit</option>
            {references.areaUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="negotiable" defaultChecked={checked("negotiable")} />{" "}
          Negotiable
        </label>
        <label className={`${labelClass} md:col-span-2`}>
          Commercial terms
          <textarea
            className={inputClass}
            name="commercialTerms"
            rows={2}
            defaultValue={String(value("commercialTerms"))}
          />
        </label>
      </FormSection>

      <FormSection
        title="Property Location"
        description="Tell customers what to call this location, then paste the map from Google Maps."
      >
        <label className={`${labelClass} md:col-span-2`}>
          Location Title
          <input
            className={inputClass}
            name="publicAddress"
            placeholder="Near IIT Gandhinagar, Palaj"
            defaultValue={String(value("publicAddress"))}
            aria-invalid={Boolean(fieldError("publicAddress"))}
          />
          <span className="mt-1 block text-xs font-normal text-slate-600">
            This title will be shown above the map on the public property page.
          </span>
          {fieldError("publicAddress") ? (
            <span className="mt-1 block text-xs text-red-700">{fieldError("publicAddress")}</span>
          ) : null}
        </label>
        <label className={`${labelClass} md:col-span-2`}>
          Google Maps Embed
          <textarea
            className={inputClass}
            name="googleMapsEmbedUrl"
            rows={4}
            placeholder="Paste the Google Maps iframe or https://www.google.com/maps/embed?..."
            value={mapInput}
            aria-invalid={Boolean(fieldError("googleMapsEmbedUrl"))}
            onChange={(event) => setMapInput(event.target.value)}
          />
          {fieldError("googleMapsEmbedUrl") ? (
            <span className="mt-1 block text-xs text-red-700">
              {fieldError("googleMapsEmbedUrl")}
            </span>
          ) : null}
        </label>
        <details className="rounded-lg border border-slate-200 bg-slate-50 md:col-span-2">
          <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-slate-800">
            How do I get this link?
          </summary>
          <div className="space-y-3 border-t border-slate-200 px-4 py-4 text-sm text-slate-700">
            <ol className="list-decimal space-y-1 pl-5">
              <li>Open Google Maps.</li>
              <li>Search for the property or location.</li>
              <li>Click Share.</li>
              <li>Select Embed a map.</li>
              <li>Choose the desired map view.</li>
              <li>Click Copy HTML.</li>
              <li>Paste the copied iframe into the field above.</li>
            </ol>
            <code className="block overflow-x-auto rounded-md bg-slate-900 px-3 py-2 text-xs text-slate-100">
              {'<iframe src="https://www.google.com/maps/embed?pb=...">'}
            </code>
            <p>
              You can paste the complete iframe. UrbanEdge will automatically extract the Google
              Maps link.
            </p>
          </div>
        </details>
        {mapInput.trim()
          ? (() => {
              const result = parseGoogleMapsEmbedInput(mapInput);
              return result.ok ? (
                <div className="md:col-span-2">
                  <p className="text-sm font-bold text-slate-900">Map Preview</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-700">
                    Google Maps location added successfully.
                  </p>
                  <div className="mt-3 h-[280px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-[400px]">
                    <iframe
                      className="h-full w-full border-0"
                      src={result.url}
                      title="Google Maps location preview"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-red-700 md:col-span-2" role="alert">
                  {result.error}
                </p>
              );
            })()
          : null}
      </FormSection>

      <FormSection
        title="Location Coordinates"
        description="Add map coordinates only when available. Private coordinates remain visible only to staff."
        advanced
      >
        <label className={labelClass}>
          Visibility
          <select
            className={inputClass}
            name="locationVisibility"
            defaultValue={String(value("locationVisibility") || "APPROXIMATE")}
          >
            <option value="APPROXIMATE">Approximate</option>
            <option value="HIDDEN">Hidden</option>
            <option value="EXACT">Exact (public approval still required later)</option>
          </select>
        </label>
        {input("privateLatitude", "Private latitude", { type: "number", step: "0.000001" })}
        {input("privateLongitude", "Private longitude", { type: "number", step: "0.000001" })}
        {input("publicLatitude", "Listing latitude", { type: "number", step: "0.000001" })}
        {input("publicLongitude", "Listing longitude", { type: "number", step: "0.000001" })}
        {input("publicAccuracyMetres", "Approximate location radius (metres)", {
          type: "number",
          step: "0.01",
        })}
        <label className={`${labelClass} md:col-span-2`}>
          Private location notes
          <textarea
            className={inputClass}
            name="locationNotes"
            rows={2}
            defaultValue={String(value("locationNotes"))}
          />
        </label>
      </FormSection>

      <FormSection
        title="Survey / Parcel Details"
        description="Add survey, block, city survey, or GIDC identifiers when they are available."
        advanced
      >
        {input("parcelLabel", "Parcel label")}
        {input("parcelAreaValue", "Parcel area", { type: "number", step: "0.0001" })}
        <label className={labelClass}>
          Parcel area unit
          <select
            className={inputClass}
            name="parcelAreaUnitId"
            defaultValue={String(value("parcelAreaUnitId"))}
          >
            <option value="">Select unit</option>
            {references.areaUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Identifier type
          <select
            className={inputClass}
            name="identifierType"
            defaultValue={String(value("identifierType"))}
          >
            <option value="">Select type</option>
            <option value="SURVEY_NUMBER">Survey number</option>
            <option value="BLOCK_NUMBER">Block number</option>
            <option value="CITY_SURVEY_NUMBER">City survey number</option>
            <option value="GIDC_PLOT_NUMBER">GIDC plot number</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        {input("identifierValue", "Identifier value")}
        <label className={labelClass}>
          Identifier visibility
          <select
            className={inputClass}
            name="identifierVisibility"
            defaultValue={String(value("identifierVisibility") || "ADMIN_ONLY")}
          >
            <option value="ADMIN_ONLY">Admin only</option>
            <option value="PRIVATE">Private</option>
            <option value="PUBLIC">Public candidate</option>
          </select>
        </label>
        <label className={`${labelClass} md:col-span-2`}>
          Private parcel notes
          <textarea
            className={inputClass}
            name="parcelNotesInternal"
            rows={2}
            defaultValue={String(value("parcelNotesInternal"))}
          />
        </label>
      </FormSection>

      <FormSection
        title="Planning Information"
        description="Optional planning and reservation information."
        advanced
      >
        {input("reservationStatus", "Reservation status")}
        {input("roadReservationStatus", "Road reservation status")}
        <label className={labelClass}>
          Public planning notes
          <textarea
            className={inputClass}
            name="planningPublicNotes"
            rows={2}
            defaultValue={String(value("planningPublicNotes"))}
          />
        </label>
        <label className={labelClass}>
          Internal planning notes
          <textarea
            className={inputClass}
            name="planningInternalNotes"
            rows={2}
            defaultValue={String(value("planningInternalNotes"))}
          />
        </label>
      </FormSection>

      {selectedCategory === "AGRICULTURAL" ? (
        <FormSection
          title="Agricultural Details"
          description="Details specific to agricultural land."
          advanced
        >
          {input("tenureType", "Tenure type")}
          {input("irrigationStatus", "Irrigation status")}
          {input("currentCultivationStatus", "Current cultivation status")}
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="roadTouch" defaultChecked={checked("roadTouch")} /> Road
            touch observed
          </label>
        </FormSection>
      ) : null}
      {selectedCategory === "NA" ? (
        <FormSection
          title="NA Details"
          description="Details specific to non-agricultural land. Leave unknown information blank."
          advanced
        >
          {input("naStatus", "NA status")}
          {input("naPurpose", "NA purpose")}
          {input("developmentPermissionStatus", "Development permission status")}
          {input("frontageMetres", "Frontage (metres)", { type: "number", step: "0.01" })}
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="cornerPlot" defaultChecked={checked("cornerPlot")} />{" "}
            Corner plot
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            Restriction summary
            <textarea
              className={inputClass}
              name="restrictionSummary"
              rows={2}
              defaultValue={String(value("restrictionSummary"))}
            />
          </label>
        </FormSection>
      ) : null}
      {selectedCategory === "INDUSTRIAL" ? (
        <FormSection
          title="Industrial Details"
          description="Details specific to industrial land."
          advanced
        >
          {input("industrialSubtype", "Industrial subtype")}
          {input("industrialAuthorityName", "Industrial authority")}
          {input("industrialTenure", "Industrial tenure")}
          {input("gidcPlotNumber", "GIDC plot number")}
          {input("powerStatus", "Power status")}
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              name="existingShedPresent"
              defaultChecked={checked("existingShedPresent")}
            />{" "}
            Existing shed present
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            Connectivity summary
            <textarea
              className={inputClass}
              name="connectivitySummary"
              rows={2}
              defaultValue={String(value("connectivitySummary"))}
            />
          </label>
        </FormSection>
      ) : null}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className={labelClass}>
          Category road width (metres)
          <input
            className={inputClass}
            name="categoryRoadWidthMetres"
            type="number"
            step="0.01"
            defaultValue={String(value("categoryRoadWidthMetres"))}
          />
        </label>
      </section>

      <FormSection
        title="Owner Details"
        description="Link an existing owner or representative when this information is known."
        advanced
      >
        <label className={labelClass}>
          Primary party (optional)
          <select className={inputClass} name="partyId" defaultValue={String(value("partyId"))}>
            <option value="">No relationship change</option>
            {references.parties.map((party) => (
              <option key={party.id} value={party.id}>
                {party.displayName} · {party.partyType}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Role
          <select
            className={inputClass}
            name="partyRole"
            defaultValue={String(value("partyRole") || "OWNER")}
          >
            <option value="OWNER">Owner</option>
            <option value="CO_OWNER">Co-owner</option>
            <option value="AUTHORIZED_REPRESENTATIVE">Authorized representative</option>
            <option value="BROKER">Broker</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        {input("ownershipSharePercent", "Ownership share (%)", { type: "number", step: "0.0001" })}
        <label className={labelClass}>
          Internal relationship notes
          <textarea
            className={inputClass}
            name="partyNotesInternal"
            rows={2}
            defaultValue={String(value("partyNotesInternal"))}
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold md:col-span-2">
          <input type="checkbox" name="removePartyLink" /> Archive the current primary relationship
        </label>
      </FormSection>

      <FormSection
        title="Source Details"
        description="Record where this property information came from."
        advanced
      >
        {input("sourceType", "Source type")}
        {input("sourceName", "Source name")}
        {input("sourceReference", "Source reference")}
        <label className={labelClass}>
          Internal source notes
          <textarea
            className={inputClass}
            name="sourceNotesInternal"
            rows={2}
            defaultValue={String(value("sourceNotesInternal"))}
          />
        </label>
      </FormSection>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">
          Saving keeps this property private. Continue when you are ready to add photos and secure
          documents.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {allowTestPresets ? (
            <button
              type="button"
              data-testid="btn-bottom-prefill"
              onClick={() => handleFillSample("AGRICULTURAL")}
              className="rounded-lg border border-amber-400 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-950 hover:bg-amber-100 active:scale-95 transition"
            >
              ⚡ Prefill test data
            </button>
          ) : null}
          {deleteAction && propertyId ? (
            <DeleteDraftButton
              propertyId={propertyId}
              expectedUpdatedAt={String(initialValues?.expectedUpdatedAt ?? "") || undefined}
              propertyTitle={String(initialValues?.listingTitle ?? "") || undefined}
              action={deleteAction}
              variant="danger-outline"
              buttonText="Delete draft"
            />
          ) : null}
          <Link className="rounded-lg px-4 py-2 text-sm font-semibold" href="/admin/properties">
            Cancel
          </Link>
          <button
            className="button button-secondary disabled:opacity-60"
            disabled={pending}
            name="submitIntent"
            type="submit"
            value="save-draft"
          >
            {pending ? "Saving…" : submitLabel}
          </button>
          <button
            className="button button-primary disabled:opacity-60"
            disabled={pending}
            name="submitIntent"
            type="submit"
            value="save-next"
          >
            {pending ? "Saving…" : "Save & Next →"}
          </button>
        </div>
      </div>
    </form>
  );
}

function FormSection({
  title,
  description,
  children,
  advanced = false,
}: Readonly<{
  title: string;
  description: string;
  children: React.ReactNode;
  advanced?: boolean;
}>) {
  const fields = (
    <fieldset
      className={`grid gap-4 bg-white p-5 md:grid-cols-2 ${advanced ? "border-t border-slate-100" : "rounded-xl border border-slate-200 shadow-sm"}`}
    >
      <legend className={advanced ? "sr-only" : "px-2 text-xl font-bold"}>{title}</legend>
      <p className="text-sm text-slate-600 md:col-span-2">{description}</p>
      {children}
    </fieldset>
  );
  if (advanced) {
    return (
      <details className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-5 text-base font-bold text-slate-900">
          {title}
          <span aria-hidden="true" className="text-slate-400">
            +
          </span>
        </summary>
        {fields}
      </details>
    );
  }
  return fields;
}
