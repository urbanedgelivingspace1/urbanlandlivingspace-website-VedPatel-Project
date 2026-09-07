// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { serverEnvironmentSchema, type ServerEnvironment } from "@/config/environment-schema";
import {
  isTrustedOrigin,
  privacyHash,
  requestPayloadIsBounded,
  turnstileResponseIsValid,
} from "@/features/intake/domain/abuse";
import { parseRequirementPrefill, requirementHref } from "@/features/intake/domain/prefill";
import {
  buyerRequirementInputSchema,
  generalContactInputSchema,
  normalizeIndiaPhone,
  propertyInquiryInputSchema,
  siteVisitRequestInputSchema,
  visitWindowToUtc,
} from "@/features/intake/domain/validation";
import { emptySearchQuery } from "@/features/search/domain/search-query";

vi.mock("server-only", () => ({}));

const base = {
  name: "Synthetic Visitor",
  phone: "98765 43210",
  consent: true,
  privacyNoticeVersion: "M13-CONTACT-PLACEHOLDER-2026-09-05",
  idempotencyKey: "93000000-0000-4000-8000-000000000099",
};

const environment = (app: "local" | "production" = "local"): ServerEnvironment => {
  const local = serverEnvironmentSchema.parse({
    APP_ENV: "local",
    NEXT_PUBLIC_SITE_URL: "https://land.example",
    NEXT_PUBLIC_SUPABASE_URL: "https://synthetic.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
    SUPABASE_SERVICE_ROLE_KEY: "service",
  });
  return app === "production"
    ? {
        ...local,
        APP_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "https://urbanedgelandspace.com",
        HMAC_SECRET: "synthetic-production-hmac",
      }
    : local;
};

