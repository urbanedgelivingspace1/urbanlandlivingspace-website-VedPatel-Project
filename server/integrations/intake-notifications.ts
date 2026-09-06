import "server-only";

import type { ServerEnvironment } from "@/config/environment-schema";
import type { PublicRateAction } from "@/features/intake/domain/contracts";

export type NotificationDeliveryResult = Readonly<{
  status: "SENT" | "FAILED" | "SKIPPED";
  errorCode?: string;
}>;

export async function deliverAdminIntakeNotification(
  environment: ServerEnvironment,
  notification: Readonly<{
    deliveryId: string;
    action: PublicRateAction;
    propertyReference?: string;
  }>,
  fetcher: typeof fetch = fetch,
): Promise<NotificationDeliveryResult> {
  if (
    !environment.RESEND_API_KEY ||
    !environment.EMAIL_FROM ||
    !environment.ADMIN_NOTIFICATION_EMAIL
  )
    return { status: "SKIPPED" };

  const context = notification.propertyReference
    ? `Property reference: ${notification.propertyReference}`
    : "No property was associated with this submission.";
  try {
    const response = await fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${environment.RESEND_API_KEY}`,
        "content-type": "application/json",
        "idempotency-key": `public-intake-${notification.deliveryId}`,
      },
      body: JSON.stringify({
        from: environment.EMAIL_FROM,
        to: [environment.ADMIN_NOTIFICATION_EMAIL],
        reply_to: environment.EMAIL_REPLY_TO,
        subject: `New UrbanEdge ${notification.action.toLowerCase().replaceAll("_", " ")}`,
        text: `A new website submission is available in the private CRM.\n${context}\nOpen the admin CRM to review private details and next actions.`,
      }),
      signal: AbortSignal.timeout(8_000),
    });
    return response.ok
      ? { status: "SENT" }
      : { status: "FAILED", errorCode: `HTTP_${response.status}` };
  } catch {
    return { status: "FAILED", errorCode: "PROVIDER_UNAVAILABLE" };
  }
}
