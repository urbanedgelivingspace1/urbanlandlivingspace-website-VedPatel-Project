"use client";

import { useActionState } from "react";
import type { LeadFormState } from "@/features/crm/domain/contracts";

type Props = {
  action: (state: LeadFormState, data: FormData) => Promise<LeadFormState>;
  districts: readonly { id: string; name: string }[];
};
const initial: LeadFormState = { ok: false, message: "" };
export function LeadForm({ action, districts }: Props) {
  const [state, formAction, pending] = useActionState(action, initial);
  return (
    <form
      action={formAction}
      className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2"
    >
      {state.message ? (
        <div
          role="status"
          className="sm:col-span-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-950"
        >
          {state.message}
          {state.duplicateCount ? (
            <label className="mt-3 flex items-center gap-2 font-semibold">
              <input type="checkbox" name="confirmDuplicate" value="yes" />
              This is a different enquiry from the same contact
            </label>
          ) : null}
        </div>
      ) : null}
      <Field label="Full name" name="name" required error={state.errors?.name?.[0]} />
      <Field label="Phone" name="phone" type="tel" error={state.errors?.phone?.[0]} />
      <Field label="Email" name="email" type="email" error={state.errors?.email?.[0]} />
      <Select
        label="Buyer or seller?"
        name="inquiryType"
        options={[
          { value: "BUYER_REQUIREMENT", label: "Buyer" },
          { value: "SELLER_LEAD", label: "Seller" },
          { value: "GENERAL_CONTACT", label: "General enquiry" },
        ]}
      />
      <input type="hidden" name="sourceType" value="MANUAL" />
      <Select
        label="Transaction"
        name="preferredTransaction"
        blank
        values={["BUY", "RENT", "LEASE"]}
      />
      <Select
        label="Land category"
        name="landCategory"
        blank
        values={["AGRICULTURAL", "NA", "INDUSTRIAL"]}
      />
      <Select
        label="District"
        name="districtId"
        blank
        options={districts.map((d) => ({ value: d.id, label: d.name }))}
      />
      <Field label="Place / locality" name="localityText" />
      <Field label="Minimum budget (₹)" name="budgetMin" type="number" />
      <Field label="Maximum budget (₹)" name="budgetMax" type="number" />
      <details className="sm:col-span-2 rounded-lg border border-slate-200">
        <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-slate-800">
          Additional details
        </summary>
        <div className="grid gap-5 border-t border-slate-100 p-4 sm:grid-cols-2">
          <Select
            label="Buyer type"
            name="buyerType"
            blank
            values={[
              "INDIVIDUAL",
              "INVESTOR",
              "FARMER",
              "DEVELOPER",
              "BUILDER",
              "INDUSTRIAL_BUSINESS",
              "LOGISTICS_OPERATOR",
              "NRI",
              "BROKER",
              "OTHER",
            ]}
          />
          <Field label="How did they find us?" name="sourceDetail" />
          <Field label="Intended use" name="intendedUse" />
          <label className="sm:col-span-2 text-sm font-semibold">
            Private note
            <textarea
              name="notesInternal"
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3 font-normal"
            />
          </label>
        </div>
      </details>
      <button disabled={pending} className="button button-primary sm:col-span-2">
        {pending ? "Saving…" : "Add Lead"}
      </button>
    </form>
  );
}
function Field({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        {...props}
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
      />
      {error ? <span className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}
function Select({
  label,
  name,
  values = [],
  options,
  blank = false,
}: {
  label: string;
  name: string;
  values?: readonly string[];
  options?: readonly { value: string; label: string }[];
  blank?: boolean;
}) {
  const choices =
    options ??
    values.map((v) => ({
      value: v,
      label: v
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/^./, (letter) => letter.toUpperCase()),
    }));
  return (
    <label className="text-sm font-semibold">
      {label}
      <select
        name={name}
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
      >
        {blank ? <option value="">Not set</option> : null}
        {choices.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
