import { describe, expect, it } from "vitest";

import { buildContentSecurityPolicy, buildSecurityHeaders } from "@/config/security-headers";

describe("M17 security headers", () => {
  it("builds a deny-by-default production CSP without unsafe evaluation", () => {
    const policy = buildContentSecurityPolicy({
      connectOrigins: ["https://project.supabase.co", "https://maps.example.com"],
      isDevelopment: false,
      isProduction: true,
    });

    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("https://challenges.cloudflare.com");
    expect(policy).toContain("https://project.supabase.co");
    expect(policy).toContain("upgrade-insecure-requests");
    expect(policy).not.toContain("'unsafe-eval'");
  });

  it("permits unsafe evaluation only for the local Next.js development runtime", () => {
    const policy = buildContentSecurityPolicy({
      connectOrigins: [],
      isDevelopment: true,
      isProduction: false,
    });
    expect(policy).toContain("'unsafe-eval'");
    expect(policy).not.toContain("upgrade-insecure-requests");
  });

  it("adds transport security only in production and noindex only on previews", () => {
    const production = buildSecurityHeaders({
      connectOrigins: [],
      isDevelopment: false,
      isPreviewDeployment: false,
      isProduction: true,
    });
    const preview = buildSecurityHeaders({
      connectOrigins: [],
      isDevelopment: false,
      isPreviewDeployment: true,
      isProduction: false,
    });

    expect(production).toContainEqual({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
    expect(preview).not.toContainEqual(
      expect.objectContaining({ key: "Strict-Transport-Security" }),
    );
    expect(preview).toContainEqual({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    expect(production.map(({ key }) => key)).toEqual(
      expect.arrayContaining([
        "Content-Security-Policy",
        "X-Content-Type-Options",
        "Referrer-Policy",
        "Permissions-Policy",
        "X-Frame-Options",
        "Cross-Origin-Opener-Policy",
      ]),
    );
  });
});
