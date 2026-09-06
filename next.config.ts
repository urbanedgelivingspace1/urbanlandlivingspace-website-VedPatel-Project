import type { NextConfig } from "next";

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
const isLocalBuild = ["local", "test"].includes(process.env.APP_ENV ?? "");
const isPreviewDeployment = Boolean(
  process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production",
);

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
      bodySizeLimit: "22mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.urbanedgelandspace.com" }],
        destination: "https://urbanedgelandspace.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "base-uri 'self'",
              `connect-src 'self' ${connectOrigins.join(" ")}`.trim(),
              "frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com https://my.matterport.com",
              `img-src 'self' data: blob: ${connectOrigins.join(" ")}`.trim(),
              "object-src 'none'",
              "worker-src 'self' blob:",
            ].join("; "),
          },
          ...(isPreviewDeployment ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
        ],
      },
    ];
  },
};

export default nextConfig;
