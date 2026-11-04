// @vitest-environment node

import sharp from "sharp";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

beforeAll(() => {
  Object.assign(process.env, {
    APP_ENV: "test",
    NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000",
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:55321",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "synthetic-anon",
    SUPABASE_SERVICE_ROLE_KEY: "synthetic-service",
  });
});

describe("M7 external media normalization", () => {
  it("canonicalizes equivalent YouTube URLs and labels drone media without hosting video", async () => {
    const { normalizeExternalMedia } = await import("@/server/storage/external-media");
    const normal = normalizeExternalMedia(
      "VIDEO",
      "https://youtu.be/AbCdEf12345?utm_source=synthetic",
    );
    const drone = normalizeExternalMedia(
      "DRONE_VIDEO",
      "https://www.youtube.com/watch?v=AbCdEf12345&feature=share",
    );
    expect(normal.canonicalUrl).toBe("https://www.youtube.com/watch?v=AbCdEf12345");
    expect(drone.canonicalUrl).toBe(normal.canonicalUrl);
    expect(drone.mediaSubtype).toBe("DRONE_VIDEO");
    expect(drone).not.toHaveProperty("storageBucket");
  });

  it("accepts only reviewed video/360 providers and rejects private coordinate URLs", async () => {
    const { normalizeExternalMedia, validatePublicMediaText } =
      await import("@/server/storage/external-media");
    expect(
      normalizeExternalMedia("PANORAMA_360", "https://my.matterport.com/show/?m=ABCDE12345"),
    ).toMatchObject({ provider: "MATTERPORT", mediaType: "PANORAMA_360" });
    expect(() => normalizeExternalMedia("VIDEO", "https://example.com/watch/AbCdEf12345")).toThrow(
      /YouTube and Vimeo/,
    );
    expect(() =>
      normalizeExternalMedia(
        "PANORAMA_360",
        "https://my.matterport.com/show/?m=ABCDE12345&latitude=23.022505",
      ),
    ).toThrow(/private location/);
    expect(() => normalizeExternalMedia("VIDEO", "javascript:alert(1)")).toThrow(/HTTPS/);
    expect(() => validatePublicMediaText("Parcel at 23.022505, 72.571365", null)).toThrow(
      /exact coordinates/,
    );
    expect(() => validatePublicMediaText("Owner: owner@example.test", null)).toThrow(
      /contact details/,
    );
    expect(() => validatePublicMediaText(null, "Call +91 98765 43210 for documents")).toThrow(
      /contact details/,
    );
  });
});

describe("M7 server-owned object paths", () => {
  it("uses only authorized entity IDs and random immutable object IDs", async () => {
    const {
      leadDocumentPath,
      propertyDocumentPath,
      propertyPrivateMediaPath,
      propertyPublicMediaPath,
      verificationDocumentPath,
    } = await import("@/server/storage/object-path");
    const propertyId = "20000000-0000-4000-8000-000000000001";
    const assetId = "30000000-0000-4000-8000-000000000001";
    expect(propertyPrivateMediaPath(propertyId, assetId, "webp")).toBe(
      `properties/${propertyId}/private-media/${assetId}.webp`,
    );
    expect(propertyPublicMediaPath(propertyId, "webp")).toMatch(
      new RegExp(`^properties/${propertyId}/media/[0-9a-f-]+\\.webp$`),
    );
    expect(verificationDocumentPath(propertyId, assetId, "pdf")).not.toMatch(
      /owner|survey|latitude/i,
    );
    expect(propertyDocumentPath(propertyId, assetId, "pdf")).toBe(
      `properties/${propertyId}/documents/${assetId}.pdf`,
    );
    expect(leadDocumentPath(propertyId, assetId, "pdf")).toBe(
      `leads/${propertyId}/documents/${assetId}.pdf`,
    );
  });
});

describe("M7 public image processing", () => {
  it("normalizes to WebP and strips private EXIF/GPS-shaped metadata", async () => {
    const canary = "PRIVATE_GPS_23.022505_72.571365";
    const input = await sharp({
      create: { width: 1200, height: 800, channels: 3, background: "#b8a16a" },
    })
      .jpeg()
      .withMetadata({ exif: { IFD0: { ImageDescription: canary } } })
      .toBuffer();
    expect(input.toString("latin1")).toContain(canary);
    const { normalizePublicPropertyImage } = await import("@/server/storage/image-processing");
    const output = await normalizePublicPropertyImage(
      new File([input], "owner-field.jpg", { type: "image/jpeg" }),
    );
    const metadata = await sharp(output.bytes).metadata();
    expect(output.mimeType).toBe("image/webp");
    expect(metadata.exif).toBeUndefined();
    expect(output.bytes.toString("latin1")).not.toContain(canary);
  });

  it("rejects MIME spoofing, unsupported content, and undersized gallery images", async () => {
    const { normalizePublicPropertyImage } = await import("@/server/storage/image-processing");
    const small = await sharp({
      create: { width: 100, height: 100, channels: 3, background: "white" },
    })
      .png()
      .toBuffer();
    await expect(
      normalizePublicPropertyImage(new File([small], "spoof.jpg", { type: "image/jpeg" })),
    ).rejects.toThrow(/does not match/);
    await expect(
      normalizePublicPropertyImage(
        new File([Buffer.from("<html>bad</html>")], "bad.jpg", { type: "image/jpeg" }),
      ),
    ).rejects.toThrow(/decoded safely/);
    await expect(
      normalizePublicPropertyImage(new File([small], "small.png", { type: "image/png" })),
    ).rejects.toThrow(/1200×800/);
  });
});

describe("M7 document validation", () => {
  const pdf = (extra = "") =>
    Buffer.from(
      `%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n2 0 obj << /Type /Page >> endobj\n${extra}\n%%EOF`,
    );

  it("accepts bounded passive PDFs and rejects active/malformed brochure content", async () => {
    const { validatePublicBrochure } = await import("@/server/storage/document-validation");
    await expect(
      validatePublicBrochure(new File([pdf()], "brochure.pdf", { type: "application/pdf" })),
    ).resolves.toMatchObject({ mimeType: "application/pdf", pageCount: 1 });
    await expect(
      validatePublicBrochure(
        new File([pdf("/JavaScript (alert)")], "active.pdf", { type: "application/pdf" }),
      ),
    ).rejects.toThrow(/active content/);
    await expect(
      validatePublicBrochure(
        new File([Buffer.from("not-a-pdf")], "fake.pdf", { type: "application/pdf" }),
      ),
    ).rejects.toThrow(/valid PDF/);
  });

  it("detects the standard malware test marker before any upload", async () => {
    const { scanDocumentForMalware } = await import("@/server/storage/document-validation");
    expect(await scanDocumentForMalware(Buffer.from("EICAR-STANDARD-ANTIVIRUS-TEST-FILE"))).toBe(
      "INFECTED",
    );
  });
});
