type DatabaseError = Readonly<{
  code?: string | null;
  message?: string | null;
}>;

const optionalGoogleMapsSchemaNames = [
  "google_maps_embed_url",
  "public_property_google_maps",
] as const;

const missingSchemaErrorCodes = new Set(["42P01", "42703", "PGRST204", "PGRST205"]);

/**
 * The Google Maps property field is deployed by an additive migration. During
 * a rolling release the application can briefly run before that migration is
 * present, so map-only reads must degrade to "no map" instead of taking the
 * entire property page down.
 */
export function isMissingOptionalGoogleMapsSchema(error: DatabaseError | null | undefined) {
  if (!error?.code || !missingSchemaErrorCodes.has(error.code)) return false;
  const message = error.message?.toLowerCase() ?? "";
  return optionalGoogleMapsSchemaNames.some((name) => message.includes(name));
}
