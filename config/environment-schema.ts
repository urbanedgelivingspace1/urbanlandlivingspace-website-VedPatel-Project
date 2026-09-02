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
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_MAP_STYLE_URL: optionalUrl,
  NEXT_PUBLIC_MAP_PROVIDER: z.string().min(1).optional(),
  NEXT_PUBLIC_ANALYTICS_ENABLED: z.enum(["true", "false"]).optional(),
  HMAC_SECRET: z.string().min(1).optional(),
  WEBHOOK_SIGNING_SECRET: z.string().min(1).optional(),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;
