"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AdminPropertyReferenceData } from "@/features/admin/contracts";
import {
  initialPropertyFormState,
  type PropertyFormState,
} from "@/features/properties/domain/property-form-state";

type FormAction = (state: PropertyFormState, formData: FormData) => Promise<PropertyFormState>;

type Props = Readonly<{
  action: FormAction;
  references: AdminPropertyReferenceData;
  initialValues?: Readonly<Record<string, string | number | boolean | null | undefined>>;
  submitLabel: string;
}>;

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm disabled:bg-slate-100";
const labelClass = "text-sm font-semibold text-slate-800";

export function PropertyDraftForm({ action, references, initialValues = {}, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, initialPropertyFormState);
  const value = (name: string) => state.values[name] ?? initialValues[name] ?? "";
  const checked = (name: string) => state.values[name] === "on" || initialValues[name] === true;
  const fieldError = (name: string) => state.errors[name]?.join(" ");

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
    <form action={formAction} className="space-y-6" noValidate>
      {state.message ? (
        <p
          role="status"
          className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
        >
          {state.message}
        </p>
      ) : null}

      <FormSection
        title="Classification and copy"
        description="Draft copy may remain incomplete. Category and primary transaction are structural."
      >
        <label className={labelClass}>
          Land category
          <select
            className={inputClass}
            name="landCategory"
            defaultValue={String(value("landCategory") || "AGRICULTURAL")}
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
        {input("listingTitle", "Listing title (optional for draft)")}
        {input("publicSlug", "Public slug (optional; generated from title when blank)")}
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
        title="Geography and area"
        description="These database-minimum fields identify a useful draft without claiming publication readiness."
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
        {input("publicAddress", "Public-safe address")}
        {input("landmarkText", "Public landmark")}
        {input("displayAreaValue", "Display area", { type: "number", step: "0.0001" })}
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
        title="Commercial offer"
        description="Price on request is a structured offer, not a fabricated numeric price."
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
        title="Location privacy"
        description="Private coordinates stay in the protected admin record. Public coordinates are stored separately."
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
        {input("publicLatitude", "Public-safe latitude", { type: "number", step: "0.000001" })}
        {input("publicLongitude", "Public-safe longitude", { type: "number", step: "0.000001" })}
        {input("publicAccuracyMetres", "Public accuracy (metres)", {
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
        title="Parcel and source identifier"
        description="The immutable Property ID remains separate from government/source identifiers."
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
        title="Planning context"
        description="Planning context is independent of the geographic hierarchy."
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

      <FormSection
        title="Agricultural fields"
        description="Used only when the selected category is Agricultural."
      >
        {input("tenureType", "Tenure type")}
        {input("irrigationStatus", "Irrigation status")}
        {input("currentCultivationStatus", "Current cultivation status")}
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="roadTouch" defaultChecked={checked("roadTouch")} /> Road
          touch observed
        </label>
      </FormSection>
      <FormSection
        title="NA fields"
        description="Used only when the selected category is NA. Status is required by the typed schema."
      >
        {input("naStatus", "NA status")}
        {input("naPurpose", "NA purpose")}
        {input("developmentPermissionStatus", "Development permission status")}
        {input("frontageMetres", "Frontage (metres)", { type: "number", step: "0.01" })}
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="cornerPlot" defaultChecked={checked("cornerPlot")} /> Corner
          plot
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
      <FormSection
        title="Industrial fields"
        description="Used only when the selected category is Industrial."
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
        title="Party relationship"
        description="Links an existing private party record by ID; no party PII enters public property DTOs."
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

      <FormSection title="Source link" description="Internal provenance for this property record.">
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

      <div className="sticky bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white/95 p-4 shadow-xl backdrop-blur">
        <p className="text-sm text-slate-600">
          Saving keeps publication in Draft. Publishing is blocked until M9.
        </p>
        <div className="flex gap-3">
          <Link className="rounded-lg px-4 py-2 text-sm font-semibold" href="/admin/properties">
            Cancel
          </Link>
          <button
            className="rounded-lg bg-[var(--brand-navy)] px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending ? "Saving…" : submitLabel}
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
}: Readonly<{ title: string; description: string; children: React.ReactNode }>) {
  return (
    <fieldset className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
      <legend className="px-2 font-display text-xl font-semibold">{title}</legend>
      <p className="text-sm text-slate-600 md:col-span-2">{description}</p>
      {children}
    </fieldset>
  );
}
