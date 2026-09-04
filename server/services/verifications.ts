import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import type {
  AdminVerificationCheck,
  AdminVerificationDetail,
  EvidenceProvenance,
  EvidenceType,
  ProfessionalReviewStatus,
  VerificationApplicability,
  VerificationQueueItem,
  VerificationSourceClass,
  VerificationStatus,
} from "@/features/verification/domain/contracts";
import { VerificationValidationError } from "@/features/verification/domain/contracts";
import { requireActiveAdmin } from "@/server/auth/authorization";
import { createPrivilegedServerClient } from "@/server/supabase/privileged";
import type { Database, Json } from "@/types/database.generated";

type Db = SupabaseClient<Database>;
const privilegedClient = () => createPrivilegedServerClient() as unknown as Db;
const id = z.uuid();

function fail(error: { message: string } | null) {
  if (error) throw new VerificationValidationError(error.message);
}

export async function listVerificationQueueWithClient(
  client: Db,
): Promise<VerificationQueueItem[]> {
  const [properties, checks] = await Promise.all([
    client
      .from("properties")
      .select("id,property_code,listing_title,land_category,primary_transaction_type")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false }),
    client.from("property_verifications").select("property_id,status,applicability,recheck_at"),
  ]);
  fail(properties.error);
  fail(checks.error);
  return (properties.data ?? []).map((property) => {
    const relevant = (checks.data ?? []).filter(
      (check) => check.property_id === property.id && check.applicability === "APPLICABLE",
    );
    return {
      propertyId: property.id,
      propertyCode: property.property_code,
      title: property.listing_title,
      category: property.land_category,
      transactionType: property.primary_transaction_type,
      totalChecks: relevant.length,
      inReview: relevant.filter((check) => check.status === "IN_REVIEW").length,
      requiresReview: relevant.filter((check) => check.status === "REQUIRES_REVIEW").length,
      dueOrExpired: relevant.filter(
        (check) =>
          check.status === "EXPIRED" ||
          (check.recheck_at !== null && new Date(check.recheck_at).getTime() <= Date.now()),
      ).length,
      passed: relevant.filter((check) =>
        (["PASSED", "PASSED_WITH_NOTE"] as VerificationStatus[]).includes(check.status),
      ).length,
    };
  });
}

export async function listVerificationQueue() {
  await requireActiveAdmin();
  return listVerificationQueueWithClient(privilegedClient());
}

