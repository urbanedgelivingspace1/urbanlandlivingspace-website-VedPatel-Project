import "server-only";

import {
  turnstileResponseIsValid,
  type TurnstileVerification,
} from "@/features/intake/domain/abuse";
import { PublicIntakeError, type PublicIntakeAction } from "@/features/intake/domain/contracts";
import type { ServerEnvironment } from "@/config/environment-schema";

const actionNames: Record<PublicIntakeAction, string> = {
  PROPERTY_INQUIRY: "property_inquiry",
  BUYER_REQUIREMENT: "buyer_requirement",
  SITE_VISIT_REQUEST: "site_visit_request",
  GENERAL_CONTACT: "general_contact",
};

export async function verifyTurnstile(
  environment: ServerEnvironment,
  input: Readonly<{
    action: PublicIntakeAction;
    token?: string;
    idempotencyKey: string;
  }>,
  fetcher: typeof fetch = fetch,
): Promise<"verified" | "disabled-local"> {
  const siteKey = environment.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secret = environment.TURNSTILE_SECRET_KEY;
  if (!siteKey && !secret) {
    if (environment.APP_ENV === "local" || environment.APP_ENV === "test") return "disabled-local";
    throw new PublicIntakeError("BOT_CONFIGURATION_REQUIRED");
  }
  if (!siteKey || !secret || !input.token) throw new PublicIntakeError("BOT_REJECTED");

  const body = new URLSearchParams({
    secret,
    response: input.token,
    idempotency_key: input.idempotencyKey,
  });
  let response: Response;
  try {
    response = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new PublicIntakeError("BOT_REJECTED");
  }
  if (!response.ok) throw new PublicIntakeError("BOT_REJECTED");
  const result = (await response.json()) as TurnstileVerification;
  if (
    !turnstileResponseIsValid(
      result,
      new URL(environment.NEXT_PUBLIC_SITE_URL).hostname,
      actionNames[input.action],
    )
  )
    throw new PublicIntakeError("BOT_REJECTED");
  return "verified";
}

export function turnstileActionName(action: PublicIntakeAction): string {
  return actionNames[action];
}
