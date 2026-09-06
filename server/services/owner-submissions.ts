import "server-only";

import { createHash } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import { privacyHash } from "@/features/intake/domain/abuse";
import { PublicIntakeError } from "@/features/intake/domain/contracts";
import {
  OwnerSubmissionError,
  type OwnerAttachmentRole,
  type OwnerSubmissionResult,
  type PreparedOwnerAttachment,
} from "@/features/owner-submissions/domain/contracts";
import {
  ownerSubmissionInputSchema,
  ownerSubmissionConversionSchema,
  ownerSubmissionTransitionSchema,
  type OwnerSubmissionInput,
} from "@/features/owner-submissions/domain/validation";
import {
  isPotentialOwnerDuplicate,
  ownerDuplicateSignals,
} from "@/features/owner-submissions/domain/duplicates";
import { requireActiveAdmin } from "@/server/auth/authorization";
import { getServerEnvironment } from "@/server/env";
import { deliverAdminIntakeNotification } from "@/server/integrations/intake-notifications";
import { verifyTurnstile } from "@/server/integrations/turnstile";
import { createPrivilegedServerClient } from "@/server/supabase/privileged";
import { sha256 } from "@/server/storage/checksum";
import {
  normalizeOriginalFileName,
  scanDocumentForMalware,
  validatePrivateDocument,
} from "@/server/storage/document-validation";
import { ownerSubmissionAttachmentPath } from "@/server/storage/object-path";
import { getStorageConfig } from "@/server/storage/config";
import type { Database, Json } from "@/types/database.generated";

import { consumePublicRateLimit, type PublicRequestContext } from "./public-intake";

type Db = SupabaseClient<Database>;
type OwnerFile = Readonly<{ file: File; role: OwnerAttachmentRole }>;

const MAX_ATTACHMENTS = 10;
const MAX_TOTAL_ATTACHMENT_BYTES = 20 * 1024 * 1024;

function privilegedClient() {
  return createPrivilegedServerClient() as unknown as Db;
}

function asJson(value: unknown): Json {
  return value as Json;
}

function ownerHmacSecret(): string {
  const environment = getServerEnvironment();
  if (environment.HMAC_SECRET) return environment.HMAC_SECRET;
  if (environment.APP_ENV === "local" || environment.APP_ENV === "test")
    return "urbanedge-local-test-hmac-boundary-not-for-production";
  throw new OwnerSubmissionError("SERVICE_UNAVAILABLE");
}

function stableUuid(seed: string): string {
  const hex = createHash("sha256").update(seed).digest("hex").slice(0, 32).split("");
  hex[12] = "4";
  hex[16] = ((Number.parseInt(hex[16] ?? "0", 16) & 3) | 8).toString(16);
  return `${hex.slice(0, 8).join("")}-${hex.slice(8, 12).join("")}-${hex.slice(12, 16).join("")}-${hex.slice(16, 20).join("")}-${hex.slice(20).join("")}`;
}

function mapPublicError(error: unknown): OwnerSubmissionError {
  if (error instanceof OwnerSubmissionError) return error;
  if (error instanceof PublicIntakeError) {
    if (error.code === "RATE_LIMITED") return new OwnerSubmissionError("RATE_LIMITED");
    if (error.code === "BOT_REJECTED") return new OwnerSubmissionError("BOT_REJECTED");
    if (error.code === "BOT_CONFIGURATION_REQUIRED")
      return new OwnerSubmissionError("BOT_CONFIGURATION_REQUIRED");
  }
  const message = error instanceof Error ? error.message : "";
  if (message.includes("IDEMPOTENCY_CONFLICT"))
    return new OwnerSubmissionError("IDEMPOTENCY_CONFLICT");
  if (message.includes("ATTACHMENT") || message.includes("Document"))
    return new OwnerSubmissionError("ATTACHMENT_INVALID");
  return new OwnerSubmissionError("SERVICE_UNAVAILABLE");
}

