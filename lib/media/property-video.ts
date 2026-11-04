export const MAX_PROPERTY_VIDEOS = 5;
export const propertyVideosEnabled = () =>
  process.env.NEXT_PUBLIC_PROPERTY_VIDEOS_ENABLED === "true";

export type VideoSource = Readonly<{
  provider: "GOOGLE_DRIVE" | "YOUTUBE";
  mediaId: string;
  resourceKey: string | null;
  canonicalUrl: string;
}>;

const driveId = /^[A-Za-z0-9_-]{10,160}$/;
const youtubeId = /^[A-Za-z0-9_-]{11}$/;
const resourceKeyPattern = /^[A-Za-z0-9_-]{1,200}$/;

export function parsePropertyVideo(value: string): VideoSource | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase();
    if (host === "drive.google.com") {
      const match = url.pathname.match(
        /^\/file\/(?:u\/\d+\/)?d\/([A-Za-z0-9_-]+)(?:\/(?:view|preview))?\/?$/,
      );
      const id = match?.[1] ?? (url.pathname === "/open" ? url.searchParams.get("id") : null);
      const key = url.searchParams.get("resourcekey");
      if (!id || !driveId.test(id) || (key !== null && !resourceKeyPattern.test(key))) return null;
      const canonical = new URL(`https://drive.google.com/file/d/${id}/view`);
      if (key) canonical.searchParams.set("resourcekey", key);
      return {
        provider: "GOOGLE_DRIVE",
        mediaId: id,
        resourceKey: key,
        canonicalUrl: canonical.toString(),
      };
    }
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.match(/^\/([A-Za-z0-9_-]+)\/?$/)?.[1] ?? null;
    if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "www.youtube-nocookie.com",
        "youtube-nocookie.com",
      ].includes(host)
    ) {
      id =
        url.pathname === "/watch"
          ? url.searchParams.get("v")
          : (url.pathname.match(/^\/(?:shorts|embed)\/([A-Za-z0-9_-]+)\/?$/)?.[1] ?? null);
    }
    return id && youtubeId.test(id)
      ? {
          provider: "YOUTUBE",
          mediaId: id,
          resourceKey: null,
          canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
        }
      : null;
  } catch {
    return null;
  }
}

export function videoPlaybackUrls(provider: string, mediaId: string, resourceKey?: string | null) {
  if (
    provider === "GOOGLE_DRIVE" &&
    driveId.test(mediaId) &&
    (!resourceKey || resourceKeyPattern.test(resourceKey))
  ) {
    const suffix = resourceKey ? `?resourcekey=${encodeURIComponent(resourceKey)}` : "";
    return {
      embed: `https://drive.google.com/file/d/${mediaId}/preview${suffix}`,
      external: `https://drive.google.com/file/d/${mediaId}/view${suffix}`,
    };
  }
  if (provider === "YOUTUBE" && youtubeId.test(mediaId))
    return {
      embed: `https://www.youtube-nocookie.com/embed/${mediaId}`,
      external: `https://www.youtube.com/watch?v=${mediaId}`,
    };
  if (provider === "VIMEO" && /^\d{6,12}$/.test(mediaId))
    return {
      embed: `https://player.vimeo.com/video/${mediaId}`,
      external: `https://vimeo.com/${mediaId}`,
    };
  if (provider === "MATTERPORT" && /^[A-Za-z0-9_-]{5,80}$/.test(mediaId))
    return {
      embed: `https://my.matterport.com/show/?m=${mediaId}&play=1`,
      external: `https://my.matterport.com/show/?m=${mediaId}`,
    };
  return null;
}
