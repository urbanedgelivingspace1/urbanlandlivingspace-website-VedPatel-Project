const GOOGLE_MAPS_EMBED_ERROR =
  "Please paste a valid Google Maps Embed link or the iframe copied from Google Maps.";

export type GoogleMapsEmbedParseResult =
  Readonly<{ ok: true; url: string }> | Readonly<{ ok: false; error: string }>;

function decodeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#38;", "&")
    .replaceAll("&#x26;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

export function isSafeGoogleMapsEmbedUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.username === "" &&
      url.password === "" &&
      url.port === "" &&
      url.hostname === "www.google.com" &&
      (url.pathname === "/maps/embed" || url.pathname.startsWith("/maps/embed/")) &&
      url.search.length > 1 &&
      url.hash === ""
    );
  } catch {
    return false;
  }
}

export function parseGoogleMapsEmbedInput(input: string): GoogleMapsEmbedParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: GOOGLE_MAPS_EMBED_ERROR };

  let candidate = trimmed;
  if (trimmed.startsWith("<")) {
    if (!/^<iframe\b[^>]*>\s*<\/iframe>$/i.test(trimmed) || /<script\b/i.test(trimmed)) {
      return { ok: false, error: GOOGLE_MAPS_EMBED_ERROR };
    }
    const source = trimmed.match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2];
    if (!source) {
      return {
        ok: false,
        error: "We couldn't find a Google Maps link in the pasted embed code.",
      };
    }
    candidate = decodeHtmlAttribute(source.trim());
  }

  if (!isSafeGoogleMapsEmbedUrl(candidate)) {
    try {
      const url = new URL(candidate);
      if (url.hostname !== "www.google.com") {
        return { ok: false, error: "Only Google Maps embed links are supported." };
      }
    } catch {
      // The generic message below is clearer than exposing URL parsing details.
    }
    return { ok: false, error: GOOGLE_MAPS_EMBED_ERROR };
  }

  return { ok: true, url: new URL(candidate).toString() };
}