describe("M13 public demand domain", () => {
  it("normalizes valid Indian mobile formats and rejects unsupported numbers", () => {
    expect(normalizeIndiaPhone("98765 43210")).toBe("+919876543210");
    expect(normalizeIndiaPhone("+91-98765-43210")).toBe("+919876543210");
    expect(() => normalizeIndiaPhone("12345")).toThrow(/10-digit/);
  });

  it("normalizes inquiry contact while rejecting HTML and malformed property context", () => {
    expect(
      propertyInquiryInputSchema.parse({
        action: "PROPERTY_INQUIRY",
        ...base,
        email: "Visitor@Example.com",
        propertySlug: "published-land",
        preferredContact: "PHONE",
      }),
    ).toMatchObject({ phone: "+919876543210", email: "visitor@example.com" });
    expect(() =>
      propertyInquiryInputSchema.parse({
        action: "PROPERTY_INQUIRY",
        ...base,
        propertySlug: "PRIVATE/../record",
        preferredContact: "PHONE",
        message: "<script>alert(1)</script>",
      }),
    ).toThrow();
    expect(() =>
      propertyInquiryInputSchema.parse({
        action: "PROPERTY_INQUIRY",
        ...base,
        propertySlug: "published-land",
        preferredContact: "EMAIL",
      }),
    ).toThrow(/email address/i);
  });

  it("enforces buyer range and area-unit integrity", () => {
    expect(() =>
      buyerRequirementInputSchema.parse({
        action: "BUYER_REQUIREMENT",
        ...base,
        sourceContext: "SEARCH_ZERO",
        preferredTransaction: "BUY",
        landCategory: "NA",
        minimumArea: 10,
        maximumArea: 2,
      }),
    ).toThrow();
    expect(() =>
      buyerRequirementInputSchema.parse({
        action: "BUYER_REQUIREMENT",
        ...base,
        sourceContext: "DIRECT",
        preferredTransaction: "LEASE",
        landCategory: "INDUSTRIAL",
        minimumArea: 2,
      }),
    ).toThrow(/area unit/i);
  });

  it("converts India business windows to UTC and requires a future ordered visit", () => {
    expect(visitWindowToUtc("2099-01-02", "MORNING")).toEqual({
      requestedStartAt: "2099-01-02T03:30:00.000Z",
      requestedEndAt: "2099-01-02T06:30:00.000Z",
    });
    expect(
      siteVisitRequestInputSchema.parse({
        action: "SITE_VISIT_REQUEST",
        ...base,
        propertySlug: "published-land",
        ...visitWindowToUtc("2099-01-02", "AFTERNOON"),
      }),
    ).toMatchObject({ action: "SITE_VISIT_REQUEST" });
  });

  it("requires service consent and useful plain-text contact content", () => {
    expect(() =>
      generalContactInputSchema.parse({
        action: "GENERAL_CONTACT",
        ...base,
        consent: false,
        intendedUse: "Other",
        message: "Hello UrbanEdge",
      }),
    ).toThrow();
    expect(() =>
      generalContactInputSchema.parse({
        action: "GENERAL_CONTACT",
        ...base,
        intendedUse: "Other",
        message: "https://a.invalid https://b.invalid https://c.invalid",
      }),
    ).toThrow(/plain text/i);
  });

  it("creates stable non-reversible HMAC buckets", () => {
    const hash = privacyHash("203.0.113.4", "synthetic-secret");
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain("203.0.113.4");
    expect(hash).toBe(privacyHash("203.0.113.4", "synthetic-secret"));
  });

  it("requires exact trusted origins and bounded request bodies", () => {
    expect(isTrustedOrigin("https://land.example", "https://land.example/path")).toBe(true);
    expect(isTrustedOrigin("https://evil.example", "https://land.example")).toBe(false);
    expect(isTrustedOrigin("https://land.example", "https://land.example", "cross-site")).toBe(
      false,
    );
    const small = new FormData();
    small.set("message", "hello");
    expect(requestPayloadIsBounded(small)).toBe(true);
    small.set("message", "x".repeat(17_000));
    expect(requestPayloadIsBounded(small)).toBe(false);
  });

  it("validates Turnstile success, hostname, and action together", () => {
    expect(
      turnstileResponseIsValid(
        { success: true, hostname: "land.example", action: "property_inquiry" },
        "land.example",
        "property_inquiry",
      ),
    ).toBe(true);
    expect(
      turnstileResponseIsValid(
        { success: true, hostname: "other.example", action: "property_inquiry" },
        "land.example",
        "property_inquiry",
      ),
    ).toBe(false);
    expect(turnstileResponseIsValid({ success: true }, "land.example", "property_inquiry")).toBe(
      false,
    );
  });

  it("prefills only reusable public search concepts", () => {
    const prefill = parseRequirementPrefill(
      {
        source: "SEARCH_ZERO",
        category: "industrial",
        transaction: "lease",
        district: "ahmedabad",
        minArea: "2",
        areaUnit: "acre",
      },
      [
        {
          district_id: "93000000-0000-4000-8000-000000000001",
          district_name: "Ahmedabad",
          subdistrict_id: null,
          subdistrict_name: null,
          place_id: null,
          place_name: null,
          locality_id: null,
          locality_name: null,
          locality_slug: null,
          locality_is_indexable: false,
        },
      ],
      [
        {
          id: "93000000-0000-4000-8000-000000000002",
          code: "acre",
          display_name: "Acre",
          symbol: "ac",
          is_metric: false,
          is_local: false,
        },
      ],
    );
    expect(prefill).toMatchObject({
      sourceContext: "SEARCH_ZERO",
      transaction: "LEASE",
      category: "INDUSTRIAL",
      minimumArea: 2,
      areaUnitId: "93000000-0000-4000-8000-000000000002",
    });
  });

  it("builds a privacy-safe requirement URL without keyword or property identity", () => {
    const href = requirementHref(
      {
        ...emptySearchQuery(),
        keyword: "private free text",
        propertyId: "UE-LS-000123",
        category: "NA",
        transaction: "BUY",
        minimumPrice: 1_000_000,
      },
      "SEARCH_ZERO",
    );
    expect(href).toContain("category=na");
    expect(href).not.toContain("private");
    expect(href).not.toContain("UE-LS");
  });

  it("supports a local-only provider-disabled environment", async () => {
    const { verifyTurnstile } = await import("@/server/integrations/turnstile");
    await expect(
      verifyTurnstile(environment(), {
        action: "PROPERTY_INQUIRY",
        idempotencyKey: base.idempotencyKey,
      }),
    ).resolves.toBe("disabled-local");
  });

  it("fails closed when Turnstile is not configured outside local/test", async () => {
    const { verifyTurnstile } = await import("@/server/integrations/turnstile");
    await expect(
      verifyTurnstile(environment("production"), {
        action: "BUYER_REQUIREMENT",
        idempotencyKey: base.idempotencyKey,
      }),
    ).rejects.toMatchObject({ code: "BOT_CONFIGURATION_REQUIRED" });
  });

  it("accepts only a server-verified Turnstile action and hostname", async () => {
    const { verifyTurnstile } = await import("@/server/integrations/turnstile");
    const configured = serverEnvironmentSchema.parse({
      ...environment("production"),
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "site-key",
      TURNSTILE_SECRET_KEY: "secret-key",
    });
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          hostname: "urbanedgelandspace.com",
          action: "property_inquiry",
        }),
        { status: 200 },
      ),
    );
    await expect(
      verifyTurnstile(
        configured,
        {
          action: "PROPERTY_INQUIRY",
          token: "synthetic-token",
          idempotencyKey: base.idempotencyKey,
        },
        fetcher,
      ),
    ).resolves.toBe("verified");
    expect(String(fetcher.mock.calls[0]?.[1]?.body)).toContain("secret-key");
  });

  it("keeps notification delivery optional and reports provider failure", async () => {
    const { deliverAdminIntakeNotification } =
      await import("@/server/integrations/intake-notifications");
    await expect(
      deliverAdminIntakeNotification(environment(), {
        deliveryId: "delivery",
        action: "GENERAL_CONTACT",
      }),
    ).resolves.toEqual({ status: "SKIPPED" });
    const configured = serverEnvironmentSchema.parse({
      ...environment(),
      RESEND_API_KEY: "resend-key",
      EMAIL_FROM: "UrbanEdge <notifications@example.com>",
      EMAIL_REPLY_TO: "replies@example.com",
      ADMIN_NOTIFICATION_EMAIL: "admin@example.com",
    });
    await expect(
      deliverAdminIntakeNotification(
        configured,
        { deliveryId: "delivery", action: "PROPERTY_INQUIRY", propertyReference: "UE-LS-000123" },
        vi.fn<typeof fetch>().mockResolvedValue(new Response("failed", { status: 503 })),
      ),
    ).resolves.toEqual({ status: "FAILED", errorCode: "HTTP_503" });
  });
});