export async function getAdminVerificationDetailWithClient(
  client: Db,
  propertyId: string,
): Promise<AdminVerificationDetail | null> {
  const target = id.parse(propertyId);
  const propertyResult = await client
    .from("properties")
    .select(
      "id,property_code,listing_title,land_category,primary_transaction_type,publication_status",
    )
    .eq("id", target)
    .is("deleted_at", null)
    .maybeSingle();
  fail(propertyResult.error);
  if (!propertyResult.data) return null;
  const [
    definitions,
    checks,
    documents,
    evidence,
    exceptions,
    professionals,
    history,
    policies,
    sources,
  ] = await Promise.all([
    client
      .from("verification_check_definitions")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
    client.from("property_verifications").select("*").eq("property_id", target),
    client
      .from("private_documents")
      .select("id,original_file_name,document_type,scan_status,archived_at")
      .eq("property_id", target)
      .order("created_at", { ascending: false }),
    client
      .from("verification_evidence")
      .select("*")
      .in(
        "property_verification_id",
        (
          await client.from("property_verifications").select("id").eq("property_id", target)
        ).data?.map(({ id: checkId }) => checkId) ?? [],
      ),
    client
      .from("verification_exceptions")
      .select("*")
      .in(
        "property_verification_id",
        (
          await client.from("property_verifications").select("id").eq("property_id", target)
        ).data?.map(({ id: checkId }) => checkId) ?? [],
      ),
    client
      .from("professional_reviews")
      .select("*")
      .in(
        "property_verification_id",
        (
          await client.from("property_verifications").select("id").eq("property_id", target)
        ).data?.map(({ id: checkId }) => checkId) ?? [],
      ),
    client
      .from("verification_history")
      .select("*")
      .in(
        "property_verification_id",
        (
          await client.from("property_verifications").select("id").eq("property_id", target)
        ).data?.map(({ id: checkId }) => checkId) ?? [],
      )
      .order("occurred_at", { ascending: false }),
    client
      .from("verification_public_copy_policies")
      .select("id,check_definition_id,approval_status"),
    client.from("source_references").select("id,document_or_service_name,authority_name"),
  ]);
  for (const result of [
    definitions,
    checks,
    documents,
    evidence,
    exceptions,
    professionals,
    history,
    policies,
    sources,
  ])
    fail(result.error);

  const definitionsById = new Map(
    (definitions.data ?? []).map((definition) => [definition.id, definition]),
  );
  const documentsById = new Map((documents.data ?? []).map((document) => [document.id, document]));
  const sourcesById = new Map((sources.data ?? []).map((source) => [source.id, source]));
  const checkDtos = (
    (checks.data ?? [])
      .map((check) => {
        const definition = definitionsById.get(check.check_definition_id);
        if (!definition) return null;
        return {
          id: check.id,
          status: check.status,
          applicability: check.applicability,
          applicabilityReason: check.applicability_reason,
          riskLevel: check.risk_level,
          scope: check.scope_statement,
          limitations: check.limitations,
          reviewerNotes: check.reviewer_notes_internal,
          reviewedAt: check.reviewed_at,
          checkDate: check.check_date,
          recheckAt: check.recheck_at,
          referralRequired: check.referral_required,
          referralType: check.referral_type,
          publicVisible: check.public_visible,
          publicDisclosureEligible: check.public_disclosure_eligible,
          publicCopyApproved: (policies.data ?? []).some(
            (policy) =>
              policy.check_definition_id === definition.id && policy.approval_status === "APPROVED",
          ),
          definition: {
            id: definition.id,
            code: definition.code,
            name: definition.name,
            description: definition.description_internal,
            categoryScope: definition.category_scope,
            transactionScope: definition.applies_to_transaction,
            sourceClass: definition.source_class,
            requiredEvidence: definition.required_evidence,
            minimumProvenance: definition.minimum_provenance,
            evidenceTypes: [...definition.evidence_types],
            lawyerRequired: definition.lawyer_review_required_by_default,
            surveyorRequired: definition.surveyor_review_required_by_default,
            recheckDays: definition.recheck_days_default,
            riskIfFailed: definition.risk_if_failed,
          },
          evidence: (evidence.data ?? [])
            .filter((item) => item.property_verification_id === check.id)
            .map((item) => {
              const document = item.private_document_id
                ? documentsById.get(item.private_document_id)
                : null;
              const source = item.source_reference_id
                ? sourcesById.get(item.source_reference_id)
                : null;
              return {
                id: item.id,
                evidenceType: item.evidence_type,
                provenance: item.provenance_state,
                sourceClass: item.source_class,
                supportsCheck: item.supports_check,
                reference: item.evidence_reference,
                observedDate: item.observed_date,
                privateDocumentId: item.private_document_id,
                privateDocumentName: document?.original_file_name ?? null,
                scanStatus: document?.scan_status ?? null,
                sourceReferenceId: item.source_reference_id,
                sourceName: source?.document_or_service_name ?? null,
                createdAt: item.created_at,
              };
            }),
          exceptions: (exceptions.data ?? [])
            .filter((item) => item.property_verification_id === check.id)
            .map((item) => ({
              id: item.id,
              severity: item.severity,
              summary: item.summary,
              limitation: item.limitation,
              blocksPublicDisclosure: item.blocks_public_disclosure,
              status: item.status,
            })),
          professionalReviews: (professionals.data ?? [])
            .filter((item) => item.property_verification_id === check.id)
            .map((item) => ({
              id: item.id,
              professionalType: item.professional_type,
              status: item.status,
              scope: item.scope_statement,
              professionalName: item.professional_name,
              outcome: item.outcome_summary,
              reviewDate: item.review_date,
            })),
        } as AdminVerificationCheck;
      })
      .filter((value) => value !== null) as AdminVerificationCheck[]
  ).sort((left, right) => left.definition.code.localeCompare(right.definition.code));

  const property = propertyResult.data;
  return {
    property: {
      id: property.id,
      propertyCode: property.property_code,
      title: property.listing_title,
      category: property.land_category,
      transactionType: property.primary_transaction_type,
      publicationStatus: property.publication_status,
    },
    checks: checkDtos,
    documents: (documents.data ?? []).map((document) => ({
      id: document.id,
      name: document.original_file_name,
      documentType: document.document_type,
      scanStatus: document.scan_status,
      archivedAt: document.archived_at,
    })),
    sources: (sources.data ?? []).map((source) => ({
      id: source.id,
      name: source.document_or_service_name,
      authority: source.authority_name,
    })),
    history: (history.data ?? []).map((item) => ({
      id: item.id,
      checkId: item.property_verification_id,
      eventType: item.event_type,
      fromStatus: item.from_status,
      toStatus: item.to_status,
      occurredAt: item.occurred_at,
      reason: item.reason,
    })),
  };
}

export async function getAdminVerificationDetail(propertyId: string) {
  await requireActiveAdmin();
  return getAdminVerificationDetailWithClient(privilegedClient(), propertyId);
}

export async function initializePropertyVerificationsWithClient(
  client: Db,
  actorId: string,
  propertyId: string,
) {
  const result = await client.rpc("initialize_property_verifications", {
    requested_actor_id: id.parse(actorId),
    requested_property_id: id.parse(propertyId),
  });
  fail(result.error);
  return result.data;
}

export async function initializePropertyVerifications(propertyId: string) {
  const admin = await requireActiveAdmin();
  return initializePropertyVerificationsWithClient(privilegedClient(), admin.userId, propertyId);
}

export async function transitionVerificationWithClient(
  client: Db,
  actorId: string,
  verificationId: string,
  target: VerificationStatus,
  payload: Json = {},
) {
  const result = await client.rpc("transition_property_verification", {
    requested_actor_id: id.parse(actorId),
    requested_verification_id: id.parse(verificationId),
    requested_target: target,
    requested_payload: payload,
  });
  fail(result.error);
}

