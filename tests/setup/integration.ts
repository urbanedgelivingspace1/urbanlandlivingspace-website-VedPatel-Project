import { assertSafeTestEnvironment } from "@/lib/testing/environment-safety";

export function setup(): void {
  assertSafeTestEnvironment({
    APP_ENV: process.env.APP_ENV,
    TEST_SUPABASE_PROJECT_REF: process.env.TEST_SUPABASE_PROJECT_REF,
    PRODUCTION_SUPABASE_PROJECT_REF: process.env.PRODUCTION_SUPABASE_PROJECT_REF,
    TEST_TARGET_URL: process.env.TEST_TARGET_URL,
    PRODUCTION_SITE_URL: process.env.PRODUCTION_SITE_URL,
    TEST_SAFETY_TOKEN: process.env.TEST_SAFETY_TOKEN,
  });
}
