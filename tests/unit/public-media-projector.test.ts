// @vitest-environment node

import { describe, expect, it } from "vitest";

import { projectPublicMedia } from "@/features/properties/queries/public-property-projector";
import type { PublicMediaRow } from "@/types/database";

const base: PublicMediaRow = {
  id: "30000000-0000-4000-8000-000000000001",
  property_id: "20000000-0000-4000-8000-000000000001",
  media_type: "IMAGE",
  object_path: "properties/synthetic/media/public.webp",
  mime_type: "image/webp",
  width_px: 1600,
  height_px: 1067,
  duration_seconds: null,
  alt_text: "Synthetic public image",
  caption: null,
  is_cover: true,
  sort_order: 10,
  external_url: null,
  external_provider: null,
  external_media_id: null,
  media_subtype: null,
};

describe("M7 public media DTO", () => {
  it("returns only the explicit public-safe hosted fields", () => {
    const dto = projectPublicMedia({
      ...base,
      storage_bucket: "PRIVATE_BUCKET_CANARY",
      checksum_sha256: "PRIVATE_CHECKSUM_CANARY",
      private_document_id: "PRIVATE_DOCUMENT_CANARY",
      exact_coordinates: "PRIVATE_COORDINATES_CANARY",
    } as PublicMediaRow);
    expect(dto.objectPath).toContain("public.webp");
    expect(JSON.stringify(dto)).not.toMatch(/PRIVATE_/);
  });

  it("supports approved provider metadata without a fake object path", () => {
    expect(
      projectPublicMedia({
        ...base,
        media_type: "VIDEO",
        object_path: null,
        mime_type: null,
        width_px: null,
        height_px: null,
        is_cover: false,
        external_url: "https://www.youtube.com/watch?v=AbCdEf12345",
        external_provider: "YOUTUBE",
        external_media_id: "AbCdEf12345",
        media_subtype: "DRONE_VIDEO",
      }),
    ).toMatchObject({
      objectPath: null,
      externalProvider: "YOUTUBE",
      mediaSubtype: "DRONE_VIDEO",
    });
  });

  it("projects a Google Drive brochure without exposing storage internals", () => {
    expect(
      projectPublicMedia({
        ...base,
        media_type: "BROCHURE",
        object_path: null,
        mime_type: null,
        width_px: null,
        height_px: null,
        is_cover: false,
        external_url: "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz_12345/view",
        external_provider: "GOOGLE_DRIVE",
        external_media_id: "1AbCdEfGhIjKlMnOpQrStUvWxYz_12345",
      }),
    ).toMatchObject({
      mediaType: "BROCHURE",
      objectPath: null,
      externalProvider: "GOOGLE_DRIVE",
      externalMediaId: "1AbCdEfGhIjKlMnOpQrStUvWxYz_12345",
    });
  });

  it("rejects a row with neither public locator", () => {
    expect(() =>
      projectPublicMedia({
        ...base,
        object_path: null,
        external_url: null,
        external_provider: null,
      }),
    ).toThrow(/no safe locator/);
  });
});
