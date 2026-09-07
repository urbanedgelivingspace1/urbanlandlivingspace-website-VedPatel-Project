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
        NEXT_PUBLIC_SITE_URL: "https://urbanedgelandspace.com",
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
      NEXT_PUBLIC_SITE_URL: "https://urbanedgelandspace.com",
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
});
