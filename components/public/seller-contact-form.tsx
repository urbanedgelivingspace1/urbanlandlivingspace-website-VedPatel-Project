"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  initialPublicIntakeState,
  type PublicFormOption,
  type PublicIntakeFormState,
} from "@/features/intake/domain/contracts";

type IntakeAction = (
  state: PublicIntakeFormState,
  formData: FormData,
) => Promise<PublicIntakeFormState>;

type SellerContactFormProps = Readonly<{
  idempotencyKey: string;
  districts: readonly PublicFormOption[];
  turnstileSiteKey?: string;
  action: IntakeAction;
}>;

function ErrorMessage({ state, name }: Readonly<{ state: PublicIntakeFormState; name: string }>) {
  const message = state.errors?.[name]?.[0];
  return message ? (
    <span className="field-error text-xs text-rose-600 mt-1 block" id={`${name}-error`}>
      {message}
    </span>
  ) : null;
}

function fieldProps(state: PublicIntakeFormState, name: string) {
  const invalid = Boolean(state.errors?.[name]?.length);
  return {
    "aria-invalid": invalid || undefined,
    "aria-describedby": invalid ? `${name}-error` : undefined,
  };
}

export function SellerContactForm({
  idempotencyKey,
  districts,
  turnstileSiteKey,
  action,
}: SellerContactFormProps) {
  const [state, formAction, pending] = useActionState(action, initialPublicIntakeState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "error") {
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div
        className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center sm:p-10 shadow-sm"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl font-bold">
          ✓
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold text-slate-900">
          We received your request
        </h2>
        <p className="mt-3 max-w-lg mx-auto text-sm text-slate-700 leading-relaxed">
          {state.message ||
            "Thank you! Your land details have been received privately. An UrbanEdge land advisor will review your inquiry and contact you shortly."}
        </p>
        <div className="mt-6 rounded-xl border border-emerald-100 bg-white p-4 max-w-md mx-auto text-xs text-slate-600">
          <p className="font-semibold text-slate-900">What happens next?</p>
          <p className="mt-1">
            Our team will review the details you shared and contact you by phone or email. Nothing
            is published automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="public-intake-form space-y-6" noValidate>
      {/* Privacy Notice Banner */}
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 text-xs text-amber-950">
        <p className="font-bold">Private & Confidential Submission</p>
        <p className="mt-1 text-slate-700">
          Your information is stored privately and accessed only by authorized UrbanEdge land
          advisors. We never automatically list or publish land without direct discussion.
        </p>
      </div>

      {/* Contact information */}
      <fieldset className="space-y-4 border-b border-slate-200 pb-6">
        <legend className="text-base font-bold text-slate-900">Your contact details</legend>
        <div className="public-form-grid">
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Full Name *</span>
            <input
              name="name"
              aria-label="Full Name"
              required
              maxLength={160}
              autoComplete="name"
              placeholder="e.g. Rajeshbhai Patel"
              defaultValue={state.values?.name}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-xs focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)]"
              {...fieldProps(state, "name")}
            />
            <ErrorMessage state={state} name="name" />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Phone / WhatsApp *</span>
            <input
              name="phone"
              aria-label="Mobile Number"
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="10-digit Indian mobile (e.g. 9825012345)"
              maxLength={20}
              defaultValue={state.values?.phone}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-xs focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)]"
              {...fieldProps(state, "phone")}
            />
            <ErrorMessage state={state} name="phone" />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-slate-700">Email Address (Optional)</span>
          <input
            name="email"
            type="email"
            aria-label="Email Address"
            autoComplete="email"
            placeholder="name@example.com"
            maxLength={320}
            defaultValue={state.values?.email}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-xs focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)]"
            {...fieldProps(state, "email")}
          />
          <ErrorMessage state={state} name="email" />
        </label>
      </fieldset>

      {/* Optional land context */}
      <fieldset className="space-y-4 border-b border-slate-200 pb-6">
        <legend className="text-base font-bold text-slate-900">Land details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Intent</span>
            <select
              name="preferredTransaction"
              aria-label="Intent"
              defaultValue={state.values?.preferredTransaction ?? "BUY"}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-xs focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)]"
            >
              <option value="BUY">Sell my land</option>
              <option value="RENT">Rent out land</option>
              <option value="LEASE">Lease out land</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Land type (optional)</span>
            <select
              name="landCategory"
              defaultValue={state.values?.landCategory ?? ""}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-xs focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)]"
            >
              <option value="">Not sure yet</option>
              <option value="AGRICULTURAL">Agricultural</option>
              <option value="NA">NA</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Location (optional)</span>
            <select
              name="districtId"
              defaultValue={state.values?.districtId ?? ""}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-xs focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)]"
            >
              <option value="">Choose a district</option>
              {districts.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-700">
              Village / Locality / Landmark
            </span>
            <input
              name="localityText"
              placeholder="e.g. Near Sanand GIDC Gate 2"
              maxLength={180}
              defaultValue={state.values?.localityText}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-xs focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)]"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-slate-700">Message (optional)</span>
          <textarea
            name="message"
            rows={4}
            maxLength={2000}
            placeholder="Share a short description of the land or how you would like us to help."
            defaultValue={state.values?.message}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-xs focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)]"
          />
        </label>
      </fieldset>

      {/* Consent & Security */}
      <div className="space-y-4">
        <label className="flex items-start gap-3 text-xs text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            name="consent"
            required
            defaultChecked={state.values?.consent === "on"}
            className="mt-0.5 rounded border-slate-300 text-[var(--brand-navy)] focus:ring-[var(--brand-navy)]"
            {...fieldProps(state, "consent")}
          />
          <span>
            I agree that UrbanEdge may contact me regarding this land. I understand that details are
            held privately and no public listing will be created without my authorization.
          </span>
        </label>
        <ErrorMessage state={state} name="consent" />

        {/* Protection & Anti-bot */}
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
        <label className="intake-honeypot hidden" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>

        {turnstileSiteKey ? (
          <div
            className="cf-turnstile"
            data-sitekey={turnstileSiteKey}
            data-action="seller_lead"
            data-response-field-name="cf-turnstile-response"
          />
        ) : null}

        {state.status === "error" && state.message ? (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {state.message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full sm:w-auto rounded-xl bg-[var(--brand-gold)] px-8 py-3.5 text-sm font-bold text-[var(--brand-navy)] shadow-md hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Sending…" : "Contact Me"}
        </button>
      </div>
    </form>
  );
}
