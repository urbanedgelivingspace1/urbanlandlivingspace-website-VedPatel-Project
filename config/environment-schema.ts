import { z } from "zod";

const optionalUrl = z.union([z.url(), z.literal("")]).optional();

export const serverEnvironmentSchema = z.object({
  APP_ENV: z.enum(["local", "preview", "production", "test"]),
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
  EMAIL_REPLY_TO: z.string().min(1).optional(),
  ADMIN_NOTIFICATION_EMAIL: z.email().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_MAP_STYLE_URL: optionalUrl,
  NEXT_PUBLIC_MAP_PROVIDER: z.string().min(1).optional(),
  NEXT_PUBLIC_ANALYTICS_ENABLED: z.enum(["true", "false"]).optional(),
  HMAC_SECRET: z.string().min(1).optional(),
  WEBHOOK_SIGNING_SECRET: z.string().min(1).optional(),
  STORAGE_PROPERTY_MEDIA_PUBLIC_BUCKET: z.string().min(1).default("property-media-public"),
  STORAGE_PROPERTY_MEDIA_PRIVATE_BUCKET: z.string().min(1).default("property-media-private"),
  STORAGE_VERIFICATION_DOCUMENTS_PRIVATE_BUCKET: z
    .string()
    .min(1)
    .default("verification-documents-private"),
  STORAGE_OWNER_SUBMISSIONS_PRIVATE_BUCKET: z.string().min(1).default("owner-submissions-private"),
  STORAGE_GUIDE_MEDIA_PUBLIC_BUCKET: z.string().min(1).default("guide-media-public"),
  STORAGE_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().min(60).max(300).default(120),
  MEDIA_STORAGE_BUDGET_BYTES: z.coerce.number().int().positive().default(1_073_741_824),
  MEDIA_STORAGE_WARNING_PERCENT: z.coerce.number().min(1).max(89).default(70),
  MEDIA_STORAGE_HARD_STOP_PERCENT: z.coerce.number().min(2).max(100).default(90),
  MALWARE_SCAN_ENDPOINT: z.url().optional(),
  MALWARE_SCAN_TOKEN: z.string().min(1).optional(),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;
