import "server-only";

import type { VideoSource } from "@/lib/media/property-video";

const maxImageBytes = 2 * 1024 * 1024;
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export function videoThumbnailUnavailable(status = 404) {
  return new Response(null, { status, headers });
}

export async function driveVideoThumbnail(source: VideoSource): Promise<Response> {
  if (source.provider !== "GOOGLE_DRIVE") return videoThumbnailUnavailable();

  const url = new URL("https://drive.google.com/thumbnail");
  url.searchParams.set("id", source.mediaId);
  url.searchParams.set("sz", "w960");
  if (source.resourceKey) url.searchParams.set("resourcekey", source.resourceKey);

  const options = {
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.timeout(5000),
  } as const;

  try {
    let image = await fetch(url, options);
    if (image.status >= 300 && image.status < 400) {
      const location = image.headers.get("location");
      await image.body?.cancel();
      if (!location) return videoThumbnailUnavailable();
      const target = new URL(location);
      const imagePath = target.pathname.split("=")[0];
      if (
        target.protocol !== "https:" ||
        target.username ||
        target.password ||
        target.port ||
        !/^lh[3-6]\.googleusercontent\.com$/.test(target.hostname) ||
        imagePath !== `/d/${source.mediaId}`
      ) {
        return videoThumbnailUnavailable();
      }
      image = await fetch(target, options);
    }

    const type = image.headers.get("content-type")?.split(";")[0] ?? "";
    if (
      !image.ok ||
      !imageTypes.has(type) ||
      Number(image.headers.get("content-length")) > maxImageBytes ||
      !image.body
    ) {
      await image.body?.cancel();
      return videoThumbnailUnavailable();
    }

    const reader = image.body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxImageBytes) {
        await reader.cancel();
        return videoThumbnailUnavailable();
      }
      chunks.push(value);
    }
    if (!length) return videoThumbnailUnavailable();
    return new Response(Buffer.concat(chunks, length), {
      headers: { ...headers, "Content-Type": type },
    });
  } catch {
    return videoThumbnailUnavailable();
  }
}
