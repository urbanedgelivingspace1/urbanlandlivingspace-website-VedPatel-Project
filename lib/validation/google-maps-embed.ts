const GOOGLE_MAPS_EMBED_ERROR =
  "Please paste a valid Google Maps Embed link or the iframe copied from Google Maps.";

export type GoogleMapsEmbedParseResult =
  Readonly<{ ok: true; url: string }> | Readonly<{ ok: false; error: string }>;

const GOOGLE_MAPS_HOSTS = new Set(["www.google.com", "maps.google.com"]);

function isValidCoordinate(latitude: number, longitude: number) {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

function decodeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#38;", "&")
    .replaceAll("&#x26;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'");
}

export function isSafeGoogleMapsEmbedUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const hasSafeOrigin =
      url.protocol === "https:" &&
      url.username === "" &&
      url.password === "" &&
      url.port === "" &&
      GOOGLE_MAPS_HOSTS.has(url.hostname) &&
      url.hash === "";
    const standardEmbed = url.pathname === "/maps/embed" || url.pathname.startsWith("/maps/embed/");
    const myMapsPathMatch = url.pathname.match(/^\/maps\/d\/(?:u\/\d+\/)?(embed|viewer|edit)$/);
    const myMapsEmbed = Boolean(myMapsPathMatch) && Boolean(url.searchParams.get("mid")?.trim());
    const officialEmbed = hasSafeOrigin && (standardEmbed || myMapsEmbed) && url.search.length > 1;
    if (officialEmbed) return true;

    if (!hasSafeOrigin || url.searchParams.get("output") !== "embed") {
      return false;
    }

    const coordinatePath = url.pathname.match(
      /^\/maps\/@(-?\d{1,2}(?:\.\d{1,7})?),(-?\d{1,3}(?:\.\d{1,7})?),(\d{1,2}(?:\.\d+)?)z$/,
    );
    if (coordinatePath) {
      const latitude = Number(coordinatePath[1]);
      const longitude = Number(coordinatePath[2]);
      const zoom = Number(coordinatePath[3]);
      return isValidCoordinate(latitude, longitude) && zoom >= 1 && zoom <= 22;
    }

    if (url.pathname !== "/maps") return false;

    const allowedParameters = new Set(["q", "z", "output"]);
    if ([...url.searchParams.keys()].some((key) => !allowedParameters.has(key))) return false;
    const coordinate = url.searchParams.get("q") ?? "";
    const zoom = Number(url.searchParams.get("z"));
    const match = coordinate.match(/^(-?\d{1,2}(?:\.\d{1,6})),(-?\d{1,3}(?:\.\d{1,6}))$/);
    if (!match || !Number.isFinite(zoom) || zoom < 1 || zoom > 18) return false;
    const latitude = Number(match[1]);
    const longitude = Number(match[2]);
    return isValidCoordinate(latitude, longitude);
  } catch {
    return false;
  }
}

export function parseGoogleMapsEmbedInput(input: string): GoogleMapsEmbedParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: GOOGLE_MAPS_EMBED_ERROR };

  let candidate = trimmed;
  if (trimmed.startsWith("<")) {
    const iframe = trimmed.match(/^<iframe\b(?<attributes>[^>]*?)(?:\/\s*>|>\s*<\/iframe>)$/is);
    if (!iframe?.groups?.attributes || /<script\b/i.test(trimmed)) {
      return { ok: false, error: GOOGLE_MAPS_EMBED_ERROR };
    }
    const source = iframe.groups.attributes.match(/\bsrc\s*=\s*(["'])(.*?)\1/is)?.[2];
    if (!source) {
      return {
        ok: false,
        error: "We couldn't find a Google Maps link in the pasted embed code.",
      };
    }
    candidate = decodeHtmlAttribute(source.trim());
  }

  try {
    const parsed = new URL(candidate);
    if (GOOGLE_MAPS_HOSTS.has(parsed.hostname)) {
      const myMapsMatch = parsed.pathname.match(/^\/maps\/d\/(?:u\/\d+\/)?(viewer|edit|embed)$/);
      const mid = parsed.searchParams.get("mid");
      if (myMapsMatch && mid?.trim()) {
        parsed.pathname = "/maps/d/embed";
        parsed.searchParams.delete("usp");
        candidate = parsed.toString();
      }
    }
  } catch {
    // If invalid URL candidate, fallback to validation below
  }

  if (!isSafeGoogleMapsEmbedUrl(candidate)) {
    try {
      const url = new URL(candidate);
      if (!GOOGLE_MAPS_HOSTS.has(url.hostname)) {
        return { ok: false, error: "Only Google Maps embed links are supported." };
      }
    } catch {
      // The generic message below is clearer than exposing URL parsing details.
    }
    return { ok: false, error: GOOGLE_MAPS_EMBED_ERROR };
  }

  return { ok: true, url: new URL(candidate).toString() };
}
