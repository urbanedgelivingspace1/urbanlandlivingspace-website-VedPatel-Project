import "server-only";

import { MediaValidationError, type ExternalMediaKind } from "@/features/media/domain/contracts";

type ExternalMedia = Readonly<{
  mediaType: "VIDEO" | "PANORAMA_360";
  mediaSubtype: "STANDARD_VIDEO" | "DRONE_VIDEO" | "TOUR_360";
  sourceType: "YOUTUBE" | "VIMEO" | "OTHER_360_PROVIDER";
  provider: "YOUTUBE" | "VIMEO" | "MATTERPORT";
  mediaId: string;
  canonicalUrl: string;
}>;

const PRIVATE_LOCATION_PATTERN =
  /(?:lat(?:itude)?|lng|lon(?:gitude)?)[=/:%20+_-]*-?\d{1,3}(?:\.\d{3,})/i;

export function normalizeExternalMedia(kind: ExternalMediaKind, value: string): ExternalMedia {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new MediaValidationError("Enter a valid external media URL.", "externalUrl");
  }
  if (url.protocol !== "https:") {
    throw new MediaValidationError("External media URLs must use HTTPS.", "externalUrl");
  }
  url.hash = "";
  if (PRIVATE_LOCATION_PATTERN.test(url.toString())) {
    throw new MediaValidationError(
      "The media URL contains private location coordinates.",
      "externalUrl",
    );
  }

  if (kind === "PANORAMA_360") {
    if (url.hostname.toLowerCase() !== "my.matterport.com" || url.pathname !== "/show/") {
      throw new MediaValidationError(
        "Only reviewed Matterport 360 tour URLs are supported.",
        "externalUrl",
      );
    }
    const mediaId = url.searchParams.get("m");
    if (!mediaId || !/^[a-zA-Z0-9_-]{5,80}$/.test(mediaId)) {
      throw new MediaValidationError("The Matterport tour ID is invalid.", "externalUrl");
    }
    return {
      mediaType: "PANORAMA_360",
      mediaSubtype: "TOUR_360",
      sourceType: "OTHER_360_PROVIDER",
      provider: "MATTERPORT",
      mediaId,
      canonicalUrl: `https://my.matterport.com/show/?m=${encodeURIComponent(mediaId)}`,
    };
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  let provider: "YOUTUBE" | "VIMEO";
  let mediaId: string | null = null;
  if (host === "youtu.be") {
    provider = "YOUTUBE";
    mediaId = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (host === "youtube.com" || host === "m.youtube.com") {
    provider = "YOUTUBE";
    mediaId =
      url.pathname === "/watch"
        ? url.searchParams.get("v")
        : (url.pathname.match(/^\/shorts\/([^/]+)/)?.[1] ?? null);
  } else if (host === "vimeo.com" || host === "player.vimeo.com") {
    provider = "VIMEO";
    mediaId = url.pathname.split("/").filter(Boolean).at(-1) ?? null;
  } else {
    throw new MediaValidationError(
      "Only reviewed YouTube and Vimeo video URLs are supported.",
      "externalUrl",
    );
  }
  if (
    !mediaId ||
    (provider === "YOUTUBE" ? !/^[a-zA-Z0-9_-]{11}$/.test(mediaId) : !/^\d{6,12}$/.test(mediaId))
  ) {
    throw new MediaValidationError("The external video ID is invalid.", "externalUrl");
  }
  const canonicalUrl =
    provider === "YOUTUBE"
      ? `https://www.youtube.com/watch?v=${encodeURIComponent(mediaId)}`
      : `https://vimeo.com/${encodeURIComponent(mediaId)}`;
  return {
    mediaType: "VIDEO",
    mediaSubtype: kind === "DRONE_VIDEO" ? "DRONE_VIDEO" : "STANDARD_VIDEO",
    sourceType: provider,
    provider,
    mediaId,
    canonicalUrl,
  };
}

export function validatePublicMediaText(altText?: string | null, caption?: string | null) {
  const combined = `${altText ?? ""} ${caption ?? ""}`;
  if (/\b-?\d{1,2}\.\d{4,}\s*[,/]\s*-?\d{1,3}\.\d{4,}\b/.test(combined)) {
    throw new MediaValidationError(
      "Public media text must not contain exact coordinates.",
      "altText",
    );
  }
  if (
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(combined) ||
    /(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/.test(combined)
  ) {
    throw new MediaValidationError(
      "Public media text must not contain contact details.",
      "altText",
    );
  }
  if ((altText?.length ?? 0) > 220 || (caption?.length ?? 0) > 500) {
    throw new MediaValidationError("Media text exceeds the allowed length.", "altText");
  }
}
