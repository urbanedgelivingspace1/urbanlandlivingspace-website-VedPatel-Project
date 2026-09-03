export type MediaFormState = Readonly<{
  ok: boolean;
  message: string;
  duplicate?: boolean;
  errors?: Readonly<Record<string, readonly string[]>>;
}>;

export type ExternalMediaKind = "VIDEO" | "DRONE_VIDEO" | "PANORAMA_360";

export type AdminMediaAssetDto = Readonly<{
  id: string;
  propertyId: string;
  mediaType:
    "IMAGE" | "VIDEO" | "PANORAMA_360" | "BROCHURE" | "DOCUMENT_PREVIEW" | "MAP_IMAGE" | "OTHER";
  mediaSubtype: string | null;
  sourceType: string;
  storageBucket: string | null;
  objectPath: string | null;
  externalUrl: string | null;
  externalProvider: string | null;
  externalMediaId: string | null;
  mimeType: string | null;
  fileSizeBytes: number | null;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  visibility: "PUBLIC" | "ADMIN_ONLY" | "PRIVATE";
  processingStatus: "READY" | "APPROVED" | "FAILED";
  isCover: boolean;
  sortOrder: number;
  approvedAt: string | null;
  archivedAt: string | null;
  previewUrl: string | null;
}>;

export type AdminPrivateDocumentDto = Readonly<{
  id: string;
  propertyId: string | null;
  documentType: string;
  mimeType: string;
  fileSizeBytes: number | null;
  originalFileName: string | null;
  pageCount: number | null;
  scanStatus: "PENDING" | "CLEAN" | "INFECTED" | "FAILED";
  createdAt: string;
  archivedAt: string | null;
}>;

export class MediaValidationError extends Error {
  readonly field: string;

  constructor(message: string, field = "file") {
    super(message);
    this.name = "MediaValidationError";
    this.field = field;
  }
}
