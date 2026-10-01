"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  initialPublicIntakeState,
  type PublicFormOption,
  type PublicIntakeFormState,
  type RequirementPrefill,
} from "@/features/intake/domain/contracts";
import { useLanguage } from "@/components/public/language-provider";
import { minimumLocalVisitDate } from "@/lib/formatting/local-date";

type IntakeAction = (
  state: PublicIntakeFormState,
  formData: FormData,
) => Promise<PublicIntakeFormState>;

function useIntakeForm(action: IntakeAction) {
  const [state, formAction, pending] = useActionState(action, initialPublicIntakeState);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "error")
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [state]);
  return { state, formAction, pending, formRef };
}

function ErrorMessage({ state, name }: Readonly<{ state: PublicIntakeFormState; name: string }>) {
  const message = state.errors?.[name]?.[0];
  return message ? (
    <span className="field-error" id={`${name}-error`}>
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

function ProtectionFields({
  idempotencyKey,
  turnstileSiteKey,
  turnstileAction,
}: Readonly<{ idempotencyKey: string; turnstileSiteKey?: string; turnstileAction: string }>) {
  return (
    <>
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <label className="intake-honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {turnstileSiteKey ? (
        <div
          className="cf-turnstile"
          data-sitekey={turnstileSiteKey}
          data-action={turnstileAction}
          data-response-field-name="cf-turnstile-response"
        />
      ) : (
        <p className="form-protection-note">
          Anti-bot verification runs in configured environments.
        </p>
      )}
    </>
  );
}

function Consent({ state }: Readonly<{ state: PublicIntakeFormState }>) {
  return (
    <label className="consent-field">
      <input
        type="checkbox"
        name="consent"
        required
        defaultChecked={state.values?.consent === "on"}
        {...fieldProps(state, "consent")}
      />
      <span>
        I agree that UrbanEdge may use these details to respond to this request. This is provisional
        service-contact consent; final privacy wording remains subject to legal approval.
      </span>
      <ErrorMessage state={state} name="consent" />
    </label>
  );
}

function ContactFields({
  state,
  emailRequired = false,
}: Readonly<{ state: PublicIntakeFormState; emailRequired?: boolean }>) {
  const { t } = useLanguage();
  return (
    <div className="public-form-grid">
      <label>
        <span>{t("form.name")}</span>
        <input
          name="name"
          aria-label={t("form.name")}
          required
          maxLength={160}
          autoComplete="name"
          defaultValue={state.values?.name}
          {...fieldProps(state, "name")}
        />
        <ErrorMessage state={state} name="name" />
      </label>
      <label>
        <span>{t("form.mobile")}</span>
        <input
          name="phone"
          aria-label={t("form.mobile")}
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder={t("form.mobileHint")}
          maxLength={20}
          defaultValue={state.values?.phone}
          {...fieldProps(state, "phone")}
        />
        <ErrorMessage state={state} name="phone" />
      </label>
      <label>
        <span>{emailRequired ? "Email" : t("form.emailOptional")}</span>
        <input
          name="email"
          aria-label={emailRequired ? "Email" : "Email (optional)"}
          type="email"
          required={emailRequired}
          maxLength={320}
          autoComplete="email"
          defaultValue={state.values?.email}
          {...fieldProps(state, "email")}
        />
        <ErrorMessage state={state} name="email" />
      </label>
    </div>
  );
}

