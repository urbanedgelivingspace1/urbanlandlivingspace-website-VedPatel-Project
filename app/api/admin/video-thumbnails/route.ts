import { z } from "zod";

import { parsePropertyVideo, propertyVideosEnabled } from "@/lib/media/property-video";
import { requireActiveAdmin } from "@/server/auth/authorization";
import {
  driveVideoThumbnail,
  videoThumbnailUnavailable,
} from "@/server/media/drive-video-thumbnail";

const preview = z.object({ url: z.string().max(2048) });

export async function POST(request: Request) {
  if (!propertyVideosEnabled()) return videoThumbnailUnavailable();
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json") {
    return videoThumbnailUnavailable(415);
  }
  try {
    await requireActiveAdmin();
  } catch {
    return videoThumbnailUnavailable(403);
  }

  const data = preview.safeParse(await request.json().catch(() => null));
  const source = data.success && parsePropertyVideo(data.data.url);
  return source ? driveVideoThumbnail(source) : videoThumbnailUnavailable();
}
