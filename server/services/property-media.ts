import "server-only";

import { randomUUID } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import type {
  AdminMediaAssetDto,
  AdminPrivateDocumentDto,
  BatchPhotoUploadResult,
  ExternalMediaKind,
} from "@/features/media/domain/contracts";
import { MediaValidationError } from "@/features/media/domain/contracts";
import { extractGoogleDriveFileId, normalizeGoogleDriveShareUrl } from "@/lib/media/google-drive";
import { requireActiveAdmin } from "@/server/auth/authorization";
import { getServerEnvironment } from "@/server/env";
import { createPrivilegedServerClient } from "@/server/supabase/privileged";
import { sha256 } from "@/server/storage/checksum";
import {
  normalizeOriginalFileName,
  scanDocumentForMalware,
  validatePrivateDocument,
  validatePublicBrochure,
} from "@/server/storage/document-validation";
import { normalizeExternalMedia, validatePublicMediaText } from "@/server/storage/external-media";
import { normalizePublicPropertyImage } from "@/server/storage/image-processing";
import {
  leadDocumentPath,
  propertyPrivateMediaPath,
  propertyDocumentPath,
  propertyPublicMediaPath,
} from "@/server/storage/object-path";
import { getStorageConfig } from "@/server/storage/config";
import type { Database, Json } from "@/types/database.generated";

type Db = SupabaseClient<Database>;
type MediaRow = Database["public"]["Tables"]["media_assets"]["Row"];
type DocumentRow = Pick<
  Database["public"]["Tables"]["private_documents"]["Row"],
  | "id"
  | "property_id"
  | "document_type"
  | "mime_type"
  | "file_size_bytes"
  | "original_file_name"
  | "page_count"
  | "scan_status"
  | "created_at"
  | "archived_at"
>;

const privilegedClient = () => createPrivilegedServerClient() as unknown as Db;
const propertyIdSchema = z.uuid();
const documentTypeSchema = z
  .enum([
    "LAND_RECORDS",
    "TITLE_DEED",
    "NA_ORDER_LAYOUT",
    "TP_ZONE_CERTIFICATE",
    "VILLAGE_MAP_DEMARCATION",
    "SOIL_WATER_ELECTRICITY",
    "OTHER",
    "OWNER_DOCUMENT",
    "LEGAL_DOCUMENT",
    "VERIFICATION_EVIDENCE",
  ])
  .default("OTHER");

const MAX_STAGED_IMAGES_PER_PROPERTY = 20;
const MAX_BATCH_IMAGES = 20;
const MAX_BATCH_SOURCE_BYTES = 50 * 1024 * 1024;
const MAX_ACTIVE_BROCHURES_PER_PROPERTY = 1;

async function storageHealthWithClient(client: Db) {
  const usage = await client.rpc("get_storage_usage_bytes");
  if (usage.error) throw usage.error;
  const usedBytes = usage.data ?? 0;
  const storage = getStorageConfig();
  const usagePercent = Math.min(100, (usedBytes / storage.budgetBytes) * 100);
  return {
    usedBytes,
    budgetBytes: storage.budgetBytes,
    usagePercent,
    warningPercent: storage.warningPercent,
    hardStopPercent: storage.hardStopPercent,
    state:
      usagePercent >= storage.hardStopPercent
        ? ("HARD_STOP" as const)
        : usagePercent >= storage.warningPercent
          ? ("WARNING" as const)
          : ("HEALTHY" as const),
  };
}

async function assertStorageCapacity(client: Db, additionalBytes: number) {
  const health = await storageHealthWithClient(client);
  const projectedPercent = ((health.usedBytes + additionalBytes) / health.budgetBytes) * 100;
  if (projectedPercent >= health.hardStopPercent) {
    throw new MediaValidationError("Media storage is at its configured hard-stop threshold.");
  }
}

async function ensureActiveProperty(client: Db, propertyId: string) {
  const id = propertyIdSchema.parse(propertyId);
  const { data, error } = await client
    .from("properties")
    .select("id")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new MediaValidationError("Property not found.", "propertyId");
  return id;
}

