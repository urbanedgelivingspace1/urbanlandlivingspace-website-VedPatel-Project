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
    const officialEmbed =
      url.protocol === "https:" &&
      url.username === "" &&
      url.password === "" &&
      url.port === "" &&
      url.hostname === "www.google.com" &&
      (url.pathname === "/maps/embed" || url.pathname.startsWith("/maps/embed/")) &&
      url.search.length > 1 &&
      url.hash === "";
    if (officialEmbed) return true;

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      url.hostname !== "www.google.com" ||
      url.pathname !== "/maps" ||
      url.hash ||
      url.searchParams.get("output") !== "embed"
    ) {
      return false;
    }

    const allowedParameters = new Set(["q", "z", "output"]);
    if ([...url.searchParams.keys()].some((key) => !allowedParameters.has(key))) return false;
    const coordinate = url.searchParams.get("q") ?? "";
    const zoom = Number(url.searchParams.get("z"));
    const match = coordinate.match(/^(-?\d{1,2}(?:\.\d{1,6})),(-?\d{1,3}(?:\.\d{1,6}))$/);
    if (!match || !Number.isFinite(zoom) || zoom < 1 || zoom > 18) return false;
    const latitude = Number(match[1]);
    const longitude = Number(match[2]);
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  } catch {
    return false;
  }
}

export function buildGoogleMapsPublicPointEmbedUrl(
  point: Readonly<{ latitude: number; longitude: number }>,
  approximate: boolean,
): string | null {
  if (
    !Number.isFinite(point.latitude) ||
    !Number.isFinite(point.longitude) ||
    point.latitude < -90 ||
    point.latitude > 90 ||
    point.longitude < -180 ||
    point.longitude > 180
  ) {
    return null;
  }

  const url = new URL("https://www.google.com/maps");
  url.searchParams.set("q", `${point.latitude.toFixed(6)},${point.longitude.toFixed(6)}`);
  url.searchParams.set("z", approximate ? "11" : "15");
  url.searchParams.set("output", "embed");
  return url.toString();
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