function FormStatus({ state }: Readonly<{ state: PublicIntakeFormState }>) {
  const { t } = useLanguage();
  if (!state.message) return null;
  return (
    <div
      className={state.status === "success" ? "form-success" : "form-error-summary"}
      role={state.status === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <strong>{state.status === "success" ? t("form.requestReceived") : t("form.review")}</strong>
      <p>{state.message}</p>
      {state.status === "success" && state.propertyReference ? (
        <p>Property reference: {state.propertyReference}</p>
      ) : null}
    </div>
  );
}

export function PropertyInquiryForm({
  action,
  idempotencyKey,
  turnstileSiteKey,
}: Readonly<{ action: IntakeAction; idempotencyKey: string; turnstileSiteKey?: string }>) {
  const { t } = useLanguage();
  const { state, formAction, pending, formRef } = useIntakeForm(action);
  if (state.status === "success") return <FormStatus state={state} />;
  return (
    <form ref={formRef} action={formAction} className="public-intake-form" noValidate>
      <ContactFields state={state} />
      <label>
        <span>{t("form.preferredContact")}</span>
        <select
          name="preferredContact"
          defaultValue={state.values?.preferredContact ?? "PHONE"}
          {...fieldProps(state, "preferredContact")}
        >
          <option value="PHONE">Phone</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="EMAIL">Email</option>
        </select>
        <ErrorMessage state={state} name="preferredContact" />
      </label>
      <label>
        <span>{t("form.question")}</span>
        <textarea
          name="message"
          rows={4}
          maxLength={2_000}
          defaultValue={state.values?.message}
          {...fieldProps(state, "message")}
        />
        <ErrorMessage state={state} name="message" />
      </label>
      <Consent state={state} />
      <p className="form-reassurance">{t("form.privacy")}</p>
      <ProtectionFields
        idempotencyKey={idempotencyKey}
        turnstileSiteKey={turnstileSiteKey}
        turnstileAction="property_inquiry"
      />
      <FormStatus state={state} />
      <button className="button button-gold" disabled={pending} type="submit">
        {pending ? t("form.sending") : t("form.sendInquiry")}
      </button>
    </form>
  );
}

export function BuyerRequirementForm({
  action,
  idempotencyKey,
  turnstileSiteKey,
  prefill,
  districts,
  subdistricts,
  places,
  units,
}: Readonly<{
  action: IntakeAction;
  idempotencyKey: string;
  turnstileSiteKey?: string;
  prefill: RequirementPrefill;
  districts: readonly PublicFormOption[];
  subdistricts: readonly PublicFormOption[];
  places: readonly PublicFormOption[];
  units: readonly PublicFormOption[];
}>) {
  const { state, formAction, pending, formRef } = useIntakeForm(action);
  return (
    <form
      ref={formRef}
      action={formAction}
      className="public-intake-form requirement-form"
      noValidate
    >
      <fieldset aria-label="Contact">
        <legend>1. Your contact details</legend>
        <p className="form-help">Required fields help UrbanEdge respond to your requirement.</p>
        <ContactFields state={state} />
      </fieldset>
      <fieldset className="requirement-section" aria-label="Requirement">
        <legend>2. What kind of land do you need?</legend>
        <div className="public-form-grid">
          <label>
            <span>Buyer profile</span>
            <select name="buyerType" defaultValue={state.values?.buyerType ?? "INDIVIDUAL"}>
              <option value="INDIVIDUAL">Individual</option>
              <option value="INVESTOR">Investor</option>
              <option value="FARMER">Farmer</option>
              <option value="DEVELOPER">Developer</option>
              <option value="BUILDER">Builder</option>
              <option value="INDUSTRIAL_BUSINESS">Industrial business</option>
              <option value="LOGISTICS_OPERATOR">Logistics operator</option>
              <option value="NRI">NRI</option>
              <option value="BROKER">Broker</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <label>
            <span>Transaction</span>
            <select
              name="preferredTransaction"
              required
              defaultValue={state.values?.preferredTransaction ?? prefill.transaction ?? "BUY"}
              {...fieldProps(state, "preferredTransaction")}
            >
              <option value="BUY">Buy</option>
              <option value="RENT">Rent</option>
              <option value="LEASE">Lease</option>
            </select>
            <ErrorMessage state={state} name="preferredTransaction" />
          </label>
          <label>
            <span>Land category</span>
            <select
              name="landCategory"
              required
              defaultValue={state.values?.landCategory ?? prefill.category ?? "AGRICULTURAL"}
              {...fieldProps(state, "landCategory")}
            >
              <option value="AGRICULTURAL">Agricultural</option>
              <option value="NA">NA land</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>
            <ErrorMessage state={state} name="landCategory" />
          </label>
        </div>
      </fieldset>
      <fieldset className="requirement-section">
        <legend>3. Preferred location</legend>
        <div className="public-form-grid">
          <label>
            <span>District</span>
            <select
              name="districtId"
              defaultValue={state.values?.districtId ?? prefill.districtId ?? ""}
            >
              <option value="">Any supported district</option>
              {districts.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Taluka (optional)</span>
            <select name="subdistrictId" defaultValue={state.values?.subdistrictId ?? ""}>
              <option value="">Any taluka</option>
              {subdistricts.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Village or place (optional)</span>
            <select name="placeId" defaultValue={state.values?.placeId ?? ""}>
              <option value="">Any place</option>
              {places.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Locality or preferred belt (optional)</span>
            <input name="localityText" maxLength={180} defaultValue={state.values?.localityText} />
          </label>
        </div>
      </fieldset>
      <fieldset className="requirement-section">
        <legend>4. Budget and area</legend>
        <p className="form-help">
          Add a range where possible. Leave fields blank if you are still deciding.
        </p>
        <div className="public-form-grid">
          <label>
            <span>Minimum budget (₹)</span>
            <input
              name="budgetMinimum"
              type="number"
              inputMode="decimal"
              min="0"
              defaultValue={state.values?.budgetMinimum ?? prefill.budgetMinimum}
              {...fieldProps(state, "budgetMinimum")}
            />
            <ErrorMessage state={state} name="budgetMinimum" />
          </label>
          <label>
            <span>Maximum budget (₹)</span>
            <input
              name="budgetMaximum"
              type="number"
              inputMode="decimal"
              min="0"
              defaultValue={state.values?.budgetMaximum ?? prefill.budgetMaximum}
              {...fieldProps(state, "budgetMaximum")}
            />
            <ErrorMessage state={state} name="budgetMaximum" />
          </label>
          <label>
            <span>Minimum area</span>
            <input
              name="minimumArea"
              type="number"
              inputMode="decimal"
              min="0.0001"
              step="any"
              defaultValue={state.values?.minimumArea ?? prefill.minimumArea}
              {...fieldProps(state, "minimumArea")}
            />
            <ErrorMessage state={state} name="minimumArea" />
          </label>
          <label>
            <span>Maximum area</span>
            <input
              name="maximumArea"
              type="number"
              inputMode="decimal"
              min="0.0001"
              step="any"
              defaultValue={state.values?.maximumArea ?? prefill.maximumArea}
              {...fieldProps(state, "maximumArea")}
            />
            <ErrorMessage state={state} name="maximumArea" />
          </label>
          <label>
            <span>Area unit</span>
            <select
              name="areaUnitId"
              defaultValue={state.values?.areaUnitId ?? prefill.areaUnitId ?? ""}
              {...fieldProps(state, "areaUnitId")}
            >
              <option value="">Choose when entering area</option>
              {units.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ErrorMessage state={state} name="areaUnitId" />
          </label>
        </div>
      </fieldset>
      <details className="requirement-more-details">
        <summary>
          5. More details <span>Optional</span>
        </summary>
        <div className="public-form-grid mt-5">
          <label>
            <span>Intended use</span>
            <input name="intendedUse" maxLength={240} defaultValue={state.values?.intendedUse} />
          </label>
          <label>
            <span>Timeline</span>
            <select name="timeline" defaultValue={state.values?.timeline ?? ""}>
              <option value="">Not decided</option>
              <option value="Within 1 month">Within 1 month</option>
              <option value="1–3 months">1–3 months</option>
              <option value="3–6 months">3–6 months</option>
              <option value="More than 6 months">More than 6 months</option>
            </select>
          </label>
        </div>
        <label className="mt-5">
          <span>Requirement notes</span>
          <textarea
            name="message"
            rows={5}
            maxLength={2_000}
            defaultValue={state.values?.message}
            {...fieldProps(state, "message")}
          />
          <ErrorMessage state={state} name="message" />
        </label>
      </details>
      <Consent state={state} />
      <ProtectionFields
        idempotencyKey={idempotencyKey}
        turnstileSiteKey={turnstileSiteKey}
        turnstileAction="buyer_requirement"
      />
      <FormStatus state={state} />
      <button className="button button-gold" disabled={pending} type="submit">
        {pending ? "Sharing…" : "Share requirement"}
      </button>
    </form>
  );
}

export function SiteVisitRequestForm({
  action,
  idempotencyKey,
  turnstileSiteKey,
  minimumDate,
}: Readonly<{
  action: IntakeAction;
  idempotencyKey: string;
  turnstileSiteKey?: string;
  minimumDate: string;
}>) {
  const { t } = useLanguage();
  const { state, formAction, pending, formRef } = useIntakeForm(action);
  return (
    <form ref={formRef} action={formAction} className="public-intake-form" noValidate>
      <ContactFields state={state} />
      <div className="public-form-grid">
        <label>
          <span>Preferred date</span>
          <input
            name="preferredDate"
            type="date"
            min={minimumDate}
            onFocus={(event) => {
              event.currentTarget.min = minimumLocalVisitDate();
            }}
            required
            defaultValue={state.values?.preferredDate}
            {...fieldProps(state, "requestedStartAt")}
          />
          <ErrorMessage state={state} name="requestedStartAt" />
        </label>
        <label>
          <span>Preferred time window</span>
          <select
            name="preferredWindow"
            defaultValue={state.values?.preferredWindow ?? "MORNING"}
            required
          >
            <option value="MORNING">9:00 AM–12:00 PM</option>
            <option value="AFTERNOON">12:00 PM–3:00 PM</option>
            <option value="EVENING">3:00 PM–6:00 PM</option>
          </select>
        </label>
        <label>
          <span>Alternate time (optional)</span>
          <input
            name="alternateTime"
            maxLength={160}
            placeholder="Another date or window"
            defaultValue={state.values?.alternateTime}
          />
        </label>
      </div>
      <label>
        <span>Access or visit note (optional)</span>
        <textarea
          name="message"
          rows={4}
          maxLength={2_000}
          defaultValue={state.values?.message}
          {...fieldProps(state, "message")}
        />
        <ErrorMessage state={state} name="message" />
      </label>
      <p className="form-reassurance">
        This is a request, not an automatic booking. UrbanEdge will confirm after checking access
        and availability.
      </p>
      <Consent state={state} />
      <ProtectionFields
        idempotencyKey={idempotencyKey}
        turnstileSiteKey={turnstileSiteKey}
        turnstileAction="site_visit_request"
      />
      <FormStatus state={state} />
      <button className="button button-gold" disabled={pending} type="submit">
        {pending ? t("form.sending") : t("form.requestVisit")}
      </button>
    </form>
  );
}

export function GeneralContactForm({
  action,
  idempotencyKey,
  turnstileSiteKey,
}: Readonly<{ action: IntakeAction; idempotencyKey: string; turnstileSiteKey?: string }>) {
  const { t } = useLanguage();
  const { state, formAction, pending, formRef } = useIntakeForm(action);
  if (state.status === "success") return <FormStatus state={state} />;
  return (
    <form ref={formRef} action={formAction} className="public-intake-form" noValidate>
      <ContactFields state={state} />
      <label>
        <span>{t("form.purpose")}</span>
        <select
          name="purpose"
          required
          defaultValue={state.values?.purpose ?? "Discuss a property"}
        >
          <option>Discuss a property</option>
          <option>Share a buyer requirement</option>
          <option>Understand UrbanEdge services</option>
          <option>Other</option>
        </select>
      </label>
      <label>
        <span>{t("form.message")}</span>
        <textarea
          name="message"
          required
          rows={5}
          minLength={5}
          maxLength={2_000}
          defaultValue={state.values?.message}
          {...fieldProps(state, "message")}
        />
        <ErrorMessage state={state} name="message" />
      </label>
      <Consent state={state} />
      <p className="form-reassurance">{t("form.privacy")}</p>
      <ProtectionFields
        idempotencyKey={idempotencyKey}
        turnstileSiteKey={turnstileSiteKey}
        turnstileAction="general_contact"
      />
      <FormStatus state={state} />
      <button className="button button-gold" disabled={pending} type="submit">
        {pending ? t("form.sending") : t("form.sendMessage")}
      </button>
    </form>
  );
}
