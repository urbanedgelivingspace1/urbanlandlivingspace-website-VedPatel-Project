import {
  assertSafeTestEnvironment,
  type TestSafetyEnvironment,
} from "@/lib/testing/environment-safety";

export function requireSafeSupabaseTestTarget(environment: TestSafetyEnvironment): string {
  assertSafeTestEnvironment(environment);
  return environment.TEST_SUPABASE_PROJECT_REF as string;
}
