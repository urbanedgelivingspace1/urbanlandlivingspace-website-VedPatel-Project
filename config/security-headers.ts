export type SecurityHeader = Readonly<{ key: string; value: string }>;

type SecurityHeaderOptions = Readonly<{
  connectOrigins: readonly string[];
  isDevelopment: boolean;
  isPreviewDeployment: boolean;
  isProduction: boolean;
}>;

function sources(values: readonly string[]) {
  return [...new Set(values.filter(Boolean))].join(" ");
}

export function buildContentSecurityPolicy({
  connectOrigins,
  isDevelopment,
  isProduction,
}: Pick<SecurityHeaderOptions, "connectOrigins" | "isDevelopment" | "isProduction">) {
  const externalConnections = sources(connectOrigins);
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob:${externalConnections ? ` ${externalConnections}` : ""}`,
    "font-src 'self' data:",
    `connect-src 'self'${externalConnections ? ` ${externalConnections}` : ""} https://challenges.cloudflare.com`,
    "frame-src 'self' https://challenges.cloudflare.com https://www.youtube-nocookie.com https://player.vimeo.com https://my.matterport.com",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ];

  return directives.join("; ");
}

export function buildSecurityHeaders(options: SecurityHeaderOptions): SecurityHeader[] {
  return [
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(options),
    },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
    },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
    ...(options.isProduction
      ? [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ]
      : []),
    ...(options.isPreviewDeployment ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
  ];
}
