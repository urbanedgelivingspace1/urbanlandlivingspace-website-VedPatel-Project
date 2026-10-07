const GOOGLE_DRIVE_HOST = "drive.google.com";
const GOOGLE_DRIVE_FILE_ID = /^[A-Za-z0-9_-]{10,160}$/;

function parseGoogleDriveUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      url.hostname.toLowerCase() !== GOOGLE_DRIVE_HOST ||
      url.port ||
      url.username ||
      url.password
    ) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function validFileId(value: string | null | undefined): value is string {
  return Boolean(value && GOOGLE_DRIVE_FILE_ID.test(value));
}

export function extractGoogleDriveFileId(value: string): string | null {
  const url = parseGoogleDriveUrl(value);
  if (!url) return null;

  const filePathMatch = url.pathname.match(
    /^\/file\/(?:u\/\d+\/)?d\/([^/]+)(?:\/(?:view|preview))?\/?$/,
  );
  if (filePathMatch) {
    const fileId = filePathMatch[1];
    return validFileId(fileId) ? fileId : null;
  }

  if (url.pathname === "/open" || url.pathname === "/uc") {
    const fileId = url.searchParams.get("id");
    return validFileId(fileId) ? fileId : null;
  }

  return null;
}

export function normalizeGoogleDriveShareUrl(value: string): string | null {
  const fileId = extractGoogleDriveFileId(value);
  return fileId ? `https://${GOOGLE_DRIVE_HOST}/file/d/${fileId}/view` : null;
}

export function buildGoogleDriveDownloadUrl(fileId: string | null | undefined): string | null {
  if (!validFileId(fileId)) return null;
  const url = new URL(`https://${GOOGLE_DRIVE_HOST}/uc`);
  url.searchParams.set("export", "download");
  url.searchParams.set("id", fileId);
  return url.toString();
}
