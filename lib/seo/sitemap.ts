export const staticIndexablePaths = [
  "/",
  "/properties",
  "/guides",
  "/about",
  "/contact",
  "/sell-your-land",
] as const;
export const staticNoindexPaths = [
  "/requirements",
  "/site-visit",
  "/search",
  "/terms",
  "/privacy",
  "/disclaimer",
] as const;

export function isSitemapEligiblePath(path: string): boolean {
  return (
    path.startsWith("/") &&
    !path.includes("?") &&
    !path.startsWith("/admin") &&
    !path.startsWith("/api") &&
    !staticNoindexPaths.includes(path as (typeof staticNoindexPaths)[number])
  );
}
