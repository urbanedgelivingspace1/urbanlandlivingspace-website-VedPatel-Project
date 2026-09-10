"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { isTrustedOrigin, requestPayloadIsBounded } from "@/features/intake/domain/abuse";
import {
  PUBLIC_PRIVACY_NOTICE_VERSION,
  PublicIntakeError,
  type PublicIntakeFormState,
  type RequirementSourceContext,
} from "@/features/intake/domain/contracts";
import {
  buyerRequirementInputSchema,
  generalContactInputSchema,
  propertyInquiryInputSchema,
  sellerLeadInputSchema,
  siteVisitRequestInputSchema,
  visitWindowToUtc,
} from "@/features/intake/domain/validation";
import { getServerEnvironment } from "@/server/env";
import { submitPublicIntake } from "@/server/services/public-intake";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}
function optional(formData: FormData, name: string): string | undefined {
  return text(formData, name) || undefined;
}
function number(formData: FormData, name: string): number | undefined {
  const value = optional(formData, name);
  return value === undefined ? undefined : Number(value);
}
function common(formData: FormData) {
  return {
    name: text(formData, "name"),
    phone: text(formData, "phone"),
    email: optional(formData, "email"),
    consent: formData.get("consent") === "on",
    privacyNoticeVersion: PUBLIC_PRIVACY_NOTICE_VERSION,
    idempotencyKey: text(formData, "idempotencyKey"),
    turnstileToken: optional(formData, "cf-turnstile-response"),
  };
}

async function requestContext(formData: FormData) {
  if (!requestPayloadIsBounded(formData) || text(formData, "website"))
    throw new PublicIntakeError("INVALID_REQUEST");
  const requestHeaders = await headers();
  const environment = getServerEnvironment();
  const origin = requestHeaders.get("origin");
  if (
    !isTrustedOrigin(origin, environment.NEXT_PUBLIC_SITE_URL, requestHeaders.get("sec-fetch-site"))
  )
    throw new PublicIntakeError("UNTRUSTED_ORIGIN");
  const ipAddress =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";
  return { ipAddress, origin };
}

function preservedValues(formData: FormData): Readonly<Record<string, string>> {
  return Object.fromEntries(
    [...formData.entries()].flatMap(([name, value]) =>
      typeof value === "string" &&
      name !== "website" &&
      name !== "cf-turnstile-response" &&
      name !== "idempotencyKey"
        ? [[name, value]]
        : [],
    ),
  );
}

function formError(error: unknown, formData: FormData): PublicIntakeFormState {
  const values = preservedValues(formData);
  if (error instanceof z.ZodError)
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      errors: error.flatten().fieldErrors,
      values,
    };
  if (error instanceof PublicIntakeError) {
    const messages: Record<PublicIntakeError["code"], string> = {
      RATE_LIMITED: "Too many requests were received. Please wait and try again.",
      BOT_REJECTED: "Please complete the verification and try again.",
      BOT_CONFIGURATION_REQUIRED: "This form is temporarily unavailable.",
      UNTRUSTED_ORIGIN: "This request could not be accepted.",
      PROPERTY_UNAVAILABLE:
        "This request cannot be accepted for that property. Please explore current land.",
      IDEMPOTENCY_CONFLICT: "This form changed after submission. Refresh the page and try again.",
      INVALID_REQUEST: "Check the form and try again.",
      SERVICE_UNAVAILABLE: "We could not save this request right now. Please try again shortly.",
    };
    return { status: "error", message: messages[error.code], values };
  }
  console.error("public_intake_action_failed", { code: "UNEXPECTED_FAILURE" });
  return {
    status: "error",
    message: "We could not save this request right now. Please try again shortly.",
    values,
  };
}

export async function submitPropertyInquiryAction(
  context: Readonly<{ propertySlug: string }>,
  _previous: PublicIntakeFormState,
  formData: FormData,
): Promise<PublicIntakeFormState> {
  try {
    const input = propertyInquiryInputSchema.parse({
      action: "PROPERTY_INQUIRY",
      ...common(formData),
      propertySlug: context.propertySlug,
      preferredContact: text(formData, "preferredContact"),
      message: optional(formData, "message"),
    });
    const result = await submitPublicIntake(input, await requestContext(formData));
    return {
      status: "success",
      message: "Your inquiry has been received. UrbanEdge will review it and contact you.",
      propertyReference: result.propertyReference,
    };
  } catch (error) {
    return formError(error, formData);
  }
}

