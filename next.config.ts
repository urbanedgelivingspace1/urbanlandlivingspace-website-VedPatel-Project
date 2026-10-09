import type { NextConfig } from "next";

import { buildSecurityHeaders } from "./config/security-headers";
import { serverEnvironmentSchema } from "./config/environment-schema";

function remotePatternFor(rawUrl: string | undefined) {
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    return {
      protocol: url.protocol.slice(0, -1) as "http" | "https",
      hostname: url.hostname,
      port: url.port,
      pathname: "/storage/v1/object/public/property-media-public/**",
      search: "",
    };
  } catch {
    return null;
  }
}

function guideRemotePatternFor(rawUrl: string | undefined) {
  const pattern = remotePatternFor(rawUrl);
  return pattern
    ? { ...pattern, pathname: "/storage/v1/object/public/guide-media-public/**" }
    : null;
}

function originFor(rawUrl: string | undefined) {
  if (!rawUrl) return null;

  try {
    return new URL(rawUrl).origin;
  } catch {
    return null;
  }
}

const mediaPattern = remotePatternFor(process.env.NEXT_PUBLIC_SUPABASE_URL);
const guideMediaPattern = guideRemotePatternFor(process.env.NEXT_PUBLIC_SUPABASE_URL);
const connectOrigins = [
  originFor(process.env.NEXT_PUBLIC_SUPABASE_URL),
  originFor(process.env.NEXT_PUBLIC_MAP_STYLE_URL),
].filter((value): value is string => Boolean(value));
const applicationEnvironment = process.env.APP_ENV;
const netlifyContext = process.env.CONTEXT;

if (applicationEnvironment === "preview" || applicationEnvironment === "production") {
  serverEnvironmentSchema.parse(process.env);
}
if (netlifyContext === "production" && applicationEnvironment !== "production") {
  throw new Error("Netlify production builds require APP_ENV=production.");
}
if (
  netlifyContext &&
  netlifyContext !== "production" &&
  netlifyContext !== "dev" &&
  applicationEnvironment === "production"
) {
  throw new Error("Netlify non-production deploy contexts must not use APP_ENV=production.");
}

const isLocalBuild = ["local", "test"].includes(process.env.APP_ENV ?? "");
const isPreviewDeployment =
  applicationEnvironment === "preview" ||
  Boolean(netlifyContext && netlifyContext !== "production" && netlifyContext !== "dev");
const isProduction = process.env.APP_ENV === "production";
const isDevelopment = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [mediaPattern, guideMediaPattern].filter(
      (pattern): pattern is NonNullable<typeof pattern> => Boolean(pattern),
    ),
    dangerouslyAllowLocalIP: isLocalBuild,
  },
  experimental: {
    serverActions: {
      // Five maximum-size property photos plus multipart overhead. The service also
      // enforces a stricter 50 MB aggregate batch limit after authentication.
      bodySizeLimit: "55mb",
    },
    staleTimes: {
      dynamic: 60,
      static: 180,
    },
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.theurbanedgelandspace.com" }],
        destination: "https://theurbanedgelandspace.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: buildSecurityHeaders({
          connectOrigins,
          isDevelopment,
          isPreviewDeployment,
          isProduction,
        }),
      },
    ];
  },
};

export default nextConfig;
