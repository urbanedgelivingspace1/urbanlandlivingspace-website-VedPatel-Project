import { describe, expect, it } from "vitest";

import { buildSecurityHealthSnapshot } from "@/features/admin/domain/security-health";

const healthy = {
  checkedAt: "2026-09-06T00:00:00.000Z",
  environment: "production",
  migration: "m17",
  databaseReachable: true,
  storageReachable: true,
  bucketConfigurationMatches: true,
  emailConfigured: true,
  turnstileConfigured: true,
  hmacConfigured: true,
  malwareScannerConfigured: true,
  analyticsEnabled: false,
  mapConfigured: true,
};

describe("M17 security health", () => {
  it("reports production ready only when mandatory controls are configured", () => {
    expect(buildSecurityHealthSnapshot(healthy).overall).toBe("READY");
    const degraded = buildSecurityHealthSnapshot({ ...healthy, turnstileConfigured: false });
    expect(degraded.overall).toBe("ATTENTION");
    expect(degraded.checks.find(({ key }) => key === "turnstile")?.detail).not.toContain("secret");
  });

  it("allows documented local fallbacks but never masks database or bucket failures", () => {
    expect(
      buildSecurityHealthSnapshot({
        ...healthy,
        environment: "local",
        turnstileConfigured: false,
        hmacConfigured: false,
        malwareScannerConfigured: false,
        emailConfigured: false,
      }).overall,
    ).toBe("READY");
    expect(
      buildSecurityHealthSnapshot({
        ...healthy,
        environment: "local",
        databaseReachable: false,
      }).overall,
    ).toBe("ATTENTION");
  });
});
