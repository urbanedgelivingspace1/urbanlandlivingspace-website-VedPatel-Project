import { describe, expect, it } from "vitest";

import {
  buildGoogleDriveDownloadUrl,
  extractGoogleDriveFileId,
  normalizeGoogleDriveShareUrl,
} from "@/lib/media/google-drive";
import { buildPublicBrochureUrl } from "@/lib/media/public-media-url";

const FILE_ID = "1AbCdEfGhIjKlMnOpQrStUvWxYz_12345";

describe("Google Drive brochure URLs", () => {
  it.each([
    [`https://drive.google.com/file/d/${FILE_ID}/view?usp=sharing`, FILE_ID],
    [`https://drive.google.com/file/d/${FILE_ID}/view`, FILE_ID],
    [`https://drive.google.com/file/u/0/d/${FILE_ID}/preview`, FILE_ID],
    [`https://drive.google.com/open?id=${FILE_ID}`, FILE_ID],
    [`https://drive.google.com/uc?export=download&id=${FILE_ID}`, FILE_ID],
  ])("extracts a file ID from an approved file URL", (value, expected) => {
    expect(extractGoogleDriveFileId(value)).toBe(expected);
  });

  it("stores a canonical share URL and builds the browser download URL centrally", () => {
    expect(normalizeGoogleDriveShareUrl(`https://drive.google.com/open?id=${FILE_ID}`)).toBe(
      `https://drive.google.com/file/d/${FILE_ID}/view`,
    );
    expect(buildGoogleDriveDownloadUrl(FILE_ID)).toBe(
      `https://drive.usercontent.google.com/download?export=download&confirm=t&id=${FILE_ID}`,
    );
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,hello",
    `https://example.com/file/d/${FILE_ID}/view`,
    `https://drive.google.com.evil.example/file/d/${FILE_ID}/view`,
    "https://drive.google.com/drive/folders/not-a-file",
    "https://drive.google.com/file/d/unsafe%2Fid/view",
    "not a URL",
  ])("rejects an unsafe or malformed URL: %s", (value) => {
    expect(extractGoogleDriveFileId(value)).toBeNull();
    expect(normalizeGoogleDriveShareUrl(value)).toBeNull();
  });

  it("supports both Drive and legacy hosted brochures", () => {
    expect(
      buildPublicBrochureUrl({
        objectPath: null,
        externalProvider: "GOOGLE_DRIVE",
        externalMediaId: FILE_ID,
      }),
    ).toBe(`https://drive.usercontent.google.com/download?export=download&confirm=t&id=${FILE_ID}`);

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://synthetic.supabase.co";
    expect(
      buildPublicBrochureUrl({
        objectPath: "properties/example/media/brochure.pdf",
        externalProvider: null,
        externalMediaId: null,
      }),
    ).toBe(
      "https://synthetic.supabase.co/storage/v1/object/public/property-media-public/properties/example/media/brochure.pdf",
    );
  });
});
