"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";

import { AdminTopNotification } from "@/components/admin/admin-top-notification";
import { DeleteDraftButton } from "@/components/admin/delete-draft-button";
import { usePropertyEditGuard } from "@/components/admin/property-edit-guard";
import type { AdminPropertyReferenceData } from "@/features/admin/contracts";
import {
  initialPropertyFormState,
  type PropertyFormState,
} from "@/features/properties/domain/property-form-state";
import {
  PropertyBoundaryMapGuideDialog,
  PropertyBoundaryMapQuickGuide,
} from "@/components/admin/property-boundary-map-guide";
import { parseGoogleMapsEmbedInput } from "@/lib/validation/google-maps-embed";

type FormAction = (state: PropertyFormState, formData: FormData) => Promise<PropertyFormState>;

type Props = Readonly<{
  action: FormAction;
  references: AdminPropertyReferenceData;
  initialValues?: Readonly<Record<string, string | number | boolean | null | undefined>>;
  submitLabel: string;
  propertyId?: string;
  isPublished?: boolean;
  deleteAction?: (data: FormData) => Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
}>;

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm disabled:bg-slate-100";
const labelClass = "text-sm font-semibold text-slate-800";

function formSnapshot(form: HTMLFormElement) {
  return JSON.stringify(
    [...new FormData(form).entries()]
      .filter(([name]) => name !== "submitIntent")
      .map(([name, value]) => [name, typeof value === "string" ? value : value.name])
      .sort(([leftName, leftValue], [rightName, rightValue]) =>
        `${leftName}:${leftValue}`.localeCompare(`${rightName}:${rightValue}`),
      ),
  );
}

export function PropertyDraftForm({
  action,
  references,
  initialValues = {},
  submitLabel,
  propertyId,
  isPublished = false,
  deleteAction,
  onDirtyChange,
}: Props) {
  const [state, formAction, pending] = useActionState(action, initialPropertyFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const submissionStarted = useRef(false);
  const initialFormSnapshot = useRef<string | null>(null);
  const editGuard = usePropertyEditGuard();
  const [isDirty, setIsDirty] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    String(initialValues.landCategory ?? "AGRICULTURAL"),
  );
  const [mapInput, setMapInput] = useState(String(initialValues.googleMapsEmbedUrl ?? ""));
  const [isMapGuideOpen, setIsMapGuideOpen] = useState(false);

  const value = (name: string) => state.values[name] ?? initialValues[name] ?? "";
  const checked = (name: string) => state.values[name] === "on" || initialValues[name] === true;
  const fieldError = (name: string) => state.errors[name]?.join(" ");

  useEffect(() => {
    if (!pending) submissionStarted.current = false;
  }, [pending, state]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    initialFormSnapshot.current = formSnapshot(form);
  }, []);

  useEffect(() => {
    editGuard?.setDirty(isDirty);
    onDirtyChange?.(isDirty);
  }, [editGuard, isDirty, onDirtyChange]);

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty || submissionStarted.current) return;
      event.preventDefault();
      event.returnValue = true;
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty]);

  const updateDirtyState = useCallback(() => {
    window.queueMicrotask(() => {
      const form = formRef.current;
      const initial = initialFormSnapshot.current;
      if (!form || initial === null) return;
      setIsDirty(formSnapshot(form) !== initial);
    });
  }, []);

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
      onInput={updateDirtyState}
      onChange={updateDirtyState}
      onSubmit={(event) => {
        if (submissionStarted.current) {
          event.preventDefault();
          return;
        }
        submissionStarted.current = true;
      }}
    >
      {state.message ? (
        <AdminTopNotification
          key={`${state.ok}-${state.message}`}
          type={state.ok ? "success" : "error"}
          title={state.ok ? "Changes saved successfully." : "We couldn't save your changes."}
          message={state.message}
          autoDismissMs={state.ok ? 6500 : 9000}
        />
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
            aria-label="Primary transaction"
            defaultValue={String(value("primaryTransactionType") || "SELL")}
          >
            <option value="SELL">Sell</option>
            <option value="BUY">Buy</option>
            <option value="RENT">Rent</option>
            <option value="LEASE">Lease</option>
          </select>
          <span className="mt-1 block text-xs font-normal text-slate-500">
            Sell lists the property for buyers and is stored as Buy in listing search.
          </span>
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
        <div className="md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="googleMapsEmbedUrl" className={labelClass}>
              Google Maps Embed
            </label>
            <button
              type="button"
              onClick={() => setIsMapGuideOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <svg className="h-3.5 w-3.5 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              Need help? How to draw boundary map
            </button>
          </div>
          <textarea
            id="googleMapsEmbedUrl"
            className={inputClass}
            name="googleMapsEmbedUrl"
            rows={3}
            placeholder="Paste Google My Maps link (e.g. https://www.google.com/maps/d/viewer?mid=...) or embed iframe"
            value={mapInput}
            aria-invalid={Boolean(fieldError("googleMapsEmbedUrl"))}
            onChange={(event) => setMapInput(event.target.value)}
          />
          <div className="mt-1 flex flex-wrap items-center justify-between gap-1 text-xs text-slate-500">
            <span>Supports Google My Maps share links, embed URLs, and copied &lt;iframe&gt; code.</span>
            <button
              type="button"
              onClick={() => setIsMapGuideOpen(true)}
              className="font-medium text-emerald-700 underline hover:text-emerald-900"
            >
              View step-by-step guide
            </button>
          </div>
          {fieldError("googleMapsEmbedUrl") ? (
            <span className="mt-1 block text-xs text-red-700">
              {fieldError("googleMapsEmbedUrl")}
            </span>
          ) : null}
        </div>
        <PropertyBoundaryMapQuickGuide onOpenDialog={() => setIsMapGuideOpen(true)} />
        <PropertyBoundaryMapGuideDialog
          open={isMapGuideOpen}
          onClose={() => setIsMapGuideOpen(false)}
        />
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

      <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:min-w-32">
          {deleteAction && propertyId ? (
            <DeleteDraftButton
              propertyId={propertyId}
              expectedUpdatedAt={String(initialValues?.expectedUpdatedAt ?? "") || undefined}
              propertyTitle={String(initialValues?.listingTitle ?? "") || undefined}
              isPublished={isPublished}
              action={deleteAction}
              variant="danger-outline"
              buttonText={isPublished ? "Delete property" : "Delete draft"}
            />
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:items-end lg:flex-row lg:items-center">
          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
              isPublished ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"
            }`}
          >
            <span
              aria-hidden="true"
              className={isPublished ? "text-emerald-600" : "text-slate-500"}
            >
              ●
            </span>
            {isPublished ? "Live on website" : "Draft listing"}
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
              href="/admin/properties"
            >
              Cancel
            </Link>
            <button
              className="button button-secondary disabled:opacity-60"
              disabled={pending}
              type="submit"
              name="submitIntent"
              value="save-next"
            >
              {pending ? "Saving…" : "Save & Next →"}
            </button>
            <button
              className="button button-primary disabled:opacity-60"
              disabled={pending}
              name="submitIntent"
              type="submit"
              value="save-draft"
            >
              {pending ? "Saving…" : submitLabel}
            </button>
          </div>
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