export async function transitionVerification(
  verificationId: string,
  target: VerificationStatus,
  payload: Json = {},
) {
  const admin = await requireActiveAdmin();
  return transitionVerificationWithClient(
    privilegedClient(),
    admin.userId,
    verificationId,
    target,
    payload,
  );
}

export async function linkVerificationEvidenceWithClient(
  client: Db,
  actorId: string,
  verificationId: string,
  input: Readonly<{
    privateDocumentId?: string;
    sourceReferenceId?: string;
    evidenceType: EvidenceType;
    sourceClass: VerificationSourceClass;
    evidenceReference?: string;
    observedDate?: string;
    supportsCheck?: boolean;
    notes?: string;
  }>,
) {
  const result = await client.rpc("link_verification_evidence", {
    requested_actor_id: id.parse(actorId),
    requested_verification_id: id.parse(verificationId),
    requested_payload: input as Json,
  });
  fail(result.error);
  return result.data;
}

export async function linkVerificationEvidence(
  verificationId: string,
  input: Parameters<typeof linkVerificationEvidenceWithClient>[3],
) {
  const admin = await requireActiveAdmin();
  return linkVerificationEvidenceWithClient(
    privilegedClient(),
    admin.userId,
    verificationId,
    input,
  );
}

export async function advanceVerificationEvidence(
  evidenceId: string,
  state: EvidenceProvenance,
  professionalReviewId?: string,
) {
  const admin = await requireActiveAdmin();
  const result = await privilegedClient().rpc("advance_verification_evidence", {
    requested_actor_id: admin.userId,
    requested_evidence_id: id.parse(evidenceId),
    requested_state: state,
    requested_professional_review_id: professionalReviewId
      ? id.parse(professionalReviewId)
      : undefined,
  });
  fail(result.error);
}

export async function setVerificationApplicability(
  verificationId: string,
  applicability: VerificationApplicability,
  reason: string,
) {
  const admin = await requireActiveAdmin();
  const result = await privilegedClient().rpc("set_verification_applicability", {
    requested_actor_id: admin.userId,
    requested_verification_id: id.parse(verificationId),
    requested_applicability: applicability,
    requested_reason: reason,
  });
  fail(result.error);
}

export async function recordVerificationException(verificationId: string, payload: Json) {
  const admin = await requireActiveAdmin();
  const result = await privilegedClient().rpc("record_verification_exception", {
    requested_actor_id: admin.userId,
    requested_verification_id: id.parse(verificationId),
    requested_payload: payload,
  });
  fail(result.error);
  return result.data;
}

export async function requestProfessionalVerificationReview(
  verificationId: string,
  type: "LAWYER" | "SURVEYOR" | "PLANNER" | "ENGINEER" | "OTHER",
  scope: string,
) {
  const admin = await requireActiveAdmin();
  const result = await privilegedClient().rpc("request_professional_review", {
    requested_actor_id: admin.userId,
    requested_verification_id: id.parse(verificationId),
    requested_type: type,
    requested_scope: scope,
  });
  fail(result.error);
  return result.data;
}

export async function updateProfessionalVerificationReview(
  reviewId: string,
  target: ProfessionalReviewStatus,
  payload: Json = {},
) {
  const admin = await requireActiveAdmin();
  const result = await privilegedClient().rpc("update_professional_review", {
    requested_actor_id: admin.userId,
    requested_review_id: id.parse(reviewId),
    requested_target: target,
    requested_payload: payload,
  });
  fail(result.error);
}

export async function retireVerificationEvidence(
  evidenceId: string,
  state: "SUPERSEDED" | "REVOKED",
  reason: string,
  replacementId?: string,
) {
  const admin = await requireActiveAdmin();
  const result = await privilegedClient().rpc("retire_verification_evidence", {
    requested_actor_id: admin.userId,
    requested_evidence_id: id.parse(evidenceId),
    requested_state: state,
    requested_replacement_id: replacementId ? id.parse(replacementId) : undefined,
    requested_reason: reason,
  });
  fail(result.error);
}

export async function resolveVerificationException(
  exceptionId: string,
  status: "RESOLVED" | "ACCEPTED_LIMITATION",
  resolution: string,
) {
  const admin = await requireActiveAdmin();
  const result = await privilegedClient().rpc("resolve_verification_exception", {
    requested_actor_id: admin.userId,
    requested_exception_id: id.parse(exceptionId),
    requested_status: status,
    requested_resolution: resolution,
  });
  fail(result.error);
}

export async function createVerificationSourceReference(
  input: Readonly<{
    sourceClass: VerificationSourceClass;
    authorityName: string;
    sourceSystem: string;
    sourceName: string;
    officialUrl?: string;
    referenceNumber?: string;
    recordIdentifier?: string;
    accessedAt?: string;
    notes?: string;
  }>,
) {
  const admin = await requireActiveAdmin();
  const result = await privilegedClient().rpc("create_verification_source_reference", {
    requested_actor_id: admin.userId,
    requested_payload: input as Json,
  });
  fail(result.error);
  return result.data;
}
