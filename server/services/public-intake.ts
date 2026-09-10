import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { privacyHash, RATE_POLICIES } from "@/features/intake/domain/abuse";
import { PublicIntakeError, type PublicIntakeResult } from "@/features/intake/domain/contracts";
import {
  publicIntakeInputSchema,
  type PublicIntakeInput,
} from "@/features/intake/domain/validation";
import { getServerEnvironment } from "@/server/env";
import { deliverAdminIntakeNotification } from "@/server/integrations/intake-notifications";
import { verifyTurnstile } from "@/server/integrations/turnstile";
import { createPrivilegedServerClient } from "@/server/supabase/privileged";
import type { Database, Json } from "@/types/database.generated";

type Db = SupabaseClient<Database>;
type PersistedIntake = Readonly<{
  target_lead_id: string;
  target_property_id: string | null;
  target_notification_id: string;
  replayed: boolean;
}>;
export type PublicRequestContext = Readonly<{ ipAddress: string; origin: string | null }>;

function asJson(value: unknown): Json {
  return value as Json;
}

function mapDatabaseError(message: string): PublicIntakeError {
  if (message.includes("PUBLIC_PROPERTY_UNAVAILABLE"))
    return new PublicIntakeError("PROPERTY_UNAVAILABLE");
  if (message.includes("IDEMPOTENCY_CONFLICT"))
    return new PublicIntakeError("IDEMPOTENCY_CONFLICT");
  if (message.includes("INVALID_")) return new PublicIntakeError("INVALID_REQUEST");
  return new PublicIntakeError("SERVICE_UNAVAILABLE");
}

function hmacSecret(): string {
  const environment = getServerEnvironment();
  if (environment.HMAC_SECRET) return environment.HMAC_SECRET;
  if (environment.APP_ENV === "local" || environment.APP_ENV === "test")
    return "urbanedge-local-test-hmac-boundary-not-for-production";
  throw new PublicIntakeError("SERVICE_UNAVAILABLE");
}

export async function consumePublicRateLimit(
  client: Db,
  action: keyof typeof RATE_POLICIES,
  bucketHash: string,
): Promise<boolean> {
  const policy = RATE_POLICIES[action];
  const result = await client.rpc("consume_public_intake_rate_limit", {
    requested_action: action,
    requested_bucket_hash: bucketHash,
    requested_max_attempts: policy.attempts,
    requested_window_seconds: policy.windowSeconds,
  });
  if (result.error) throw mapDatabaseError(result.error.message);
  return result.data === true;
}

export async function persistPublicIntake(
  client: Db,
  input: PublicIntakeInput,
  idempotencyKeyHash: string,
): Promise<PersistedIntake> {
  const storedPayload: Record<string, unknown> = { ...input };
  delete storedPayload.action;
  delete storedPayload.idempotencyKey;
  delete storedPayload.turnstileToken;
  const result = await client.rpc("submit_public_crm_intake", {
    requested_action: input.action,
    requested_idempotency_key_hash: idempotencyKeyHash,
    requested_payload: asJson(storedPayload),
  });
  if (result.error) throw mapDatabaseError(result.error.message);
  const row = result.data?.[0];
  if (!row) throw new PublicIntakeError("SERVICE_UNAVAILABLE");
  return row;
}

async function recordNotificationResult(
  client: Db,
  deliveryId: string,
  status: "SENT" | "FAILED" | "SKIPPED",
  errorCode?: string,
) {
  const result = await client.rpc("record_notification_delivery_result", {
    requested_delivery_id: deliveryId,
    requested_status: status,
    requested_error_code: errorCode,
  });
  if (result.error)
    console.error("public_intake_notification_status_failed", {
      deliveryId,
      code: "DATABASE_UPDATE_FAILED",
    });
}

