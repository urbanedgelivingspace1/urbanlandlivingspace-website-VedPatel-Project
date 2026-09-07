import { z } from "zod";

const CANONICAL_PRODUCTION_ORIGIN = "https://urbanedgelandspace.com";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional());
const optionalEmail = z.preprocess(emptyToUndefined, z.email().optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.url().optional());

function addRequiredIssue(
  context: z.core.$RefinementCtx<Record<string, unknown>>,
  path: string,
  message: string,
) {
  context.addIssue({ code: "custom", path: [path], message });
}

export const serverEnvironmentSchema = z
  .object({
    APP_ENV: z.enum(["local", "preview", "production", "test"]),
    NEXT_PUBLIC_SITE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    RESEND_API_KEY: optionalString,
    EMAIL_FROM: optionalString,
    EMAIL_REPLY_TO: optionalString,
    ADMIN_NOTIFICATION_EMAIL: optionalEmail,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalString,
    TURNSTILE_SECRET_KEY: optionalString,
    NEXT_PUBLIC_MAP_STYLE_URL: optionalUrl,
    NEXT_PUBLIC_MAP_PROVIDER: optionalString,
    NEXT_PUBLIC_ANALYTICS_ENABLED: z.preprocess(
      emptyToUndefined,
      z.enum(["true", "false"]).optional(),
    ),
    HMAC_SECRET: optionalString,
    WEBHOOK_SIGNING_SECRET: optionalString,
    STORAGE_PROPERTY_MEDIA_PUBLIC_BUCKET: z.string().min(1).default("property-media-public"),
    STORAGE_PROPERTY_MEDIA_PRIVATE_BUCKET: z.string().min(1).default("property-media-private"),
    STORAGE_VERIFICATION_DOCUMENTS_PRIVATE_BUCKET: z
      .string()
      .min(1)
      .default("verification-documents-private"),
    STORAGE_OWNER_SUBMISSIONS_PRIVATE_BUCKET: z
      .string()
      .min(1)
      .default("owner-submissions-private"),
    STORAGE_GUIDE_MEDIA_PUBLIC_BUCKET: z.string().min(1).default("guide-media-public"),
    STORAGE_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().min(60).max(300).default(120),
    MEDIA_STORAGE_BUDGET_BYTES: z.coerce.number().int().positive().default(1_073_741_824),
    MEDIA_STORAGE_WARNING_PERCENT: z.coerce.number().min(1).max(89).default(70),
    MEDIA_STORAGE_HARD_STOP_PERCENT: z.coerce.number().min(2).max(100).default(90),
    MALWARE_SCAN_ENDPOINT: optionalUrl,
    MALWARE_SCAN_TOKEN: optionalString,
  })
  .superRefine((environment, context) => {
    const deployed = environment.APP_ENV === "preview" || environment.APP_ENV === "production";
    const siteUrl = new URL(environment.NEXT_PUBLIC_SITE_URL);
    const supabaseUrl = new URL(environment.NEXT_PUBLIC_SUPABASE_URL);

    if (deployed && siteUrl.protocol !== "https:") {
      addRequiredIssue(context, "NEXT_PUBLIC_SITE_URL", "Deployed environments require HTTPS.");
    }
    if (deployed && supabaseUrl.protocol !== "https:") {
      addRequiredIssue(
        context,
        "NEXT_PUBLIC_SUPABASE_URL",
        "Deployed environments require an HTTPS Supabase URL.",
      );
    }
    if (environment.APP_ENV === "production") {
      if (
        siteUrl.origin !== CANONICAL_PRODUCTION_ORIGIN ||
        siteUrl.pathname !== "/" ||
        siteUrl.search ||
        siteUrl.hash
      ) {
        addRequiredIssue(
          context,
          "NEXT_PUBLIC_SITE_URL",
          `Production must use the canonical origin ${CANONICAL_PRODUCTION_ORIGIN}.`,
        );
      }
    }
    if (
      environment.APP_ENV === "preview" &&
      ["urbanedgelandspace.com", "www.urbanedgelandspace.com"].includes(siteUrl.hostname)
    ) {
      addRequiredIssue(
        context,
        "NEXT_PUBLIC_SITE_URL",
        "Preview must not use the production canonical hostname.",
      );
    }

    const turnstileValues = [
      environment.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      environment.TURNSTILE_SECRET_KEY,
    ];
    if (turnstileValues.some(Boolean) && !turnstileValues.every(Boolean)) {
      addRequiredIssue(
        context,
        "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
        "Turnstile site and secret keys must be configured together.",
      );
    }
    if (deployed && !turnstileValues.every(Boolean)) {
      addRequiredIssue(
        context,
        "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
        "Preview and production require a complete Turnstile key pair.",
      );
    }
    if (deployed && !environment.HMAC_SECRET) {
      addRequiredIssue(
        context,
        "HMAC_SECRET",
        "Preview and production require a non-empty HMAC secret.",
      );
    }

    const emailValues = [
      environment.RESEND_API_KEY,
      environment.EMAIL_FROM,
      environment.EMAIL_REPLY_TO,
      environment.ADMIN_NOTIFICATION_EMAIL,
    ];
    if (emailValues.some(Boolean) && !emailValues.every(Boolean)) {
      addRequiredIssue(
        context,
        "RESEND_API_KEY",
        "Resend configuration must include API key, sender, reply-to, and admin recipient together.",
      );
    }

    const mapValues = [environment.NEXT_PUBLIC_MAP_STYLE_URL, environment.NEXT_PUBLIC_MAP_PROVIDER];
    if (mapValues.some(Boolean) && !mapValues.every(Boolean)) {
      addRequiredIssue(
        context,
        "NEXT_PUBLIC_MAP_STYLE_URL",
        "Map style URL and provider must be configured together.",
      );
    }
    if (deployed && environment.NEXT_PUBLIC_MAP_STYLE_URL) {
      const mapUrl = new URL(environment.NEXT_PUBLIC_MAP_STYLE_URL);
      if (mapUrl.protocol !== "https:") {
        addRequiredIssue(
          context,
          "NEXT_PUBLIC_MAP_STYLE_URL",
          "Deployed map styles must use HTTPS.",
        );
      }
    }
    if (
      environment.APP_ENV === "production" &&
      environment.NEXT_PUBLIC_MAP_STYLE_URL &&
      (environment.NEXT_PUBLIC_MAP_PROVIDER?.toLowerCase() !== "openfreemap" ||
        new URL(environment.NEXT_PUBLIC_MAP_STYLE_URL).hostname !== "tiles.openfreemap.org")
    ) {
      addRequiredIssue(
        context,
        "NEXT_PUBLIC_MAP_PROVIDER",
        "Production map configuration must use the architecture-approved OpenFreeMap provider.",
      );
    }

    if (
      deployed &&
      environment.MALWARE_SCAN_ENDPOINT &&
      new URL(environment.MALWARE_SCAN_ENDPOINT).protocol !== "https:"
    ) {
      addRequiredIssue(
        context,
        "MALWARE_SCAN_ENDPOINT",
        "Deployed malware scanner endpoints must use HTTPS.",
      );
    }
    if (environment.MALWARE_SCAN_TOKEN && !environment.MALWARE_SCAN_ENDPOINT) {
      addRequiredIssue(
        context,
        "MALWARE_SCAN_TOKEN",
        "A malware scanner token requires a scanner endpoint.",
      );
    }
  });

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;
