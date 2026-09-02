export const EXPECTED_TEST_SAFETY_TOKEN = "urbanedge-landspace-synthetic-test-only";

export type TestSafetyEnvironment = Readonly<{
  APP_ENV?: string;
  TEST_SUPABASE_PROJECT_REF?: string;
  PRODUCTION_SUPABASE_PROJECT_REF?: string;
  TEST_TARGET_URL?: string;
  PRODUCTION_SITE_URL?: string;
  TEST_SAFETY_TOKEN?: string;
}>;

function required(value: string | undefined, name: keyof TestSafetyEnvironment): string {
  const normalized = value?.trim();
  if (!normalized) {
    throw new Error(`Refusing stateful tests: ${name} is required.`);
  }
  return normalized;
}

function canonicalOrigin(value: string, name: keyof TestSafetyEnvironment): string {
  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    throw new Error(`Refusing stateful tests: ${name} must be a valid absolute URL.`);
  }
}

export function assertSafeTestEnvironment(environment: TestSafetyEnvironment): void {
  if (environment.APP_ENV !== "test") {
    throw new Error("Refusing stateful tests: APP_ENV must equal test.");
  }

  const testProjectRef = required(
    environment.TEST_SUPABASE_PROJECT_REF,
    "TEST_SUPABASE_PROJECT_REF",
  );
  const productionProjectRef = required(
    environment.PRODUCTION_SUPABASE_PROJECT_REF,
    "PRODUCTION_SUPABASE_PROJECT_REF",
  );

  if (testProjectRef === productionProjectRef) {
    throw new Error("Refusing stateful tests: test and production Supabase references match.");
  }

  const testTargetOrigin = canonicalOrigin(
    required(environment.TEST_TARGET_URL, "TEST_TARGET_URL"),
    "TEST_TARGET_URL",
  );
  const productionOrigin = canonicalOrigin(
    required(environment.PRODUCTION_SITE_URL, "PRODUCTION_SITE_URL"),
    "PRODUCTION_SITE_URL",
  );

  if (testTargetOrigin === productionOrigin) {
    throw new Error("Refusing stateful tests: test target resolves to the production origin.");
  }

  if (environment.TEST_SAFETY_TOKEN !== EXPECTED_TEST_SAFETY_TOKEN) {
    throw new Error(
      "Refusing stateful tests: the explicit test safety token is missing or invalid.",
    );
  }
}
