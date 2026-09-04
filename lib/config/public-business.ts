import type { Json } from "@/types/database";

export type PublicBusinessConfig = Readonly<{
  phone: string | null;
  whatsappNumber: string | null;
  email: string | null;
  officeAddress: string | null;
  livingSpaceUrl: string | null;
}>;

const emptyConfig: PublicBusinessConfig = {
  phone: null,
  whatsappNumber: null,
  email: null,
  officeAddress: null,
  livingSpaceUrl: null,
};

function asString(value: Json | undefined): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function resolvePublicBusinessConfig(
  settings: Readonly<Record<string, Json>>,
): PublicBusinessConfig {
  return {
    phone: asString(settings.public_phone),
    whatsappNumber: asString(settings.whatsapp_number),
    email: asString(settings.public_email),
    officeAddress: asString(settings.office_address),
    livingSpaceUrl: asString(settings.living_space_url),
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
  context?: Readonly<{ propertyCode: string; title: string }>,
): string | null {
  const number = normalizeTelephone(config.whatsappNumber)?.replace(/^\+/, "");
  if (!number) return null;
  const message = context
    ? `Hi UrbanEdge, I am interested in ${context.title} (Property ${context.propertyCode}).`
    : "Hi UrbanEdge, I would like help finding land in Ahmedabad or Gandhinagar.";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildTelephoneUrl(config: PublicBusinessConfig): string | null {
  const number = normalizeTelephone(config.phone);
  return number ? `tel:${number}` : null;
}