export async function submitBuyerRequirementAction(
  context: Readonly<{ sourceContext: RequirementSourceContext }>,
  _previous: PublicIntakeFormState,
  formData: FormData,
): Promise<PublicIntakeFormState> {
  try {
    const input = buyerRequirementInputSchema.parse({
      action: "BUYER_REQUIREMENT",
      ...common(formData),
      sourceContext: context.sourceContext,
      buyerType: optional(formData, "buyerType"),
      preferredTransaction: text(formData, "preferredTransaction"),
      landCategory: text(formData, "landCategory"),
      districtId: optional(formData, "districtId"),
      subdistrictId: optional(formData, "subdistrictId"),
      placeId: optional(formData, "placeId"),
      localityText: optional(formData, "localityText"),
      budgetMinimum: number(formData, "budgetMinimum"),
      budgetMaximum: number(formData, "budgetMaximum"),
      minimumArea: number(formData, "minimumArea"),
      maximumArea: number(formData, "maximumArea"),
      areaUnitId: optional(formData, "areaUnitId"),
      intendedUse: optional(formData, "intendedUse"),
      timeline: optional(formData, "timeline"),
      message: optional(formData, "message"),
    });
    await submitPublicIntake(input, await requestContext(formData));
  } catch (error) {
    return formError(error, formData);
  }
  redirect("/requirements/thank-you");
}

export async function submitSiteVisitRequestAction(
  context: Readonly<{ propertySlug: string }>,
  _previous: PublicIntakeFormState,
  formData: FormData,
): Promise<PublicIntakeFormState> {
  let propertyReference: string | undefined;
  try {
    const window = visitWindowToUtc(
      text(formData, "preferredDate"),
      text(formData, "preferredWindow"),
    );
    const input = siteVisitRequestInputSchema.parse({
      action: "SITE_VISIT_REQUEST",
      ...common(formData),
      propertySlug: context.propertySlug,
      ...window,
      alternateTime: optional(formData, "alternateTime"),
      message: optional(formData, "message"),
    });
    const result = await submitPublicIntake(input, await requestContext(formData));
    propertyReference = result.propertyReference;
  } catch (error) {
    return formError(error, formData);
  }
  const query = propertyReference ? `?property=${encodeURIComponent(propertyReference)}` : "";
  redirect(`/site-visit/thank-you${query}`);
}

export async function submitGeneralContactAction(
  _previous: PublicIntakeFormState,
  formData: FormData,
): Promise<PublicIntakeFormState> {
  try {
    const input = generalContactInputSchema.parse({
      action: "GENERAL_CONTACT",
      ...common(formData),
      intendedUse: text(formData, "purpose"),
      message: text(formData, "message"),
    });
    await submitPublicIntake(input, await requestContext(formData));
    return {
      status: "success",
      message: "Your message has been received. UrbanEdge will review it and contact you.",
    };
  } catch (error) {
    return formError(error, formData);
  }
}

export async function submitSellerLeadAction(
  _previous: PublicIntakeFormState,
  formData: FormData,
): Promise<PublicIntakeFormState> {
  try {
    const input = sellerLeadInputSchema.parse({
      action: "SELLER_LEAD",
      ...common(formData),
      preferredTransaction: optional(formData, "preferredTransaction") || "BUY",
      landCategory: optional(formData, "landCategory"),
      districtId: optional(formData, "districtId"),
      localityText: optional(formData, "localityText"),
      areaValue: number(formData, "areaValue"),
      areaUnitId: optional(formData, "areaUnitId"),
      expectedPrice: optional(formData, "expectedPrice"),
      message: optional(formData, "message"),
    });
    await submitPublicIntake(input, await requestContext(formData));
    return {
      status: "success",
      message:
        "Thank you! Your land details have been received privately. An UrbanEdge land advisor will contact you shortly.",
    };
  } catch (error) {
    return formError(error, formData);
  }
}
