export type SecurityHealthStatus = "READY" | "ATTENTION";

export type SecurityHealthCheck = Readonly<{
  key: string;
  label: string;
  status: SecurityHealthStatus;
  detail: string;
}>;

export type SecurityHealthSnapshot = Readonly<{
  checkedAt: string;
  environment: string;
  migration: string;
  overall: SecurityHealthStatus;
  checks: readonly SecurityHealthCheck[];
}>;

type SecurityHealthInput = Readonly<{
  checkedAt: string;
  environment: string;
  migration: string;
  databaseReachable: boolean;
  storageReachable: boolean;
  bucketConfigurationMatches: boolean;
  emailConfigured: boolean;
  turnstileConfigured: boolean;
  hmacConfigured: boolean;
  malwareScannerConfigured: boolean;
  analyticsEnabled: boolean;
  mapConfigured: boolean;
}>;

export function buildSecurityHealthSnapshot(input: SecurityHealthInput): SecurityHealthSnapshot {
  const requiredInProduction = input.environment === "production";
  const checks: SecurityHealthCheck[] = [
    {
      key: "database",
      label: "Database",
      status: input.databaseReachable ? "READY" : "ATTENTION",
      detail: input.databaseReachable
        ? "Privileged health query succeeded."
        : "Health query failed.",
    },
    {
      key: "storage",
      label: "Storage",
      status: input.storageReachable && input.bucketConfigurationMatches ? "READY" : "ATTENTION",
      detail:
        input.storageReachable && input.bucketConfigurationMatches
          ? "All configured buckets exist with the expected visibility."
          : "Storage is unreachable or a bucket visibility differs from configuration.",
    },
    {
      key: "request-integrity",
      label: "Request integrity",
      status: input.hmacConfigured ? "READY" : requiredInProduction ? "ATTENTION" : "READY",
      detail: input.hmacConfigured
        ? "HMAC-backed rate-limit and idempotency identities are configured."
        : "Local/test fallback only; production must provide HMAC_SECRET.",
    },
    {
      key: "turnstile",
      label: "Turnstile",
      status: input.turnstileConfigured ? "READY" : requiredInProduction ? "ATTENTION" : "READY",
      detail: input.turnstileConfigured
        ? "Site and server verification keys are both configured."
        : "Local/test bypass only; production must configure both keys.",
    },
    {
      key: "email",
      label: "Email notifications",
      status: input.emailConfigured ? "READY" : requiredInProduction ? "ATTENTION" : "READY",
      detail: input.emailConfigured
        ? "Provider, sender and admin destination are configured."
        : "Email delivery is not fully configured.",
    },
    {
      key: "malware-scanner",
      label: "Malware scanner",
      status: input.malwareScannerConfigured
        ? "READY"
        : requiredInProduction
          ? "ATTENTION"
          : "READY",
      detail: input.malwareScannerConfigured
        ? "Remote scanner endpoint and authentication are configured."
        : "Local/test scanning fallback only; production must configure the remote scanner.",
    },
    {
      key: "optional-integrations",
      label: "Optional public integrations",
      status: "READY",
      detail: `Analytics ${input.analyticsEnabled ? "enabled" : "disabled"}; map ${input.mapConfigured ? "configured" : "disabled"}.`,
    },
  ];

  return {
    checkedAt: input.checkedAt,
    environment: input.environment,
    migration: input.migration,
    overall: checks.some(({ status }) => status === "ATTENTION") ? "ATTENTION" : "READY",
    checks,
  };
}
