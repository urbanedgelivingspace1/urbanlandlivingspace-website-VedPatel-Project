import type { Json } from "@/types/database";

export type PublicBusinessConfig = Readonly<{
  phone: string | null;
  whatsappNumber: string | null;
  email: string | null;
  officeAddress: string | null;
  livingSpaceUrl: string | null;
}>;

export const OFFICIAL_PHONE_DISPLAY = "94086 63544";
export const OFFICIAL_PHONE_NUMBER = "+919408663544";
export const OFFICIAL_OFFICE_ADDRESS =
  "SANSKRUTI BY KAVYARATNA, 130, Randesan, Gandhinagar, Gujarat 382426";
export const OFFICIAL_OFFICE_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=23.182744531338862%2C72.64757700084525";
export const OFFICIAL_OFFICE_DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=23.182744531338862%2C72.64757700084525";
export const OFFICIAL_OFFICE_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d512.8504624219348!2d72.64757700084525!3d23.182744531338862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395c2bb7ee82b9d7%3A0xc1bad8b5160abdeb!2sURBANEDGE%20LIVING%20SPACE!5e0!3m2!1sen!2sin!4v1790835383866!5m2!1sen!2sin";

const emptyConfig: PublicBusinessConfig = {
  phone: OFFICIAL_PHONE_NUMBER,
  whatsappNumber: OFFICIAL_PHONE_NUMBER,
  email: null,
  officeAddress: OFFICIAL_OFFICE_ADDRESS,
  livingSpaceUrl: null,
};

function asString(value: Json | undefined): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asPublicEmail(value: Json | undefined): string | null {
  const candidate = asString(value)?.toLowerCase();
  return candidate && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) ? candidate : null;
}

export function normalizeExternalHttpsUrl(value: Json | undefined): string | null {
  const candidate = asString(value);
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function resolvePublicBusinessConfig(
  settings: Readonly<Record<string, Json>>,
): PublicBusinessConfig {
  return {
    phone: asString(settings.public_phone) ?? OFFICIAL_PHONE_NUMBER,
    whatsappNumber: asString(settings.whatsapp_number) ?? OFFICIAL_PHONE_NUMBER,
    email: asPublicEmail(settings.public_email),
    officeAddress: asString(settings.office_address) ?? OFFICIAL_OFFICE_ADDRESS,
    livingSpaceUrl: normalizeExternalHttpsUrl(settings.living_space_url),
  };
}

export function unavailablePublicBusinessConfig(): PublicBusinessConfig {
  return emptyConfig;
}

export function normalizeTelephone(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.replace(/[^+\d]/g, "");
  return /^\+?[1-9]\d{7,14}$/.test(normalized) ? normalized : null;
}

export function buildWhatsAppUrl(
  config: PublicBusinessConfig,
  context?: Readonly<{
    propertyCode: string;
    title: string;
    category?: string;
    location?: string;
  }>,
): string | null {
  const number = normalizeTelephone(config.whatsappNumber)?.replace(/^\+/, "");
  if (!number) return null;
  const message = context
    ? [
        "Hello UrbanEdge Land Space,",
        "",
        "I'm interested in:",
        "",
        `Property: ${context.title}`,
        `Property ID: ${context.propertyCode}`,
        ...(context.category ? [`Land Type: ${context.category}`] : []),
        ...(context.location ? [`Location: ${context.location}`] : []),
        "",
        "Please share more details.",
      ].join("\n")
    : "Hello UrbanEdge Land Space, I would like help finding land in Ahmedabad or Gandhinagar.";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildTelephoneUrl(config: PublicBusinessConfig): string | null {
  const number = normalizeTelephone(config.phone);
  return number ? `tel:${number}` : null;
}