function toMediaDto(row: MediaRow, previewUrl: string | null): AdminMediaAssetDto {
  return {
    id: row.id,
    propertyId: row.property_id as string,
    mediaType: row.media_type,
    mediaSubtype: row.media_subtype,
    sourceType: row.source_type ?? "UNKNOWN",
    storageBucket: row.storage_bucket,
    objectPath: row.object_path,
    externalUrl: row.external_url,
    externalProvider: row.external_provider,
    externalMediaId: row.external_media_id,
    mimeType: row.mime_type,
    fileSizeBytes: row.file_size_bytes,
    width: row.width_px,
    height: row.height_px,
    altText: row.alt_text,
    caption: row.caption,
    visibility: row.visibility,
    processingStatus: row.processing_status,
    isCover: row.is_cover,
    sortOrder: row.sort_order,
    approvedAt: row.approved_at,
    archivedAt: row.archived_at,
    previewUrl,
  };
}

function toDocumentDto(row: DocumentRow): AdminPrivateDocumentDto {
  return {
    id: row.id,
    propertyId: row.property_id,
    documentType: row.document_type,
    mimeType: row.mime_type,
    fileSizeBytes: row.file_size_bytes,
    originalFileName: row.original_file_name,
    pageCount: row.page_count,
    scanStatus: row.scan_status,
    createdAt: row.created_at,
    archivedAt: row.archived_at,
  };
}

async function uploadRegisteredObject(
  client: Db,
  bucket: string,
  path: string,
  bytes: Uint8Array,
  mimeType: string,
  register: () => Promise<string>,
) {
  const upload = await client.storage.from(bucket).upload(path, bytes, {
    cacheControl: "3600",
    contentType: mimeType,
    upsert: false,
  });
  if (upload.error) throw new MediaValidationError("The file could not be stored. Try again.");
  try {
    return await register();
  } catch (error) {
    await client.storage.from(bucket).remove([path]);
    throw error;
  }
}

