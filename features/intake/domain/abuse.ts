import { createHmac } from "node:crypto";

import type { PublicRateAction } from "./contracts";

export const RATE_POLICIES: Readonly<
  Record<PublicRateAction | "PUBLIC_INTENT", { attempts: number; windowSeconds: number }>
> = {
  PROPERTY_INQUIRY: { attempts: 10, windowSeconds: 600 },
  BUYER_REQUIREMENT: { attempts: 5, windowSeconds: 900 },
  SITE_VISIT_REQUEST: { attempts: 5, windowSeconds: 900 },
  GENERAL_CONTACT: { attempts: 5, windowSeconds: 900 },
  SELLER_LEAD: { attempts: 5, windowSeconds: 900 },
  OWNER_LAND_SUBMISSION: { attempts: 3, windowSeconds: 1_800 },
  PUBLIC_INTENT: { attempts: 60, windowSeconds: 60 },
};

export function privacyHash(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function isTrustedOrigin(
  origin: string | null,
  configuredSiteUrl: string,
  fetchSite?: string | null,
): boolean {
  if (fetchSite === "cross-site") return false;
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(configuredSiteUrl).origin;
  } catch {
    return false;
  }
}

export function requestPayloadIsBounded(formData: FormData, maximumBytes = 16_384): boolean {
  let length = 0;
  for (const [key, value] of formData) {
    length += key.length + (typeof value === "string" ? value.length : value.size);
    if (length > maximumBytes) return false;
  }
  return true;
}

export type TurnstileVerification = Readonly<{
  success?: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: readonly string[];
}>;

export function turnstileResponseIsValid(
  response: TurnstileVerification,
  expectedHostname: string,
  expectedAction: string,
): boolean {
  return (
    response.success === true &&
    response.hostname === expectedHostname &&
    response.action === expectedAction
  );
}
