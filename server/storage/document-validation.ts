import "server-only";

import sharp, { type Metadata } from "sharp";

import { MediaValidationError } from "@/features/media/domain/contracts";
import { getServerEnvironment } from "@/server/env";

const PDF_SIGNATURE = "%PDF-";
const EICAR_MARKER = "EICAR-STANDARD-ANTIVIRUS-TEST-FILE";
const ACTIVE_PDF_MARKERS = ["/JavaScript", "/JS", "/Launch", "/EmbeddedFile", "/RichMedia"];

export type ValidatedDocument = Readonly<{
  bytes: Buffer;
  mimeType: "application/pdf" | "image/jpeg" | "image/png";
  extension: "pdf" | "jpg" | "png";
  pageCount: number | null;
}>;

function safeOriginalName(name: string): string {
  return name.replaceAll(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 255) || "document";
}

export function normalizeOriginalFileName(name: string): string {
  return safeOriginalName(name);
}

export async function validatePrivateDocument(file: File): Promise<ValidatedDocument> {
  return validateDocument(file, 20 * 1024 * 1024, false);
}

export async function validatePublicBrochure(file: File): Promise<ValidatedDocument> {
  const result = await validateDocument(file, 15 * 1024 * 1024, true);
  if (result.mimeType !== "application/pdf") {
    throw new MediaValidationError("A public brochure must be a PDF.");
  }
  if ((result.pageCount ?? 0) > 40) {
    throw new MediaValidationError("A public brochure may contain at most 40 pages.");
  }
  return result;
}

async function validateDocument(file: File, maxBytes: number, brochure: boolean) {
  if (file.size <= 0 || file.size > maxBytes) {
    throw new MediaValidationError(
      `Document must be between 1 byte and ${Math.floor(maxBytes / 1024 / 1024)} MB.`,
    );
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const head = bytes.subarray(0, 8).toString("ascii");
  if (head.startsWith(PDF_SIGNATURE)) {
    if (file.type && file.type !== "application/pdf") {
      throw new MediaValidationError("The declared document type does not match the PDF content.");
    }
    const text = bytes.toString("latin1");
    if (!text.includes("%%EOF") || ACTIVE_PDF_MARKERS.some((marker) => text.includes(marker))) {
      throw new MediaValidationError(
        "The PDF is malformed or contains unsupported active content.",
      );
    }
    const pageCount = [...text.matchAll(/\/Type\s*\/Page\b/g)].length;
    if (pageCount < 1) throw new MediaValidationError("The PDF contains no readable pages.");
    return { bytes, mimeType: "application/pdf" as const, extension: "pdf" as const, pageCount };
  }
  if (brochure) throw new MediaValidationError("A public brochure must be a valid PDF.");

  let metadata: Metadata;
  try {
    metadata = await sharp(bytes, { failOn: "warning", limitInputPixels: 40_000_000 }).metadata();
  } catch {
    throw new MediaValidationError("Only valid PDF, JPEG or PNG private documents are supported.");
  }
  const detected: "image/jpeg" | "image/png" | null =
    metadata.format === "jpeg" ? "image/jpeg" : metadata.format === "png" ? "image/png" : null;
  if (!detected || (file.type && file.type !== detected)) {
    throw new MediaValidationError("The declared document type does not match the file content.");
  }
  return {
    bytes,
    mimeType: detected,
    extension: detected === "image/jpeg" ? ("jpg" as const) : ("png" as const),
    pageCount: null,
  };
}

export async function scanDocumentForMalware(bytes: Uint8Array) {
  const text = Buffer.from(bytes).toString("latin1");
  if (text.includes(EICAR_MARKER)) return "INFECTED" as const;
  const environment = getServerEnvironment();
  if (environment.MALWARE_SCAN_ENDPOINT) {
    try {
      const response = await fetch(environment.MALWARE_SCAN_ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/octet-stream",
          ...(environment.MALWARE_SCAN_TOKEN
            ? { authorization: `Bearer ${environment.MALWARE_SCAN_TOKEN}` }
            : {}),
        },
        body: Buffer.from(bytes),
        cache: "no-store",
      });
      if (!response.ok) return "FAILED" as const;
      const result = (await response.json()) as { status?: string };
      return result.status === "clean"
        ? ("CLEAN" as const)
        : result.status === "infected"
          ? ("INFECTED" as const)
          : ("FAILED" as const);
    } catch {
      return "FAILED" as const;
    }
  }
  // Local/test uses a deterministic EICAR denial fixture. Remote environments fail closed until
  // the approved scanner is configured; pending files cannot receive signed URLs or become evidence.
  return environment.APP_ENV === "local" || environment.APP_ENV === "test"
    ? ("CLEAN" as const)
    : ("PENDING" as const);
}
