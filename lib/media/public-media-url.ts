import { buildGoogleDriveDownloadUrl } from "@/lib/media/google-drive";

const publicBucket = "property-media-public";

function encodeObjectPath(objectPath: string): string {
  return objectPath.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}

export function buildPublicMediaUrl(objectPath: string | null): string | null {
  return buildPublicBucketMediaUrl(publicBucket, objectPath);
}

export function buildPublicBucketMediaUrl(
  bucket: "property-media-public" | "guide-media-public",
  objectPath: string | null,
): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !objectPath || objectPath.includes("..")) return null;
  try {
    const url = new URL(base);
    url.pathname = `/storage/v1/object/public/${bucket}/${encodeObjectPath(objectPath)}`;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export function buildPublicBrochureUrl(
  brochure: Readonly<{
    objectPath: string | null;
    externalProvider?: string | null;
    externalMediaId?: string | null;
  }>,
): string | null {
  if (brochure.externalProvider === "GOOGLE_DRIVE") {
    return buildGoogleDriveDownloadUrl(brochure.externalMediaId);
  }
  return buildPublicMediaUrl(brochure.objectPath);
}
