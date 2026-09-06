import { siteConfig } from "@/config/site";

const trackingParameters = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
]);

export function normalizeCanonicalPath(path: string): string {
  const url = new URL(path, siteConfig.defaultUrl);
  const normalizedPath = `/${url.pathname}`.replace(/\/+/g, "/").replace(/\/$/, "").toLowerCase();
  for (const key of [...url.searchParams.keys()])
    if (trackingParameters.has(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  const query = url.searchParams.toString();
  return `${normalizedPath === "" ? "/" : normalizedPath}${query ? `?${query}` : ""}`;
}

export function absoluteCanonical(path: string): string {
  return new URL(normalizeCanonicalPath(path), siteConfig.defaultUrl).toString();
}

export function approvedSameSitePath(value: string | null | undefined, fallback: string): string {
  if (!value) return normalizeCanonicalPath(fallback);
  try {
    const url = new URL(value, siteConfig.defaultUrl);
    if (url.origin !== siteConfig.defaultUrl || url.hash || url.search)
      return normalizeCanonicalPath(fallback);
    return normalizeCanonicalPath(url.pathname);
  } catch {
    return normalizeCanonicalPath(fallback);
  }
}