async function recordConversionAnalytics(
  client: Db,
  input: PublicIntakeInput,
  propertyId: string | null,
) {
  const eventNames = {
    PROPERTY_INQUIRY: "property_inquiry_success",
    BUYER_REQUIREMENT: "buyer_requirement_success",
    SITE_VISIT_REQUEST: "site_visit_request_success",
    GENERAL_CONTACT: "general_contact_success",
    SELLER_LEAD: "seller_lead_success",
  } as const;
  const pagePath =
    input.action === "PROPERTY_INQUIRY"
      ? `/properties/${input.propertySlug}`
      : input.action === "SITE_VISIT_REQUEST"
        ? "/site-visit"
        : input.action === "BUYER_REQUIREMENT"
          ? "/requirements"
          : input.action === "SELLER_LEAD"
            ? "/sell-your-land"
            : "/contact";
  const result = await client.from("analytics_events").insert({
    event_name: eventNames[input.action],
    page_path: pagePath,
    property_id: propertyId,
    source_channel: "WEBSITE",
    metadata: { intake_action: input.action },
  });
  if (result.error)
    console.error("public_intake_analytics_failed", { code: "DATABASE_INSERT_FAILED" });
}

export async function settlePostCommitIntakeEffects(
  effects: Readonly<{
    notification: () => Promise<void>;
    analytics: () => Promise<void>;
  }>,
) {
  try {
    await effects.notification();
  } catch {
    console.error("public_intake_notification_failed", { code: "SECONDARY_EFFECT_FAILED" });
  }
  try {
    await effects.analytics();
  } catch {
    console.error("public_intake_analytics_failed", { code: "SECONDARY_EFFECT_FAILED" });
  }
}

export async function submitPublicIntake(
  rawInput: PublicIntakeInput,
  context: PublicRequestContext,
): Promise<PublicIntakeResult> {
  const input = publicIntakeInputSchema.parse(rawInput);
  const environment = getServerEnvironment();
  const secret = hmacSecret();
  const client = createPrivilegedServerClient() as unknown as Db;
  const rateBucket = privacyHash(`${input.action}|${context.ipAddress || "unknown"}`, secret);
  if (!(await consumePublicRateLimit(client, input.action, rateBucket)))
    throw new PublicIntakeError("RATE_LIMITED");
  await verifyTurnstile(environment, {
    action: input.action,
    token: input.turnstileToken,
    idempotencyKey: input.idempotencyKey,
  });
  const idempotencyKeyHash = privacyHash(input.idempotencyKey, secret);
  const persisted = await persistPublicIntake(client, input, idempotencyKeyHash);

  let propertyReference: string | undefined;
  if (persisted.target_property_id) {
    const property = await client
      .from("properties")
      .select("property_code")
      .eq("id", persisted.target_property_id)
      .single();
    propertyReference = property.data?.property_code;
  }
  if (!persisted.replayed) {
    await settlePostCommitIntakeEffects({
      notification: async () => {
        const notification = await deliverAdminIntakeNotification(environment, {
          deliveryId: persisted.target_notification_id,
          action: input.action,
          propertyReference,
        });
        await recordNotificationResult(
          client,
          persisted.target_notification_id,
          notification.status,
          notification.errorCode,
        );
      },
      analytics: () => recordConversionAnalytics(client, input, persisted.target_property_id),
    });
  }
  return { replayed: persisted.replayed, propertyReference };
}

export async function recordPublicIntent(
  action: "CALL_CLICK" | "WHATSAPP_CLICK",
  propertyId: string,
  ipAddress: string,
) {
  const client = createPrivilegedServerClient() as unknown as Db;
  const bucket = privacyHash(`PUBLIC_INTENT|${ipAddress || "unknown"}`, hmacSecret());
  if (!(await consumePublicRateLimit(client, "PUBLIC_INTENT", bucket))) return;
  const result = await client.from("analytics_events").insert({
    event_name: action === "CALL_CLICK" ? "call_intent" : "whatsapp_intent",
    page_path: "/properties/[property-slug]",
    property_id: propertyId,
    source_channel: "WEBSITE",
    metadata: { intent: action },
  });
  if (result.error)
    console.error("public_intent_analytics_failed", { code: "DATABASE_INSERT_FAILED" });
}