async function prepareAttachments(
  submissionId: string,
  files: readonly OwnerFile[],
): Promise<readonly Readonly<{ record: PreparedOwnerAttachment; bytes: Buffer }>[]> {
  if (files.length > MAX_ATTACHMENTS) throw new OwnerSubmissionError("ATTACHMENT_LIMIT");
  if (files.reduce((total, item) => total + item.file.size, 0) > MAX_TOTAL_ATTACHMENT_BYTES)
    throw new OwnerSubmissionError("ATTACHMENT_LIMIT");
  const prepared: Array<Readonly<{ record: PreparedOwnerAttachment; bytes: Buffer }>> = [];
  for (const [index, item] of files.entries()) {
    const document = await validatePrivateDocument(item.file);
    const scanStatus = await scanDocumentForMalware(document.bytes);
    if (scanStatus === "INFECTED" || scanStatus === "FAILED")
      throw new OwnerSubmissionError("ATTACHMENT_UNSAFE");
    const id = stableUuid(`${submissionId}:${index}:${item.role}:${sha256(document.bytes)}`);
    const kind = item.role === "SUPPORTING_DOCUMENT" ? "documents" : "media";
    prepared.push({
      bytes: document.bytes,
      record: {
        id,
        documentRole: item.role,
        documentType:
          item.role === "OWNER_PHOTO"
            ? "OWNER_MEDIA"
            : item.role === "OWNER_BROCHURE"
              ? "OWNER_BROCHURE"
              : "OWNER_SUPPORTING_DOCUMENT",
        objectPath: ownerSubmissionAttachmentPath(submissionId, id, kind, document.extension),
        mimeType: document.mimeType,
        fileSizeBytes: document.bytes.byteLength,
        checksumSha256: sha256(document.bytes),
        originalFileName: normalizeOriginalFileName(item.file.name),
        pageCount: document.pageCount,
        scanStatus,
      },
    });
  }
  return prepared;
}

async function uploadPrepared(
  client: Db,
  prepared: Awaited<ReturnType<typeof prepareAttachments>>,
) {
  const bucket = getStorageConfig().buckets.ownerSubmissionsPrivate;
  const storage = getStorageConfig();
  const usage = await client.rpc("get_storage_usage_bytes");
  if (usage.error) throw new OwnerSubmissionError("SERVICE_UNAVAILABLE");
  const usedBytes = usage.data ?? 0;
  const incomingBytes = prepared.reduce((total, item) => total + item.record.fileSizeBytes, 0);
  if (((usedBytes + incomingBytes) / storage.budgetBytes) * 100 >= storage.hardStopPercent)
    throw new OwnerSubmissionError("SERVICE_UNAVAILABLE");
  const uploaded: string[] = [];
  try {
    for (const item of prepared) {
      const result = await client.storage.from(bucket).upload(item.record.objectPath, item.bytes, {
        cacheControl: "3600",
        contentType: item.record.mimeType,
        upsert: false,
      });
      if (result.error && !result.error.message.toLowerCase().includes("already exists"))
        throw result.error;
      if (!result.error) uploaded.push(item.record.objectPath);
    }
    return uploaded;
  } catch (error) {
    if (uploaded.length) await client.storage.from(bucket).remove(uploaded);
    throw mapPublicError(error);
  }
}

export async function persistOwnerSubmission(
  client: Db,
  input: OwnerSubmissionInput,
  idempotencyKeyHash: string,
  submissionId: string,
  attachments: readonly PreparedOwnerAttachment[],
) {
  const payload: Record<string, unknown> = { ...input };
  delete payload.action;
  delete payload.idempotencyKey;
  delete payload.turnstileToken;
  const result = await client.rpc("submit_owner_land_submission", {
    requested_submission_id: submissionId,
    requested_idempotency_key_hash: idempotencyKeyHash,
    requested_payload: asJson(payload),
    requested_documents: asJson(attachments),
  });
  if (result.error) throw mapPublicError(new Error(result.error.message));
  const row = result.data?.[0];
  if (!row) throw new OwnerSubmissionError("SERVICE_UNAVAILABLE");
  return row;
}