async function registerMedia(client: Db, actorId: string, payload: Json) {
  const { data, error } = await client.rpc("register_property_media", {
    requested_actor_id: actorId,
    requested_payload: payload,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function uploadPropertyImageWithClient(
  client: Db,
  actorId: string,
  propertyId: string,
  file: File,
  metadata: Readonly<{ altText?: string; caption?: string }> = {},
) {
  const id = await ensureActiveProperty(client, propertyId);
  validatePublicMediaText(metadata.altText, metadata.caption);
  const stagedCount = await client
    .from("media_assets")
    .select("id", { count: "exact", head: true })
    .eq("property_id", id)
    .eq("media_type", "IMAGE")
    .neq("processing_status", "APPROVED")
    .is("archived_at", null);
  if (stagedCount.error) throw stagedCount.error;
  if ((stagedCount.count ?? 0) >= MAX_STAGED_IMAGES_PER_PROPERTY) {
    throw new MediaValidationError("This property has reached the 20-image staging limit.");
  }
  const image = await normalizePublicPropertyImage(file);
  await assertStorageCapacity(client, image.bytes.byteLength);
  const checksum = sha256(image.bytes);
  const duplicate = await client
    .from("media_assets")
    .select("id")
    .eq("property_id", id)
    .eq("media_type", "IMAGE")
    .eq("checksum_sha256", checksum)
    .is("archived_at", null)
    .maybeSingle();
  if (duplicate.error) throw duplicate.error;
  if (duplicate.data) return { id: duplicate.data.id, duplicate: true } as const;

  const mediaId = randomUUID();
  const storage = getStorageConfig();
  const path = propertyPrivateMediaPath(id, mediaId, "webp");
  const registeredId = await uploadRegisteredObject(
    client,
    storage.buckets.propertyMediaPrivate,
    path,
    image.bytes,
    image.mimeType,
    () =>
      registerMedia(client, actorId, {
        id: mediaId,
        propertyId: id,
        mediaType: "IMAGE",
        storageBucket: storage.buckets.propertyMediaPrivate,
        objectPath: path,
        mimeType: image.mimeType,
        fileSizeBytes: image.bytes.byteLength,
        widthPx: image.width,
        heightPx: image.height,
        altText: metadata.altText?.trim() || null,
        caption: metadata.caption?.trim() || null,
        sourceType: "SUPABASE_UPLOAD",
        checksumSha256: checksum,
      }),
  );
  if (registeredId !== mediaId) {
    await client.storage.from(storage.buckets.propertyMediaPrivate).remove([path]);
    return { id: registeredId, duplicate: true } as const;
  }
  return { id: registeredId, duplicate: false } as const;
}

export async function uploadPropertyImage(
  propertyId: string,
  file: File,
  metadata?: Readonly<{ altText?: string; caption?: string }>,
) {
  const admin = await requireActiveAdmin();
  return uploadPropertyImageWithClient(
    privilegedClient(),
    admin.userId,
    propertyId,
    file,
    metadata,
  );
}

async function setPropertyCoverWithClient(
  client: Db,
  actorId: string,
  propertyId: string,
  mediaId: string,
) {
  const { error } = await client.rpc("set_property_cover", {
    requested_actor_id: actorId,
    requested_property_id: z.uuid().parse(propertyId),
    requested_media_id: z.uuid().parse(mediaId),
  });
  if (error) throw new Error(error.message);
}

export async function uploadPropertyImagesBatchWithClient(
  client: Db,
  actorId: string,
  propertyId: string,
  files: readonly File[],
): Promise<BatchPhotoUploadResult> {
  if (files.length === 0) {
    throw new MediaValidationError("Choose at least one property photo.");
  }
  if (files.length > MAX_BATCH_IMAGES) {
    throw new MediaValidationError(`Choose no more than ${MAX_BATCH_IMAGES} photos at once.`);
  }
  if (files.reduce((total, file) => total + file.size, 0) > MAX_BATCH_SOURCE_BYTES) {
    throw new MediaValidationError("The selected photo batch must be 50 MB or smaller.");
  }

  const id = await ensureActiveProperty(client, propertyId);
  const [propertyResult, imageCountResult, coverResult] = await Promise.all([
    client.from("properties").select("property_code,listing_title").eq("id", id).single(),
    client
      .from("media_assets")
      .select("id", { count: "exact", head: true })
      .eq("property_id", id)
      .eq("media_type", "IMAGE")
      .is("archived_at", null),
    client
      .from("media_assets")
      .select("id")
      .eq("property_id", id)
      .eq("media_type", "IMAGE")
      .eq("is_cover", true)
      .is("archived_at", null)
      .maybeSingle(),
  ]);
  if (propertyResult.error) throw propertyResult.error;
  if (imageCountResult.error) throw imageCountResult.error;
  if (coverResult.error) throw coverResult.error;

  const propertyLabel =
    propertyResult.data.listing_title?.trim() || propertyResult.data.property_code;
  let photoNumber = (imageCountResult.count ?? 0) + 1;
  let hasCover = Boolean(coverResult.data);
  const results: Array<BatchPhotoUploadResult["results"][number]> = [];

  for (const file of files) {
    const fileName = file.name.slice(0, 255) || "Property photo";
    try {
      const uploaded = await uploadPropertyImageWithClient(client, actorId, id, file, {
        altText: `${propertyLabel} - property photo ${photoNumber}`,
      });
      const registered = await client
        .from("media_assets")
        .select("alt_text,processing_status,is_cover")
        .eq("id", uploaded.id)
        .single();
      if (registered.error) throw registered.error;

      if (registered.data.processing_status === "READY") {
        if (!registered.data.alt_text) {
          const metadata = await client.rpc("update_property_media_metadata", {
            requested_actor_id: actorId,
            requested_media_id: uploaded.id,
            requested_alt_text: `${propertyLabel} - property photo ${photoNumber}`,
            requested_caption: "",
          });
          if (metadata.error) throw new Error(metadata.error.message);
        }
        await approvePropertyMediaWithClient(client, actorId, uploaded.id);
      }
      if (!hasCover) {
        await setPropertyCoverWithClient(client, actorId, id, uploaded.id);
        hasCover = true;
      }
      results.push({
        fileName,
        ok: true,
        duplicate: uploaded.duplicate,
        message: uploaded.duplicate ? "Already in the gallery." : "Added to the gallery.",
      });
      if (!uploaded.duplicate) photoNumber += 1;
    } catch (error) {
      results.push({
        fileName,
        ok: false,
        message:
          error instanceof MediaValidationError || error instanceof z.ZodError
            ? error.message
            : "This photo could not be processed. Try it again.",
      });
    }
  }

  const uploaded = results.filter((result) => result.ok).length;
  return {
    ok: uploaded === files.length,
    uploaded,
    results,
    message:
      uploaded === files.length
        ? `${uploaded} ${uploaded === 1 ? "photo" : "photos"} added to the gallery.`
        : `${uploaded} of ${files.length} photos were added. Review the results below.`,
  };
}

export async function uploadPropertyImagesBatch(propertyId: string, files: readonly File[]) {
  const admin = await requireActiveAdmin();
  return uploadPropertyImagesBatchWithClient(privilegedClient(), admin.userId, propertyId, files);
}

export async function uploadPropertyBrochureWithClient(
  client: Db,
  actorId: string,
  propertyId: string,
  file: File,
) {
  const id = await ensureActiveProperty(client, propertyId);
  const brochureCount = await client
    .from("media_assets")
    .select("id", { count: "exact", head: true })
    .eq("property_id", id)
    .eq("media_type", "BROCHURE")
    .is("archived_at", null);
  if (brochureCount.error) throw brochureCount.error;
  if ((brochureCount.count ?? 0) >= MAX_ACTIVE_BROCHURES_PER_PROPERTY) {
    throw new MediaValidationError("Archive the active brochure before uploading a replacement.");
  }
  const document = await validatePublicBrochure(file);
  const scanStatus = await scanDocumentForMalware(document.bytes);
  if (scanStatus === "INFECTED" || scanStatus === "FAILED") {
    throw new MediaValidationError("The brochure failed the security scan and was not stored.");
  }
  const checksum = sha256(document.bytes);
  await assertStorageCapacity(client, document.bytes.byteLength);
  const existing = await client
    .from("media_assets")
    .select("id")
    .eq("property_id", id)
    .eq("media_type", "BROCHURE")
    .eq("checksum_sha256", checksum)
    .is("archived_at", null)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return { id: existing.data.id, duplicate: true } as const;
  const mediaId = randomUUID();
  const storage = getStorageConfig();
  const path = propertyPrivateMediaPath(id, mediaId, "pdf");
  const registeredId = await uploadRegisteredObject(
    client,
    storage.buckets.propertyMediaPrivate,
    path,
    document.bytes,
    document.mimeType,
    () =>
      registerMedia(client, actorId, {
        id: mediaId,
        propertyId: id,
        mediaType: "BROCHURE",
        storageBucket: storage.buckets.propertyMediaPrivate,
        objectPath: path,
        mimeType: document.mimeType,
        fileSizeBytes: document.bytes.byteLength,
        sourceType: "SUPABASE_UPLOAD",
        checksumSha256: checksum,
        scanStatus,
      }),
  );
  if (registeredId !== mediaId) {
    await client.storage.from(storage.buckets.propertyMediaPrivate).remove([path]);
    return { id: registeredId, duplicate: true } as const;
  }
  return { id: registeredId, duplicate: false } as const;
}

export async function uploadPropertyBrochure(propertyId: string, file: File) {
  const admin = await requireActiveAdmin();
  return uploadPropertyBrochureWithClient(privilegedClient(), admin.userId, propertyId, file);
}

export async function saveGoogleDriveBrochureWithClient(
  client: Db,
  actorId: string,
  propertyId: string,
  rawUrl: string,
) {
  const id = await ensureActiveProperty(client, propertyId);
  const fileId = extractGoogleDriveFileId(rawUrl);
  const canonicalUrl = normalizeGoogleDriveShareUrl(rawUrl);
  if (!fileId || !canonicalUrl) {
    throw new MediaValidationError(
      "Paste a valid Google Drive file link. Folder links and links from other websites are not accepted.",
      "brochureUrl",
    );
  }

  const current = await client
    .from("media_assets")
    .select("id,external_provider,external_media_id,processing_status")
    .eq("property_id", id)
    .eq("media_type", "BROCHURE")
    .is("archived_at", null)
    .maybeSingle();
  if (current.error) throw current.error;
  if (
    current.data?.external_provider === "GOOGLE_DRIVE" &&
    current.data.external_media_id === fileId
  ) {
    if (current.data.processing_status === "READY") {
      await approvePropertyMediaWithClient(client, actorId, current.data.id);
    }
    return { id: current.data.id, duplicate: true, replaced: false } as const;
  }

  const previousId = current.data?.id ?? null;
  let newId: string | null = null;
  if (previousId) {
    const archived = await client.rpc("archive_property_media", {
      requested_actor_id: actorId,
      requested_media_id: previousId,
    });
    if (archived.error) throw new Error(archived.error.message);
  }

  try {
    const mediaId = randomUUID();
    newId = await registerMedia(client, actorId, {
      id: mediaId,
      propertyId: id,
      mediaType: "BROCHURE",
      sourceType: "GOOGLE_DRIVE",
      externalUrl: canonicalUrl,
      externalProvider: "GOOGLE_DRIVE",
      externalMediaId: fileId,
    });
    await approvePropertyMediaWithClient(client, actorId, newId);
    return { id: newId, duplicate: newId !== mediaId, replaced: Boolean(previousId) } as const;
  } catch (error) {
    if (newId) {
      await client.rpc("archive_property_media", {
        requested_actor_id: actorId,
        requested_media_id: newId,
      });
    }
    if (previousId) {
      await client.rpc("restore_property_media", {
        requested_actor_id: actorId,
        requested_media_id: previousId,
      });
    }
    throw error;
  }
}

export async function saveGoogleDriveBrochure(propertyId: string, rawUrl: string) {
  const admin = await requireActiveAdmin();
  return saveGoogleDriveBrochureWithClient(privilegedClient(), admin.userId, propertyId, rawUrl);
}

export async function addExternalPropertyMediaWithClient(
  client: Db,
  actorId: string,
  propertyId: string,
  kind: ExternalMediaKind,
  rawUrl: string,
  metadata: Readonly<{ caption?: string }> = {},
) {
  const id = await ensureActiveProperty(client, propertyId);
  validatePublicMediaText(null, metadata.caption);
  const external = normalizeExternalMedia(kind, rawUrl);
  const mediaId = randomUUID();
  const registeredId = await registerMedia(client, actorId, {
    id: mediaId,
    propertyId: id,
    mediaType: external.mediaType,
    mediaSubtype: external.mediaSubtype,
    sourceType: external.sourceType,
    externalUrl: external.canonicalUrl,
    externalProvider: external.provider,
    externalMediaId: external.mediaId,
    caption: metadata.caption?.trim() || null,
  });
  return { id: registeredId, duplicate: registeredId !== mediaId } as const;
}

export async function addExternalPropertyMedia(
  propertyId: string,
  kind: ExternalMediaKind,
  rawUrl: string,
  metadata?: Readonly<{ caption?: string }>,
) {
  const admin = await requireActiveAdmin();
  return addExternalPropertyMediaWithClient(
    privilegedClient(),
    admin.userId,
    propertyId,
    kind,
    rawUrl,
    metadata,
  );
}

export async function uploadPrivatePropertyDocumentWithClient(
  client: Db,
  actorId: string,
  propertyId: string,
  documentType: string,
  file: File,
) {
  const id = await ensureActiveProperty(client, propertyId);
  const controlledType = documentTypeSchema.parse(documentType);
  const document = await validatePrivateDocument(file);
  const scanStatus = await scanDocumentForMalware(document.bytes);
  if (scanStatus === "INFECTED" || scanStatus === "FAILED") {
    throw new MediaValidationError("The document failed the security scan and was not stored.");
  }
  const checksum = sha256(document.bytes);
  await assertStorageCapacity(client, document.bytes.byteLength);
  const existing = await client
    .from("private_documents")
    .select("id")
    .eq("property_id", id)
    .eq("document_type", controlledType)
    .eq("checksum_sha256", checksum)
    .is("archived_at", null)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return { id: existing.data.id, duplicate: true, scanStatus } as const;
  const documentId = randomUUID();
  const storage = getStorageConfig();
  const path = propertyDocumentPath(id, documentId, document.extension);
  const registeredId = await uploadRegisteredObject(
    client,
    storage.buckets.verificationDocumentsPrivate,
    path,
    document.bytes,
    document.mimeType,
    async () => {
      const { data, error } = await client.rpc("register_private_document", {
        requested_actor_id: actorId,
        requested_payload: {
          id: documentId,
          propertyId: id,
          documentType: controlledType,
          objectPath: path,
          mimeType: document.mimeType,
          fileSizeBytes: document.bytes.byteLength,
          checksumSha256: checksum,
          originalFileName: normalizeOriginalFileName(file.name),
          pageCount: document.pageCount,
          scanStatus,
        },
      });
      if (error) throw new Error(error.message);
      return data;
    },
  );
  if (registeredId !== documentId) {
    await client.storage.from(storage.buckets.verificationDocumentsPrivate).remove([path]);
    return { id: registeredId, duplicate: true, scanStatus } as const;
  }
  return { id: registeredId, duplicate: false, scanStatus } as const;
}

export async function uploadPrivatePropertyDocument(
  propertyId: string,
  documentType: string,
  file: File,
) {
  const admin = await requireActiveAdmin();
  return uploadPrivatePropertyDocumentWithClient(
    privilegedClient(),
    admin.userId,
    propertyId,
    documentType,
    file,
  );
}

export async function uploadPrivateLeadDocument(leadId: string, documentType: string, file: File) {
  const admin = await requireActiveAdmin();
  const client = privilegedClient();
  const targetLeadId = z.uuid().parse(leadId);
  const controlledType = documentTypeSchema.parse(documentType);
  const lead = await client
    .from("leads")
    .select("id")
    .eq("id", targetLeadId)
    .is("archived_at", null)
    .maybeSingle();
  if (lead.error) throw lead.error;
  if (!lead.data) throw new MediaValidationError("Lead not found.", "leadId");

  const document = await validatePrivateDocument(file);
  const scanStatus = await scanDocumentForMalware(document.bytes);
  if (scanStatus === "INFECTED" || scanStatus === "FAILED") {
    throw new MediaValidationError("The document failed the security scan and was not stored.");
  }
  await assertStorageCapacity(client, document.bytes.byteLength);
  const checksum = sha256(document.bytes);
  const documentId = randomUUID();
  const storage = getStorageConfig();
  const path = leadDocumentPath(targetLeadId, documentId, document.extension);
  const registeredId = await uploadRegisteredObject(
    client,
    storage.buckets.verificationDocumentsPrivate,
    path,
    document.bytes,
    document.mimeType,
    async () => {
      const { data, error } = await client.rpc("register_lead_private_document", {
        requested_actor_id: admin.userId,
        requested_payload: {
          id: documentId,
          leadId: targetLeadId,
          documentType: controlledType,
          objectPath: path,
          mimeType: document.mimeType,
          fileSizeBytes: document.bytes.byteLength,
          checksumSha256: checksum,
          originalFileName: normalizeOriginalFileName(file.name),
          pageCount: document.pageCount,
          scanStatus,
        },
      });
      if (error) throw new Error(error.message);
      return data;
    },
  );
  if (registeredId !== documentId) {
    await client.storage.from(storage.buckets.verificationDocumentsPrivate).remove([path]);
  }
  return { id: registeredId, duplicate: registeredId !== documentId, scanStatus } as const;
}

async function signedPreview(client: Db, row: MediaRow) {
  if (row.external_url) return row.external_url;
  if (!row.storage_bucket || !row.object_path) return null;
  const storage = getStorageConfig();
  if (row.storage_bucket === storage.buckets.propertyMediaPublic) {
    return client.storage.from(row.storage_bucket).getPublicUrl(row.object_path).data.publicUrl;
  }
  const result = await client.storage
    .from(row.storage_bucket)
    .createSignedUrl(row.object_path, storage.signedUrlTtlSeconds);
  return result.error ? null : result.data.signedUrl;
}

export async function getAdminPropertyMedia(propertyId: string) {
  await requireActiveAdmin();
  const client = privilegedClient();
  const id = await ensureActiveProperty(client, propertyId);
  const [mediaResult, documentsResult] = await Promise.all([
    client
      .from("media_assets")
      .select("*")
      .eq("property_id", id)
      .order("archived_at", { ascending: true, nullsFirst: true })
      .order("sort_order"),
    client
      .from("private_documents")
      .select(
        "id,property_id,document_type,mime_type,file_size_bytes,original_file_name,page_count,scan_status,created_at,archived_at",
      )
      .eq("property_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if (mediaResult.error) throw mediaResult.error;
  if (documentsResult.error) throw documentsResult.error;
  const media = await Promise.all(
    mediaResult.data.map(async (row) => toMediaDto(row, await signedPreview(client, row))),
  );
  return { media, documents: documentsResult.data.map(toDocumentDto) };
}

export async function getAdminPropertyVisualMedia(propertyId: string) {
  await requireActiveAdmin();
  const client = privilegedClient();
  const id = await ensureActiveProperty(client, propertyId);
  const result = await client
    .from("media_assets")
    .select("*")
    .eq("property_id", id)
    .order("archived_at", { ascending: true, nullsFirst: true })
    .order("sort_order");
  if (result.error) throw result.error;
  return Promise.all(
    result.data.map(async (row) => toMediaDto(row, await signedPreview(client, row))),
  );
}

export async function getAdminPropertyDocuments(propertyId: string) {
  await requireActiveAdmin();
  const client = privilegedClient();
  const id = await ensureActiveProperty(client, propertyId);
  const result = await client
    .from("private_documents")
    .select(
      "id,property_id,document_type,mime_type,file_size_bytes,original_file_name,page_count,scan_status,created_at,archived_at",
    )
    .eq("property_id", id)
    .order("created_at", { ascending: false });
  if (result.error) throw result.error;
  return result.data.map(toDocumentDto);
}

export async function listAdminMedia() {
  await requireActiveAdmin();
  const client = privilegedClient();
  const { data, error } = await client
    .from("media_assets")
    .select("*,properties!inner(property_code,listing_title)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data.map((row) => ({
    ...toMediaDto(row, null),
    propertyCode: row.properties.property_code,
    propertyTitle: row.properties.listing_title,
  }));
}

export async function getAdminStorageHealth() {
  await requireActiveAdmin();
  return storageHealthWithClient(privilegedClient());
}

export async function updatePropertyMediaMetadata(
  mediaId: string,
  altText?: string,
  caption?: string,
) {
  const admin = await requireActiveAdmin();
  validatePublicMediaText(altText, caption);
  const { error } = await privilegedClient().rpc("update_property_media_metadata", {
    requested_actor_id: admin.userId,
    requested_media_id: z.uuid().parse(mediaId),
    requested_alt_text: altText?.trim() ?? "",
    requested_caption: caption?.trim() ?? "",
  });
  if (error) throw new Error(error.message);
}

export async function reorderPropertyMedia(propertyId: string, mediaIds: readonly string[]) {
  const admin = await requireActiveAdmin();
  const ids = z.array(z.uuid()).max(50).parse(mediaIds);
  const { error } = await privilegedClient().rpc("reorder_property_media", {
    requested_actor_id: admin.userId,
    requested_property_id: z.uuid().parse(propertyId),
    requested_media_ids: ids,
  });
  if (error) throw new Error(error.message);
}

export async function setPropertyCover(propertyId: string, mediaId: string) {
  const admin = await requireActiveAdmin();
  return setPropertyCoverWithClient(privilegedClient(), admin.userId, propertyId, mediaId);
}

export async function approvePropertyImageAndMaybeSetCover(propertyId: string, mediaId: string) {
  const admin = await requireActiveAdmin();
  const client = privilegedClient();
  const id = z.uuid().parse(propertyId);
  const media = await client
    .from("media_assets")
    .select("media_type")
    .eq("id", z.uuid().parse(mediaId))
    .eq("property_id", id)
    .is("archived_at", null)
    .single();
  if (media.error) throw new MediaValidationError("Media asset not found.", "mediaId");
  await approvePropertyMediaWithClient(client, admin.userId, mediaId);
  if (media.data.media_type !== "IMAGE") return;
  const cover = await client
    .from("media_assets")
    .select("id")
    .eq("property_id", id)
    .eq("media_type", "IMAGE")
    .eq("is_cover", true)
    .is("archived_at", null)
    .maybeSingle();
  if (cover.error) throw cover.error;
  if (!cover.data) await setPropertyCoverWithClient(client, admin.userId, id, mediaId);
}

export async function approvePropertyMediaWithClient(client: Db, actorId: string, mediaId: string) {
  const targetId = z.uuid().parse(mediaId);
  const { data: row, error } = await client
    .from("media_assets")
    .select("*")
    .eq("id", targetId)
    .is("archived_at", null)
    .single();
  if (error) throw new MediaValidationError("Media asset not found.", "mediaId");
  if (row.processing_status !== "READY") {
    throw new MediaValidationError("Only ready media can be approved.", "mediaId");
  }
  if (row.external_url) {
    const approved = await client.rpc("approve_property_media", {
      requested_actor_id: actorId,
      requested_media_id: targetId,
    });
    if (approved.error) throw new Error(approved.error.message);
    return;
  }
  if (!row.property_id || !row.storage_bucket || !row.object_path || !row.mime_type) {
    throw new MediaValidationError("Hosted media is missing its controlled storage relation.");
  }
  const storage = getStorageConfig();
  if (row.storage_bucket !== storage.buckets.propertyMediaPrivate) {
    throw new MediaValidationError("Only privately staged media can be promoted.");
  }
  const extension = row.mime_type === "application/pdf" ? "pdf" : "webp";
  const publicPath = propertyPublicMediaPath(row.property_id, extension);
  const copied = await client.storage.from(row.storage_bucket).copy(row.object_path, publicPath, {
    destinationBucket: storage.buckets.propertyMediaPublic,
  });
  if (copied.error) throw new MediaValidationError("The media could not be promoted safely.");
  const approved = await client.rpc("approve_property_media", {
    requested_actor_id: actorId,
    requested_media_id: targetId,
    requested_public_bucket: storage.buckets.propertyMediaPublic,
    requested_public_path: publicPath,
  });
  if (approved.error) {
    await client.storage.from(storage.buckets.propertyMediaPublic).remove([publicPath]);
    throw new Error(approved.error.message);
  }
  await client.storage.from(row.storage_bucket).remove([row.object_path]);
}

export async function approvePropertyMedia(mediaId: string) {
  const admin = await requireActiveAdmin();
  return approvePropertyMediaWithClient(privilegedClient(), admin.userId, mediaId);
}

export async function archivePropertyMedia(mediaId: string) {
  const admin = await requireActiveAdmin();
  const { error } = await privilegedClient().rpc("archive_property_media", {
    requested_actor_id: admin.userId,
    requested_media_id: z.uuid().parse(mediaId),
  });
  if (error) throw new Error(error.message);
}

export async function restorePropertyMedia(mediaId: string) {
  const admin = await requireActiveAdmin();
  const { error } = await privilegedClient().rpc("restore_property_media", {
    requested_actor_id: admin.userId,
    requested_media_id: z.uuid().parse(mediaId),
  });
  if (error) throw new Error(error.message);
}

export async function archivePrivateDocument(documentId: string) {
  const admin = await requireActiveAdmin();
  const { error } = await privilegedClient().rpc("archive_private_document", {
    requested_actor_id: admin.userId,
    requested_document_id: z.uuid().parse(documentId),
  });
  if (error) throw new Error(error.message);
}

export async function createPrivateDocumentSignedUrlWithClient(
  client: Db,
  actorId: string,
  documentId: string,
  purpose = "ADMIN_VIEW",
  testTtlSeconds?: number,
) {
  const targetId = z.uuid().parse(documentId);
  const { data: document, error } = await client
    .from("private_documents")
    .select("id,property_id,storage_bucket,object_path,scan_status,archived_at")
    .eq("id", targetId)
    .maybeSingle();
  if (error || !document || document.archived_at || document.scan_status !== "CLEAN") {
    throw new MediaValidationError("The private document is not available for access.");
  }
  if (document.property_id) await ensureActiveProperty(client, document.property_id);
  const storage = getStorageConfig();
  const signedUrlTtl =
    testTtlSeconds !== undefined && getServerEnvironment().APP_ENV === "test"
      ? z.number().int().min(1).max(300).parse(testTtlSeconds)
      : storage.signedUrlTtlSeconds;
  if (document.storage_bucket !== storage.buckets.verificationDocumentsPrivate) {
    throw new MediaValidationError("The document is not in an authorized private bucket.");
  }
  const audit = await client.rpc("record_private_document_access", {
    requested_actor_id: actorId,
    requested_document_id: targetId,
    requested_purpose: purpose.slice(0, 80),
  });
  if (audit.error) throw new Error(audit.error.message);
  const signed = await client.storage
    .from(document.storage_bucket)
    .createSignedUrl(document.object_path, signedUrlTtl);
  if (signed.error)
    throw new MediaValidationError("A temporary document link could not be created.");
  return {
    signedUrl: signed.data.signedUrl,
    expiresInSeconds: signedUrlTtl,
  } as const;
}

export async function createPrivateDocumentSignedUrl(documentId: string, purpose = "ADMIN_VIEW") {
  const admin = await requireActiveAdmin();
  return createPrivateDocumentSignedUrlWithClient(
    privilegedClient(),
    admin.userId,
    documentId,
    purpose,
  );
}
