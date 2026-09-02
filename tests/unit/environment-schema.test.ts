// @vitest-environment node

import { describe, expect, it } from "vitest";

import { serverEnvironmentSchema } from "@/config/environment-schema";

const validEnvironment = {
  APP_ENV: "local",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "synthetic-local-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "synthetic-local-service-key",
};

describe("serverEnvironmentSchema", () => {
  it("accepts the required local configuration", () => {
    expect(serverEnvironmentSchema.parse(validEnvironment)).toMatchObject(validEnvironment);
  });

  it("rejects an invalid public site URL", () => {
    expect(() =>
      serverEnvironmentSchema.parse({ ...validEnvironment, NEXT_PUBLIC_SITE_URL: "not-a-url" }),
    ).toThrow();
  });

  it("rejects a missing service-role key", () => {
    const incompleteEnvironment: Partial<typeof validEnvironment> = { ...validEnvironment };
    delete incompleteEnvironment.SUPABASE_SERVICE_ROLE_KEY;
    expect(() => serverEnvironmentSchema.parse(incompleteEnvironment)).toThrow();
  });
});