export async function submitOwnerLand(
  rawInput: OwnerSubmissionInput,
  files: readonly OwnerFile[],
  context: PublicRequestContext,
): Promise<OwnerSubmissionResult> {
  try {
    const input = ownerSubmissionInputSchema.parse(rawInput);
    const environment = getServerEnvironment();
    const client = privilegedClient();
    const secret = ownerHmacSecret();
    const rateBucket = privacyHash(
      `OWNER_LAND_SUBMISSION|${context.ipAddress || "unknown"}`,
      secret,
    );
    if (!(await consumePublicRateLimit(client, "OWNER_LAND_SUBMISSION", rateBucket)))
      throw new OwnerSubmissionError("RATE_LIMITED");
    await verifyTurnstile(environment, {
      action: "OWNER_LAND_SUBMISSION",
      token: input.turnstileToken,
      idempotencyKey: input.idempotencyKey,
    });

    const submissionId = stableUuid(`owner-submission:${input.idempotencyKey}`);
    const prepared = await prepareAttachments(submissionId, files);
    const uploaded = await uploadPrepared(client, prepared);
    let persisted;
    try {
      persisted = await persistOwnerSubmission(
        client,
        input,
        privacyHash(input.idempotencyKey, secret),
        submissionId,
        prepared.map((item) => item.record),
      );
    } catch (error) {
      if (uploaded.length)
        await client.storage
          .from(getStorageConfig().buckets.ownerSubmissionsPrivate)
          .remove(uploaded);
      throw error;
    }
    if (!persisted.replayed) {
      const delivery = await deliverAdminIntakeNotification(environment, {
        deliveryId: persisted.target_notification_id,
        action: "OWNER_LAND_SUBMISSION",
      });
      const notification = await client.rpc("record_owner_submission_notification_result", {
        requested_delivery_id: persisted.target_notification_id,
        requested_status: delivery.status,
        requested_error_code: delivery.errorCode,
      });
      if (notification.error)
        console.error("owner_submission_notification_status_failed", {
          code: "DATABASE_UPDATE_FAILED",
        });
      const analytics = await client.from("analytics_events").insert({
        event_name: "owner_land_submission_success",
        page_path: "/sell-your-land",
        source_channel: "WEBSITE",
        metadata: { land_category: input.landCategory, owner_intent: input.ownerIntent },
      });
      if (analytics.error)
        console.error("owner_submission_analytics_failed", { code: "DATABASE_INSERT_FAILED" });
    }
    return {
      submissionId: persisted.target_submission_id,
      submissionReference: persisted.target_submission_reference,
      replayed: persisted.replayed,
    };
  } catch (error) {
    throw mapPublicError(error);
  }
}

export async function createOwnerDocumentDownload(documentId: string) {
  const actor = await requireActiveAdmin();
  const client = privilegedClient();
  const result = await client
    .from("private_documents")
    .select("id,storage_bucket,object_path,scan_status,owner_submission_id,archived_at")
    .eq("id", documentId)
    .eq("storage_bucket", getStorageConfig().buckets.ownerSubmissionsPrivate)
    .not("owner_submission_id", "is", null)
    .is("archived_at", null)
    .maybeSingle();
  if (result.error || !result.data || result.data.scan_status !== "CLEAN")
    throw new OwnerSubmissionError("ATTACHMENT_UNSAFE");
  const audit = await client.rpc("record_private_document_access", {
    requested_actor_id: actor.userId,
    requested_document_id: result.data.id,
    requested_purpose: "OWNER_SUBMISSION_REVIEW",
  });
  if (audit.error) throw new OwnerSubmissionError("SERVICE_UNAVAILABLE");
  const signed = await client.storage
    .from(result.data.storage_bucket)
    .createSignedUrl(result.data.object_path, 60, { download: true });
  if (signed.error) throw new OwnerSubmissionError("SERVICE_UNAVAILABLE");
  return signed.data.signedUrl;
}

