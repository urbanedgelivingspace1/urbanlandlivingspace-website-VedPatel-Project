import "server-only";

import sharp, { type Metadata } from "sharp";

import { MediaValidationError } from "@/features/media/domain/contracts";

const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const MAX_DIMENSION = 8192;
const MAX_PIXELS = 40_000_000;
const FORMAT_TO_MIME = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

export type ProcessedPublicImage = Readonly<{
  bytes: Buffer;
  mimeType: "image/webp";
  width: number;
  height: number;
}>;

export async function normalizePublicPropertyImage(file: File): Promise<ProcessedPublicImage> {
  if (file.size <= 0 || file.size > MAX_SOURCE_BYTES) {
    throw new MediaValidationError("Image must be between 1 byte and 10 MB.");
  }
  const source = Buffer.from(await file.arrayBuffer());
  let metadata: Metadata;
  try {
    metadata = await sharp(source, { failOn: "warning", limitInputPixels: MAX_PIXELS }).metadata();
  } catch {
    throw new MediaValidationError("The image could not be decoded safely.");
  }
  const detectedMime = metadata.format
    ? FORMAT_TO_MIME[metadata.format as keyof typeof FORMAT_TO_MIME]
    : undefined;
  if (!detectedMime) {
    throw new MediaValidationError("Only JPEG, PNG and WebP property images are supported.");
  }
  if (file.type && file.type !== detectedMime) {
    throw new MediaValidationError("The declared image type does not match the file content.");
  }
  if (!metadata.width || !metadata.height) {
    throw new MediaValidationError("The image dimensions could not be verified.");
  }
  if (
    metadata.width > MAX_DIMENSION ||
    metadata.height > MAX_DIMENSION ||
    metadata.width * metadata.height > MAX_PIXELS
  ) {
    throw new MediaValidationError("The image dimensions exceed the safe processing limit.");
  }
  const landscapeReady = metadata.width >= 1200 && metadata.height >= 800;
  const portraitReady = metadata.width >= 800 && metadata.height >= 1200;
  if (!landscapeReady && !portraitReady) {
    throw new MediaValidationError("Gallery images must be at least 1200×800 or 800×1200 pixels.");
  }

  try {
    const result = await sharp(source, { failOn: "warning", limitInputPixels: MAX_PIXELS })
      .rotate()
      .resize({ width: 2200, height: 2200, fit: "inside", withoutEnlargement: true })
      // sharp strips EXIF/XMP/IPTC by default because metadata is not retained.
      .webp({ quality: 82, effort: 5 })
      .toBuffer({ resolveWithObject: true });
    if (!result.info.width || !result.info.height) {
      throw new Error("missing output dimensions");
    }
    return {
      bytes: result.data,
      mimeType: "image/webp",
      width: result.info.width,
      height: result.info.height,
    };
  } catch (error) {
    if (error instanceof MediaValidationError) throw error;
    throw new MediaValidationError("The image could not be normalized safely.");
  }
}
