import { z } from "zod";

import { parsePropertyVideo } from "@/lib/media/property-video";
import {
  driveVideoThumbnail,
  videoThumbnailUnavailable,
} from "@/server/media/drive-video-thumbnail";
import { createPublicServerClient } from "@/server/supabase/public";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return videoThumbnailUnavailable();
  }

  // The public view only exposes approved media from published, active properties.
  const { data, error } = await createPublicServerClient()
    .from("public_property_media")
    .select("external_url")
    .eq("id", id)
    .eq("media_type", "VIDEO")
    .eq("external_provider", "GOOGLE_DRIVE")
    .maybeSingle();
  const source = data?.external_url && parsePropertyVideo(data.external_url);
  if (error || !source || source.mediaId !== new URL(request.url).searchParams.get("file")) {
    return videoThumbnailUnavailable();
  }
  return driveVideoThumbnail(source);
}
