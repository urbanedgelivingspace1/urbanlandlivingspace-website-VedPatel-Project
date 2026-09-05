import { isClosedPublicAvailability } from "@/lib/formatting/property-values";
import { buildTelephoneUrl, buildWhatsAppUrl } from "@/lib/config/public-business";
import { loadPublicBusinessConfig, loadPublicProperty } from "@/server/queries/public-page-data";
import { recordPublicIntent } from "@/server/services/public-intake";

export async function GET(request: Request, { params }: { params: Promise<{ intent: string }> }) {
  const intent = (await params).intent;
  if (intent !== "call" && intent !== "whatsapp") return new Response("Not found", { status: 404 });
  const slug = new URL(request.url).searchParams.get("property");
  if (!slug) return new Response("Not found", { status: 404 });
  const [property, config] = await Promise.all([
    loadPublicProperty(slug),
    loadPublicBusinessConfig(),
  ]);
  if (!property || isClosedPublicAvailability(property.availability))
    return new Response("Not found", { status: 404 });
  const destination =
    intent === "call"
      ? buildTelephoneUrl(config)
      : buildWhatsAppUrl(config, { propertyCode: property.propertyCode, title: property.title });
  if (!destination) return new Response("Not found", { status: 404 });
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  try {
    await recordPublicIntent(
      intent === "call" ? "CALL_CLICK" : "WHATSAPP_CLICK",
      property.id,
      ipAddress,
    );
  } catch {
    console.error("public_intent_tracking_failed", { intent });
  }
  return new Response(null, {
    status: 302,
    headers: { location: destination, "cache-control": "no-store" },
  });
}
