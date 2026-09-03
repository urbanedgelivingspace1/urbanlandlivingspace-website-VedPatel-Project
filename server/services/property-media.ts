import "server-only";

import { randomUUID } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import type {
  AdminMediaAssetDto,
  AdminPrivateDocumentDto,
  ExternalMediaKind,
} from "@/features/media/domain/contracts";
import { MediaValidationError } from "@/features/media/domain/contracts";
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
  propertyPrivateMediaPath,
  propertyPublicMediaPath,
  verificationDocumentPath,
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
  .enum(["OWNER_DOCUMENT", "LEGAL_DOCUMENT", "VERIFICATION_EVIDENCE"])
  .default("VERIFICATION_EVIDENCE");

const MAX_STAGED_IMAGES_PER_PROPERTY = 20;
const MAX_ACTIVE_BROCHURES_PER_PROPERTY = 1;

async function storageHealthWithClient(client: Db) {
  const [media, documents] = await Promise.all([
    client.from("media_assets").select("file_size_bytes").not("storage_bucket", "is", null),
    client.from("private_documents").select("file_size_bytes"),
  ]);
  if (media.error) throw media.error;
  if (documents.error) throw documents.error;
  const usedBytes = [...media.data, ...documents.data].reduce(
    (total, row) => total + (row.file_size_bytes ?? 0),
    0,
  );
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
    .is("archived_at", null)
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
  const path = verificationDocumentPath(id, documentId, document.extension);
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
  const { error } = await privilegedClient().rpc("set_property_cover", {
    requested_actor_id: admin.userId,
    requested_property_id: z.uuid().parse(propertyId),
    requested_media_id: z.uuid().parse(mediaId),
  });
  if (error) throw new Error(error.message);
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
