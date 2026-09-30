"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

import {
  initialOwnerSubmissionState,
  type OwnerSubmissionFormState,
} from "@/features/owner-submissions/domain/contracts";
import type { PublicFormOption } from "@/features/intake/domain/contracts";

const steps = [
  "Your goal",
  "Land type",
  "Owner details",
  "Private location",
  "Land area",
  "Commercial expectations",
  "Land details",
  "Photos and media",
  "Private documents",
  "Review and consent",
] as const;

function ErrorSummary({ state }: Readonly<{ state: OwnerSubmissionFormState }>) {
  if (!state.message) return null;
  return (
    <div className="form-error-summary" role="alert" aria-live="polite" tabIndex={-1}>
      <strong>Please review your submission</strong>
      <p>{state.message}</p>
      {state.errors ? (
        <ul className="mt-3 list-disc pl-5">
          {Object.entries(state.errors)
            .slice(0, 8)
            .map(([name, messages]) => (
              <li key={name}>
                {name.replaceAll(/([A-Z])/g, " $1")}: {messages[0]}
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}

export function OwnerSubmissionWizard({
  idempotencyKey,
  turnstileSiteKey,
  districts,
  units,
}: Readonly<{
  idempotencyKey: string;
  turnstileSiteKey?: string;
  districts: readonly PublicFormOption[];
  units: readonly PublicFormOption[];
}>) {
  const [state, setState] = useState<OwnerSubmissionFormState>(initialOwnerSubmissionState);
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState(0);
  const [ownerIntent, setOwnerIntent] = useState(state.values?.ownerIntent ?? "SELL");
  const [category, setCategory] = useState(state.values?.landCategory ?? "AGRICULTURAL");
  const [priceMode, setPriceMode] = useState(state.values?.priceMode ?? "PRICE_ON_REQUEST");
  const [districtId, setDistrictId] = useState(state.values?.districtId ?? "");
  const [areaUnitId, setAreaUnitId] = useState(state.values?.areaUnitId ?? "");
  const [priceUnitId, setPriceUnitId] = useState(state.values?.priceUnitId ?? "");
  const formRef = useRef<HTMLFormElement>(null);
  const categoryClaimsHiddenRef = useRef<HTMLInputElement>(null);
  const firstStepRender = useRef(true);

  useEffect(() => {
    if (firstStepRender.current) {
      firstStepRender.current = false;
      return;
    }
    const fieldset = formRef.current?.querySelector<HTMLFieldSetElement>(`[data-step='${step}']`);
    if (!fieldset) return;
    fieldset.scrollIntoView?.({ block: "start" });
    fieldset.querySelector<HTMLElement>("input,select,textarea")?.focus({ preventScroll: true });
  }, [step]);

  function advance() {
    const fieldset = formRef.current?.querySelector<HTMLFieldSetElement>(`[data-step='${step}']`);
    const invalid = [
      ...(fieldset?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        "input,select,textarea",
      ) ?? []),
    ].find((control) => !control.checkValidity());
    if (invalid) return invalid.reportValidity();
    const form = formRef.current;
    if (step === 6 && categoryClaimsHiddenRef.current && form) {
      categoryClaimsHiddenRef.current.value = JSON.stringify(
        Object.fromEntries(
          [
            "surveyReference",
            "blockReference",
            "tenureClaim",
            "waterIrrigation",
            "currentUse",
            "accessClaim",
            "naStatusClaim",
            "naPurpose",
            "roadWidthMetres",
            "frontageMetres",
            "industrialContext",
            "authorityName",
            "plotReference",
            "shedReference",
            "permittedUseClaim",
            "powerInfrastructure",
          ].flatMap((name) => {
            const control = form.elements.namedItem(name);
            const isField =
              control instanceof HTMLInputElement ||
              control instanceof HTMLSelectElement ||
              control instanceof HTMLTextAreaElement;
            return isField && control.value.trim() ? [[name, control.value.trim()]] : [];
          }),
        ),
      );
    }
    setStep((current) => Math.min(steps.length - 1, current + 1));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setState(initialOwnerSubmissionState);
    try {
      const response = await fetch("/sell-your-land/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(event.currentTarget),
      });
      const result = (await response.json()) as
        | Readonly<{ ok: true; location: string }>
        | Readonly<{ ok: false; state: OwnerSubmissionFormState }>;
      if (result.ok) {
        window.location.assign(result.location);
        return;
      }
      setState(result.state);
      setStep(steps.length - 1);
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>("[role='alert']")?.focus(),
      );
    } catch {
      setState({
        status: "error",
        message: "We could not securely save this submission right now. Please try again shortly.",
      });
    } finally {
      setPending(false);
    }
  }

  const fieldsetClass = (index: number) => `owner-wizard-step ${step === index ? "" : "hidden"}`;

  return (
    <form ref={formRef} onSubmit={submit} className="public-intake-form owner-wizard" noValidate>
      <div
        className="owner-progress"
        aria-label={`Step ${step + 1} of ${steps.length}`}
        aria-live="polite"
      >
        <div>
          <span>
            Step {step + 1} of {steps.length}
          </span>
          <strong>{steps[step]}</strong>
        </div>
        <div className="owner-progress-track" aria-hidden="true">
          <span style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      <fieldset className={fieldsetClass(0)} data-step="0">
        <legend>What would you like to do?</legend>
        <p className="form-help">This is a private request for review, not a published listing.</p>
        <div className="choice-grid">
          {["SELL", "RENT", "LEASE"].map((value) => (
            <label className="choice-card" key={value}>
              <input
                type="radio"
                name="ownerIntentSelector"
                value={value}
                required
                checked={ownerIntent === value}
                onChange={() => setOwnerIntent(value)}
              />
              <span>{value === "SELL" ? "Sell" : value === "RENT" ? "Rent" : "Lease"}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={fieldsetClass(1)} data-step="1">
        <legend>Choose the land type</legend>
        <div className="choice-grid">
          {(
            [
              ["AGRICULTURAL", "Agricultural land"],
              ["NA", "NA land"],
              ["INDUSTRIAL", "Industrial land"],
            ] as const
          ).map(([value, label]) => (
            <label className="choice-card" key={value}>
              <input
                type="radio"
                name="landCategorySelector"
                value={value}
                required
                checked={category === value}
                onChange={() => setCategory(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={fieldsetClass(2)} data-step="2">
        <legend>Owner and contact details</legend>
        <p className="form-help">
          UrbanEdge uses these details only to review and follow up on this submission.
        </p>
        <div className="public-form-grid">
          <label>
            <span>Name</span>
            <input
              name="name"
              required
              maxLength={160}
              autoComplete="name"
              defaultValue={state.values?.name}
            />
          </label>
          <label>
            <span>Mobile number</span>
            <input
              name="phone"
              required
              maxLength={20}
              inputMode="tel"
              autoComplete="tel"
              placeholder="10-digit Indian mobile"
              defaultValue={state.values?.phone}
            />
          </label>
          <label>
            <span>Email (optional)</span>
            <input
              name="email"
              type="email"
              maxLength={320}
              autoComplete="email"
              defaultValue={state.values?.email}
            />
          </label>
          <label>
            <span>Preferred contact</span>
            <select
              name="preferredContact"
              defaultValue={state.values?.preferredContact ?? "PHONE"}
            >
              <option value="PHONE">Phone</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="EMAIL">Email</option>
            </select>
          </label>
          <label>
            <span>Your relationship to the land</span>
            <select
              name="ownerRelationship"
              defaultValue={state.values?.ownerRelationship ?? "OWNER"}
            >
              <option value="OWNER">Owner</option>
              <option value="CO_OWNER">Co-owner</option>
              <option value="AUTHORIZED_REPRESENTATIVE">Authorized representative</option>
              <option value="BROKER_INTERMEDIARY">Broker / intermediary</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className={fieldsetClass(3)} data-step="3">
        <legend>Where is the land?</legend>
        <p className="form-help">
          Location details in this step are private. Your preference helps guide any future public
          display.
        </p>
        <div className="public-form-grid">
          <label>
            <span>District</span>
            <select
              name="districtSelector"
              required
              value={districtId}
              onChange={(event) => setDistrictId(event.target.value)}
            >
              <option value="">Choose district</option>
              {districts.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Taluka</span>
            <input
              name="talukaText"
              required
              maxLength={180}
              defaultValue={state.values?.talukaText}
            />
          </label>
          <label>
            <span>Village / locality</span>
            <input
              name="villageText"
              required
              maxLength={180}
              defaultValue={state.values?.villageText}
            />
          </label>
          <label>
            <span>Locality detail (optional)</span>
            <input name="localityText" maxLength={180} defaultValue={state.values?.localityText} />
          </label>
          <label className="sm:col-span-2">
            <span>Broad address (private)</span>
            <textarea
              name="broadAddress"
              rows={3}
              maxLength={1000}
              defaultValue={state.values?.broadAddress}
            />
          </label>
          <label>
            <span>Location preference</span>
            <select
              name="locationVisibilityPreference"
              defaultValue={state.values?.locationVisibilityPreference ?? "APPROXIMATE"}
            >
              <option value="EXACT">Exact location may be considered</option>
              <option value="APPROXIMATE">Approximate area only</option>
              <option value="HIDDEN">Keep location hidden</option>
            </select>
          </label>
          <label>
            <span>Latitude (optional, private)</span>
            <input
              name="privateLatitude"
              type="number"
              step="0.000001"
              min="-90"
              max="90"
              defaultValue={state.values?.privateLatitude}
            />
          </label>
          <label>
            <span>Longitude (optional, private)</span>
            <input
              name="privateLongitude"
              type="number"
              step="0.000001"
              min="-180"
              max="180"
              defaultValue={state.values?.privateLongitude}
            />
          </label>
        </div>
        <p className="form-help">
          Your preference is not a publication decision. UrbanEdge reviews location visibility
          separately.
        </p>
      </fieldset>

      <fieldset className={fieldsetClass(4)} data-step="4">
        <legend>Land area</legend>
        <div className="public-form-grid">
          <label>
            <span>Area</span>
            <input
              name="areaValue"
              type="number"
              step="0.0001"
              min="0.0001"
              required
              defaultValue={state.values?.areaValue}
            />
          </label>
          <label>
            <span>Original area unit</span>
            <select
              name="areaUnitSelector"
              required
              value={areaUnitId}
              onChange={(event) => setAreaUnitId(event.target.value)}
            >
              <option value="">Choose unit</option>
              {units.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className={fieldsetClass(5)} data-step="5">
        <legend>Commercial expectations</legend>
        <div className="public-form-grid">
          <label>
            <span>Price format</span>
            <select
              name="priceMode"
              value={priceMode}
              onChange={(event) => setPriceMode(event.target.value)}
            >
              <option value="PRICE_ON_REQUEST">Price on request</option>
              <option value="EXACT_TOTAL">Total asking price</option>
              <option value="PER_UNIT">Price per unit</option>
            </select>
          </label>
          {priceMode === "EXACT_TOTAL" ? (
            <label>
              <span>Total asking price (₹)</span>
              <input name="askingPriceAmount" type="number" min="0" step="1" required />
            </label>
          ) : null}
          {priceMode === "PER_UNIT" ? (
            <>
              <label>
                <span>Price per unit (₹)</span>
                <input name="askingPricePerUnit" type="number" min="0" step="0.01" required />
              </label>
              <label>
                <span>Price unit</span>
                <select
                  name="priceUnitSelector"
                  required
                  value={priceUnitId}
                  onChange={(event) => setPriceUnitId(event.target.value)}
                >
                  <option value="">Choose unit</option>
                  {units.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}
          <label>
            <span>Commercial note (optional)</span>
            <input
              name="askingPriceText"
              maxLength={180}
              placeholder="For example: open to structured terms"
            />
          </label>
          <label>
            <span>Private minimum acceptable price (optional)</span>
            <input name="minimumAcceptablePrice" type="number" min="0" step="1" />
          </label>
        </div>
        <label className="consent-field">
          <input name="negotiable" type="checkbox" />
          <span>The expectation is negotiable</span>
        </label>
      </fieldset>

      <fieldset className={fieldsetClass(6)} data-step="6">
        <legend>Property details</legend>
        <label>
          <span>Describe the land and what matters</span>
          <textarea
            name="sourceDescription"
            required
            minLength={10}
            maxLength={10000}
            rows={5}
            defaultValue={state.values?.sourceDescription}
          />
        </label>
        <div className="public-form-grid mt-5">
          <label>
            <span>Survey number (optional)</span>
            <input name="surveyReference" maxLength={160} />
          </label>
          <label>
            <span>Block number (optional)</span>
            <input name="blockReference" maxLength={160} />
          </label>
          {category === "AGRICULTURAL" ? (
            <>
              <label>
                <span>Tenure claim</span>
                <input name="tenureClaim" maxLength={160} />
              </label>
              <label>
                <span>Water / irrigation</span>
                <input name="waterIrrigation" maxLength={240} />
              </label>
              <label>
                <span>Current use</span>
                <input name="currentUse" maxLength={240} />
              </label>
              <label>
                <span>Road access</span>
                <input name="accessClaim" maxLength={240} />
              </label>
            </>
          ) : null}
          {category === "NA" ? (
            <>
              <label>
                <span>NA status claim</span>
                <input name="naStatusClaim" maxLength={160} />
              </label>
              <label>
                <span>NA purpose</span>
                <input name="naPurpose" maxLength={160} />
              </label>
              <label>
                <span>Road width (m)</span>
                <input name="roadWidthMetres" type="number" min="0" step="0.01" />
              </label>
              <label>
                <span>Frontage (m)</span>
                <input name="frontageMetres" type="number" min="0" step="0.01" />
              </label>
            </>
          ) : null}
          {category === "INDUSTRIAL" ? (
            <>
              <label>
                <span>Industrial context</span>
                <input name="industrialContext" maxLength={160} />
              </label>
              <label>
                <span>Authority / estate</span>
                <input name="authorityName" maxLength={180} />
              </label>
              <label>
                <span>Plot reference</span>
                <input name="plotReference" maxLength={160} />
              </label>
              <label>
                <span>Permitted-use claim</span>
                <input name="permittedUseClaim" maxLength={240} />
              </label>
              <label>
                <span>Power infrastructure</span>
                <input name="powerInfrastructure" maxLength={240} />
              </label>
              <label>
                <span>Access</span>
                <input name="accessClaim" maxLength={240} />
              </label>
            </>
          ) : null}
        </div>
        <p className="form-help">
          These are owner-provided claims. Uploads and form answers do not certify title, zoning,
          tenure or approvals.
        </p>
      </fieldset>

      <fieldset className={fieldsetClass(7)} data-step="7">
        <legend>Photos and media</legend>
        <p className="form-help">
          Upload clear files that help UrbanEdge understand the land. Nothing is published
          automatically.
        </p>
        <label>
          <span>Photos (JPEG or PNG)</span>
          <input name="photos" type="file" accept="image/jpeg,image/png" multiple />
        </label>
        <div className="public-form-grid mt-5">
          <label>
            <span>Video URL (optional)</span>
            <input name="videoUrl" type="url" />
          </label>
          <label>
            <span>Drone URL (optional)</span>
            <input name="droneUrl" type="url" />
          </label>
          <label>
            <span>360° tour URL (optional)</span>
            <input name="virtualTourUrl" type="url" />
          </label>
          <label>
            <span>Brochure (PDF, optional)</span>
            <input name="brochure" type="file" accept="application/pdf" />
          </label>
        </div>
      </fieldset>

      <fieldset className={fieldsetClass(8)} data-step="8">
        <legend>Private supporting documents</legend>
        <p className="form-help">
          Optional PDF, JPEG or PNG files. They stay private for UrbanEdge review—never public
          listing media.
        </p>
        <label>
          <span>Documents</span>
          <input
            name="documents"
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            multiple
          />
        </label>
        <p className="form-help">Maximum 10 total attachments and 20 MB combined.</p>
      </fieldset>

      <fieldset className={fieldsetClass(9)} data-step="9">
        <legend>Review and consent</legend>
        <p className="form-help">
          Submitting creates a private review record only. UrbanEdge may contact you, request
          evidence, edit public copy, reject the submission, or create a draft. Nothing is
          automatically published.
        </p>
        {[
          ["contactConsent", "UrbanEdge may contact me about this submission."],
          [
            "informationDeclaration",
            "I confirm the information is accurate to the best of my knowledge.",
          ],
          [
            "privacyConsent",
            "I consent to private processing of these details for review and follow-up.",
          ],
          [
            "publicationReviewAcknowledgement",
            "I understand UrbanEdge must separately review and approve anything before publication.",
          ],
          [
            "documentCertificationAcknowledgement",
            "I understand uploaded documents do not certify ownership, title, zoning, tenure or approvals.",
          ],
        ].map(([name, label]) => (
          <label className="consent-field" key={name}>
            <input name={name} type="checkbox" required />
            <span>{label}</span>
          </label>
        ))}
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
        <input type="hidden" name="ownerIntent" value={ownerIntent} />
        <input type="hidden" name="landCategory" value={category} />
        <input ref={categoryClaimsHiddenRef} type="hidden" name="categoryClaimsJson" />
        <input type="hidden" name="districtId" value={districtId} />
        <input type="hidden" name="areaUnitId" value={areaUnitId} />
        <input type="hidden" name="priceUnitId" value={priceUnitId} />
        <label className="intake-honeypot" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        {turnstileSiteKey ? (
          <div
            className="cf-turnstile"
            data-sitekey={turnstileSiteKey}
            data-action="owner_land_submission"
            data-response-field-name="cf-turnstile-response"
          />
        ) : (
          <p className="form-protection-note">
            Anti-bot verification runs in configured environments.
          </p>
        )}
        <ErrorSummary state={state} />
      </fieldset>

      <div className="owner-wizard-actions">
        <button
          type="button"
          className="button button-outline"
          disabled={step === 0 || pending}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button type="button" className="button button-gold" onClick={advance}>
            Continue
          </button>
        ) : (
          <button type="submit" className="button button-gold" disabled={pending}>
            {pending ? "Submitting securely…" : "Submit for private review"}
          </button>
        )}
      </div>
    </form>
  );
}
