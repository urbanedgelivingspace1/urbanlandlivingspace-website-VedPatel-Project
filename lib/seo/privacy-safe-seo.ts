const unsafeClaimPatterns = [
  /fully verified/i,
  /clear title guaranteed/i,
  /legally approved/i,
  /government approved land/i,
  /guaranteed (?:returns?|appreciation|development)/i,
];

export function containsUnsafeSeoClaim(value: string): boolean {
  return unsafeClaimPatterns.some((pattern) => pattern.test(value));
}

export function safeSeoText(value: string | null | undefined, fallback: string): string {
  const normalized = value?.replace(/\s+/g, " ").trim();
  return normalized && !containsUnsafeSeoClaim(normalized) ? normalized : fallback;
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
