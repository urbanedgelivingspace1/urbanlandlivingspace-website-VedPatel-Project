// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  assertSafeTestEnvironment,
  EXPECTED_TEST_SAFETY_TOKEN,
  type TestSafetyEnvironment,
} from "@/lib/testing/environment-safety";

const safeEnvironment: TestSafetyEnvironment = {
  APP_ENV: "test",
  TEST_SUPABASE_PROJECT_REF: "urbanedge-landspace-test",
  PRODUCTION_SUPABASE_PROJECT_REF: "urbanedge-landspace-production",
  TEST_TARGET_URL: "http://127.0.0.1:54321",
  PRODUCTION_SITE_URL: "https://urbanedgelandspace.com",
  TEST_SAFETY_TOKEN: EXPECTED_TEST_SAFETY_TOKEN,
};

describe("assertSafeTestEnvironment", () => {
  it("accepts an explicitly isolated synthetic test target", () => {
    expect(() => assertSafeTestEnvironment(safeEnvironment)).not.toThrow();
  });

  it.each([
    ["production APP_ENV", { APP_ENV: "production" }],
    [
      "matching Supabase project references",
      { TEST_SUPABASE_PROJECT_REF: safeEnvironment.PRODUCTION_SUPABASE_PROJECT_REF },
    ],
    ["the production origin", { TEST_TARGET_URL: safeEnvironment.PRODUCTION_SITE_URL }],
    ["a missing safety token", { TEST_SAFETY_TOKEN: undefined }],
  ])("rejects %s", (_scenario, override) => {
    expect(() => assertSafeTestEnvironment({ ...safeEnvironment, ...override })).toThrow(
      /Refusing stateful tests/,
    );
  });
});
