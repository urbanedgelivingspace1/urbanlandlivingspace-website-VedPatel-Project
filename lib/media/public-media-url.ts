const publicBucket = "property-media-public";

function encodeObjectPath(objectPath: string): string {
  return objectPath.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}

export function buildPublicMediaUrl(objectPath: string | null): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !objectPath || objectPath.includes("..")) return null;
  try {
    const url = new URL(base);
    url.pathname = `/storage/v1/object/public/${publicBucket}/${encodeObjectPath(objectPath)}`;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}
