// @vitest-environment node

import { describe, expect, it } from "vitest";

import { isNonProductionEnvironment, serverEnvironmentSchema } from "@/config/environment-schema";

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

  it("requires secure anti-abuse configuration in preview", () => {
    expect(() =>
      serverEnvironmentSchema.parse({
        ...validEnvironment,
        APP_ENV: "preview",
        NEXT_PUBLIC_SITE_URL: "https://deploy-preview-19--urbanedge.netlify.app",
        NEXT_PUBLIC_SUPABASE_URL: "https://staging.supabase.co",
      }),
    ).toThrow(/Turnstile|HMAC/);
  });

  it("rejects the production canonical host in preview", () => {
    expect(() =>
      serverEnvironmentSchema.parse({
        ...validEnvironment,
        APP_ENV: "preview",
        NEXT_PUBLIC_SITE_URL: "https://theurbanedgelandspace.com",
        NEXT_PUBLIC_SUPABASE_URL: "https://staging.supabase.co",
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: "staging-site-key",
        TURNSTILE_SECRET_KEY: "staging-secret-key",
        HMAC_SECRET: "staging-hmac-secret",
      }),
    ).toThrow(/must not use the production canonical hostname/);
  });

  it("requires the exact canonical origin and security controls in production", () => {
    const productionEnvironment = {
      ...validEnvironment,
      APP_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://theurbanedgelandspace.com",
      NEXT_PUBLIC_SUPABASE_URL: "https://production.supabase.co",
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "production-site-key",
      TURNSTILE_SECRET_KEY: "production-secret-key",
      HMAC_SECRET: "production-hmac-secret",
    };
    expect(serverEnvironmentSchema.parse(productionEnvironment)).toMatchObject(
      productionEnvironment,
    );
    expect(() =>
      serverEnvironmentSchema.parse({
        ...productionEnvironment,
        NEXT_PUBLIC_SITE_URL: "https://urbanedge-staging.netlify.app",
      }),
    ).toThrow(/canonical origin/);
  });

  it("rejects partial optional provider configuration", () => {
    expect(() =>
      serverEnvironmentSchema.parse({ ...validEnvironment, RESEND_API_KEY: "resend-key" }),
    ).toThrow(/sender, reply-to, and admin recipient/);
    expect(() =>
      serverEnvironmentSchema.parse({
        ...validEnvironment,
        NEXT_PUBLIC_MAP_PROVIDER: "OpenFreeMap",
      }),
    ).toThrow(/configured together/);
  });

  it("sanitizes accidental outer quotes and whitespace from environment values", () => {
    const parsed = serverEnvironmentSchema.parse({
      ...validEnvironment,
      NEXT_PUBLIC_SITE_URL: ' "http://localhost:3000" ',
      SUPABASE_SERVICE_ROLE_KEY: ' "synthetic-service-role-key" ',
    });
    expect(parsed.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
    expect(parsed.SUPABASE_SERVICE_ROLE_KEY).toBe("synthetic-service-role-key");
  });

  it("validates JWT project ref and role matching in deployed environments", () => {
    const makeJwt = (payload: object) =>
      "eyJhbGciOiJIUzI1NiJ9." + Buffer.from(JSON.stringify(payload)).toString("base64") + ".sig";

    const baseDeployed = {
      ...validEnvironment,
      APP_ENV: "preview" as const,
      NEXT_PUBLIC_SITE_URL: "https://preview.urbanedge.app",
      NEXT_PUBLIC_SUPABASE_URL: "https://staging-proj.supabase.co",
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "site-key",
      TURNSTILE_SECRET_KEY: "secret-key",
      HMAC_SECRET: "hmac-secret",
    };

    // Mismatched project ref
    expect(() =>
      serverEnvironmentSchema.parse({
        ...baseDeployed,
        SUPABASE_SERVICE_ROLE_KEY: makeJwt({
          iss: "supabase",
          ref: "wrong-project",
          role: "service_role",
        }),
      }),
    ).toThrow(
      /belongs to project 'wrong-project', but NEXT_PUBLIC_SUPABASE_URL is for 'staging-proj'/,
    );

    // Wrong role (e.g. anon key provided where service role is required)
    expect(() =>
      serverEnvironmentSchema.parse({
        ...baseDeployed,
        SUPABASE_SERVICE_ROLE_KEY: makeJwt({
          iss: "supabase",
          ref: "staging-proj",
          role: "anon",
        }),
      }),
    ).toThrow(/SUPABASE_SERVICE_ROLE_KEY role must be 'service_role', but got 'anon'/);

    // Valid matching service_role key
    expect(() =>
      serverEnvironmentSchema.parse({
        ...baseDeployed,
        SUPABASE_SERVICE_ROLE_KEY: makeJwt({
          iss: "supabase",
          ref: "staging-proj",
          role: "service_role",
        }),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: makeJwt({
          iss: "supabase",
          ref: "staging-proj",
          role: "anon",
        }),
      }),
    ).not.toThrow();
  });

  describe("isNonProductionEnvironment", () => {
    it("returns true for verified non-production environments (local, preview, test)", () => {
      expect(isNonProductionEnvironment("local")).toBe(true);
      expect(isNonProductionEnvironment("preview")).toBe(true);
      expect(isNonProductionEnvironment("test")).toBe(true);
    });

    it("returns false for production environment", () => {
      expect(isNonProductionEnvironment("production")).toBe(false);
    });

    it("fails closed (returns false) for unknown, undefined, or empty environments", () => {
      expect(isNonProductionEnvironment(undefined)).toBe(false);
      expect(isNonProductionEnvironment("")).toBe(false);
      expect(isNonProductionEnvironment("unknown")).toBe(false);
      expect(isNonProductionEnvironment("staging")).toBe(false); // Non-canonical alias fails closed
      expect(isNonProductionEnvironment("prod")).toBe(false);
    });
  });
});