export async function listOwnerSubmissions(
  filters: Readonly<{
    status?: string;
    category?: string;
    intent?: string;
    district?: string;
    assignee?: string;
    documentState?: string;
    createdFrom?: string;
    createdTo?: string;
    query?: string;
  }> = {},
) {
  await requireActiveAdmin();
  const client = privilegedClient();
  let query = client
    .from("owner_submissions")
    .select(
      "id,submission_reference,party_id,land_category,owner_intent,status,district_id,assigned_to,next_action_at,created_at",
    )
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(200);
  if (filters.status) query = query.eq("status", filters.status as never);
  if (filters.category) query = query.eq("land_category", filters.category as never);
  if (filters.intent) query = query.eq("owner_intent", filters.intent);
  if (filters.district) query = query.eq("district_id", filters.district);
  if (filters.assignee === "UNASSIGNED") query = query.is("assigned_to", null);
  else if (filters.assignee) query = query.eq("assigned_to", filters.assignee);
  if (filters.createdFrom) query = query.gte("created_at", `${filters.createdFrom}T00:00:00+05:30`);
  if (filters.createdTo) query = query.lte("created_at", `${filters.createdTo}T23:59:59+05:30`);
  const result = await query;
  if (result.error) throw result.error;
  const rows = result.data ?? [];
  const [parties, districts, assignees, documentRows] = await Promise.all([
    rows.length
      ? client
          .from("parties")
          .select("id,display_name,phone,email")
          .in(
            "id",
            rows.map((row) => row.party_id),
          )
      : Promise.resolve({ data: [], error: null }),
    rows.length
      ? client
          .from("districts")
          .select("id,name")
          .in(
            "id",
            rows.flatMap((row) => (row.district_id ? [row.district_id] : [])),
          )
      : Promise.resolve({ data: [], error: null }),
    rows.length
      ? client
          .from("admin_profiles")
          .select("user_id,display_name")
          .in(
            "user_id",
            rows.flatMap((row) => (row.assigned_to ? [row.assigned_to] : [])),
          )
      : Promise.resolve({ data: [], error: null }),
    rows.length && filters.documentState
      ? client
          .from("private_documents")
          .select("owner_submission_id,scan_status")
          .in(
            "owner_submission_id",
            rows.map((row) => row.id),
          )
          .is("archived_at", null)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (parties.error) throw parties.error;
  if (districts.error) throw districts.error;
  if (assignees.error) throw assignees.error;
  if (documentRows.error) throw documentRows.error;
  const needle = filters.query?.trim().toLowerCase();
  return rows
    .map((row) => ({
      ...row,
      party: parties.data?.find((party) => party.id === row.party_id) ?? null,
      district: districts.data?.find((district) => district.id === row.district_id) ?? null,
      assignee: assignees.data?.find((assignee) => assignee.user_id === row.assigned_to) ?? null,
      documentStates: (documentRows.data ?? [])
        .filter((document) => document.owner_submission_id === row.id)
        .map((document) => document.scan_status),
    }))
    .filter(
      (row) =>
        (!needle ||
          [
            row.submission_reference,
            row.party?.display_name,
            row.party?.phone,
            row.party?.email,
            row.district?.name,
          ]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(needle))) &&
        (!filters.documentState ||
          (filters.documentState === "NONE"
            ? row.documentStates.length === 0
            : row.documentStates.includes(filters.documentState as never))),
    );
}

export async function getOwnerSubmissionFilterOptions() {
  await requireActiveAdmin();
  const client = privilegedClient();
  const [districts, admins] = await Promise.all([
    client.from("districts").select("id,name").eq("is_active", true).order("name"),
    client
      .from("admin_profiles")
      .select("user_id,display_name")
      .eq("is_active", true)
      .order("display_name"),
  ]);
  if (districts.error || admins.error) throw districts.error ?? admins.error;
  return { districts: districts.data ?? [], admins: admins.data ?? [] };
}

export async function getOwnerSubmissionWorkspace(submissionId: string) {
  await requireActiveAdmin();
  const client = privilegedClient();
  const submission = await client
    .from("owner_submissions")
    .select(
      "id,submission_reference,party_id,land_category,primary_transaction_type,district_id,subdistrict_id,place_id,locality_text,approximate_area_value,approximate_area_unit_id,asking_price_text,source_description,status,converted_property_id,first_contacted_at,next_action_at,notes_internal,created_at,updated_at,owner_intent,preferred_contact,owner_relationship,taluka_text,village_text,broad_address,location_visibility_preference,private_latitude,private_longitude,price_mode,asking_price_amount,asking_price_per_unit,price_unit_id,is_negotiable,minimum_acceptable_price,category_claims,media_claims,assigned_to,version",
    )
    .eq("id", submissionId)
    .is("archived_at", null)
    .maybeSingle();
  if (submission.error) throw submission.error;
  if (!submission.data) return null;
  const [
    party,
    district,
    unit,
    priceUnit,
    documents,
    consents,
    events,
    convertedProperty,
    assignedAdmin,
    samePartySubmissions,
    sameAreaSubmissions,
    ownerPropertyLinks,
    activeAdmins,
  ] = await Promise.all([
    client
      .from("parties")
      .select("id,display_name,phone,email")
      .eq("id", submission.data.party_id)
      .single(),
    submission.data.district_id
      ? client.from("districts").select("id,name").eq("id", submission.data.district_id).single()
      : Promise.resolve({ data: null, error: null }),
    submission.data.approximate_area_unit_id
      ? client
          .from("area_units")
          .select("id,display_name,symbol")
          .eq("id", submission.data.approximate_area_unit_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
    submission.data.price_unit_id
      ? client
          .from("area_units")
          .select("id,display_name,symbol")
          .eq("id", submission.data.price_unit_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
    client
      .from("private_documents")
      .select(
        "id,document_type,original_file_name,mime_type,file_size_bytes,scan_status,created_at",
      )
      .eq("owner_submission_id", submissionId)
      .is("archived_at", null)
      .order("created_at"),
    client
      .from("owner_submission_consents")
      .select("purpose,privacy_notice_version,consented_at")
      .eq("owner_submission_id", submissionId)
      .order("consented_at"),
    client
      .from("owner_submission_events")
      .select("id,event_type,from_status,to_status,note,next_action_at,actor_admin_id,occurred_at")
      .eq("owner_submission_id", submissionId)
      .order("occurred_at", { ascending: false }),
    submission.data.converted_property_id
      ? client
          .from("properties")
          .select("id,property_code,publication_status")
          .eq("id", submission.data.converted_property_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
    submission.data.assigned_to
      ? client
          .from("admin_profiles")
          .select("user_id,display_name")
          .eq("user_id", submission.data.assigned_to)
          .single()
      : Promise.resolve({ data: null, error: null }),
    client
      .from("owner_submissions")
      .select(
        "id,submission_reference,party_id,district_id,land_category,approximate_area_value,category_claims,status,created_at",
      )
      .eq("party_id", submission.data.party_id)
      .neq("id", submissionId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
    submission.data.district_id
      ? client
          .from("owner_submissions")
          .select(
            "id,submission_reference,party_id,district_id,land_category,approximate_area_value,category_claims,status,created_at",
          )
          .eq("district_id", submission.data.district_id)
          .eq("land_category", submission.data.land_category)
          .neq("id", submissionId)
          .is("archived_at", null)
          .order("created_at", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [], error: null }),
    client
      .from("property_parties")
      .select("property_id")
      .eq("party_id", submission.data.party_id)
      .is("archived_at", null)
      .limit(20),
    client
      .from("admin_profiles")
      .select("user_id,display_name")
      .eq("is_active", true)
      .order("display_name"),
  ]);
  for (const result of [
    party,
    district,
    unit,
    priceUnit,
    documents,
    consents,
    events,
    convertedProperty,
    assignedAdmin,
    samePartySubmissions,
    sameAreaSubmissions,
    ownerPropertyLinks,
    activeAdmins,
  ])
    if (result.error) throw result.error;
  const claims = submission.data.category_claims as Record<string, unknown>;
  const subject = {
    id: submission.data.id,
    partyId: submission.data.party_id,
    districtId: submission.data.district_id,
    landCategory: submission.data.land_category,
    areaValue: submission.data.approximate_area_value,
    surveyReference:
      typeof claims.surveyReference === "string" ? claims.surveyReference : undefined,
    blockReference: typeof claims.blockReference === "string" ? claims.blockReference : undefined,
  };
  const candidateRows = [...(samePartySubmissions.data ?? []), ...(sameAreaSubmissions.data ?? [])];
  const seenCandidates = new Set<string>();
  const duplicateSubmissions = candidateRows.flatMap((candidate) => {
    if (seenCandidates.has(candidate.id)) return [];
    seenCandidates.add(candidate.id);
    const candidateClaims = candidate.category_claims as Record<string, unknown>;
    const signals = ownerDuplicateSignals(subject, {
      id: candidate.id,
      partyId: candidate.party_id,
      districtId: candidate.district_id,
      landCategory: candidate.land_category,
      areaValue: candidate.approximate_area_value,
      surveyReference:
        typeof candidateClaims.surveyReference === "string"
          ? candidateClaims.surveyReference
          : undefined,
      blockReference:
        typeof candidateClaims.blockReference === "string"
          ? candidateClaims.blockReference
          : undefined,
    });
    return isPotentialOwnerDuplicate(signals) ? [{ ...candidate, signals }] : [];
  });
  const propertyIds = [...new Set((ownerPropertyLinks.data ?? []).map((row) => row.property_id))];
  const possibleProperties = propertyIds.length
    ? await client
        .from("properties")
        .select(
          "id,property_code,listing_title,land_category,district_id,display_area_value,publication_status",
        )
        .in("id", propertyIds)
        .is("archived_at", null)
        .limit(20)
    : { data: [], error: null };
  if (possibleProperties.error) throw possibleProperties.error;
  return {
    submission: submission.data,
    party: party.data,
    district: district.data,
    areaUnit: unit.data,
    priceUnit: priceUnit.data,
    documents: documents.data ?? [],
    consents: consents.data ?? [],
    events: events.data ?? [],
    convertedProperty: convertedProperty.data,
    assignedAdmin: assignedAdmin.data,
    duplicateSubmissions,
    possibleProperties: (possibleProperties.data ?? []).map((property) => ({
      ...property,
      signals: ["Same owner/contact"],
    })),
    activeAdmins: activeAdmins.data ?? [],
  };
}

export async function assignOwnerSubmission(
  input: Readonly<{
    submissionId: string;
    expectedVersion: number;
    assignedTo?: string;
  }>,
) {
  const actor = await requireActiveAdmin();
  const result = await privilegedClient().rpc("assign_owner_submission", {
    requested_actor_id: actor.userId,
    requested_submission_id: input.submissionId,
    requested_expected_version: input.expectedVersion,
    requested_assigned_to: input.assignedTo,
  });
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function transitionOwnerSubmission(raw: unknown) {
  const actor = await requireActiveAdmin();
  const input = ownerSubmissionTransitionSchema.parse(raw);
  const result = await privilegedClient().rpc("transition_owner_submission", {
    requested_actor_id: actor.userId,
    requested_submission_id: input.submissionId,
    requested_expected_version: input.expectedVersion,
    requested_next_status: input.nextStatus,
    requested_note: input.note,
    requested_next_action_at: input.nextActionAt,
  });
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function addOwnerSubmissionNote(
  input: Readonly<{ submissionId: string; expectedVersion: number; note: string }>,
) {
  const actor = await requireActiveAdmin();
  const result = await privilegedClient().rpc("add_owner_submission_note", {
    requested_actor_id: actor.userId,
    requested_submission_id: input.submissionId,
    requested_expected_version: input.expectedVersion,
    requested_note: input.note,
  });
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function convertOwnerSubmission(raw: unknown) {
  const actor = await requireActiveAdmin();
  const input = ownerSubmissionConversionSchema.parse(raw);
  const result = await privilegedClient().rpc("convert_owner_submission_to_property", {
    requested_actor_id: actor.userId,
    requested_submission_id: input.submissionId,
    requested_expected_version: input.expectedVersion,
    requested_payload: asJson({
      listingTitle: input.listingTitle,
      publicDescription: input.publicDescription,
      publicAddress: input.publicAddress,
      locationVisibility: input.locationVisibility,
      priceMode: input.priceMode,
      priceAmount: input.priceAmount,
      pricePerUnit: input.pricePerUnit,
      priceUnitId: input.priceUnitId,
      negotiable: input.negotiable,
    }),
  });
  if (result.error) {
    if (result.error.message.includes("NOT_APPROVED"))
      throw new OwnerSubmissionError("NOT_APPROVED");
    if (result.error.message.includes("ALREADY_CONVERTED"))
      throw new OwnerSubmissionError("ALREADY_CONVERTED");
    if (result.error.message.includes("STALE_OWNER"))
      throw new OwnerSubmissionError("STALE_RECORD");
    throw new Error(result.error.message);
  }
  const row = result.data?.[0];
  if (!row) throw new OwnerSubmissionError("SERVICE_UNAVAILABLE");
  return row;
}
