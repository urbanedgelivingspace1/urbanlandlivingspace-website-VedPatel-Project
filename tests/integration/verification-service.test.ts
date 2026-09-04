import { createClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it, vi } from "vitest";

import type { AdminPropertyDraftInput } from "@/features/properties/domain/admin-property-draft";
import type { Database } from "@/types/database.generated";

vi.mock("server-only", () => ({}));

let actorId: string;
let propertyId: string;
let identityCheckId: string;
let cleanDocumentId: string;

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Local integration environment is missing.");
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const draft: AdminPropertyDraftInput = {
  landCategory: "AGRICULTURAL",
  primaryTransactionType: "BUY",
  listingTitle: "Synthetic M8 integration property",
  districtId: "00000000-0000-4000-8000-000000000003",
  displayAreaValue: 2,
  displayAreaUnitId: "10000000-0000-4000-8000-000000000006",
  location: {
    visibility: "HIDDEN",
    privateLatitude: null,
    privateLongitude: null,
    publicLatitude: null,
    publicLongitude: null,
    publicAccuracyMetres: null,
  },
  offer: {
    transactionType: "BUY",
    currencyCode: "INR",
    priceMode: "PRICE_ON_REQUEST",
    negotiable: false,
  },
  categoryDetails: { landCategory: "AGRICULTURAL", irrigationStatus: "CHECK_PENDING" },
  sourceLink: { sourceType: "SYNTHETIC_INTEGRATION", sourceName: "M8 fixture" },
};

beforeAll(async () => {
  const database = client();
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const created = await database.auth.admin.createUser({
    email: `m8-integration-${unique}@example.invalid`,
    password: `Synthetic-${unique}-Only!`,
    email_confirm: true,
  });
  if (created.error || !created.data.user)
    throw created.error ?? new Error("Actor creation failed.");
  actorId = created.data.user.id;
  const profile = await database.from("admin_profiles").insert({
    user_id: actorId,
    display_name: "Synthetic M8 verifier",
    role: "VERIFIER",
    is_active: true,
  });
  if (profile.error) throw profile.error;
  const { persistPropertyDraft } = await import("@/server/services/property-drafts");
  propertyId = await persistPropertyDraft(database, actorId, draft);
});

describe.sequential("M8 verification service integration", () => {
  it("initializes the agricultural plan with explicit non-applicable category checks", async () => {
    const { getAdminVerificationDetailWithClient, initializePropertyVerificationsWithClient } =
      await import("@/server/services/verifications");
    await expect(
      initializePropertyVerificationsWithClient(client(), actorId, propertyId),
    ).resolves.toBeGreaterThanOrEqual(27);
    const detail = await getAdminVerificationDetailWithClient(client(), propertyId);
    expect(detail?.checks.filter((check) => check.applicability === "APPLICABLE")).toHaveLength(16);
    expect(
      detail?.checks.find((check) => check.definition.code === "GIDC_RECORDS_REVIEWED")
        ?.applicability,
    ).toBe("NOT_APPLICABLE");
    identityCheckId = detail?.checks.find(
      (check) => check.definition.code === "PROPERTY_IDENTITY_REVIEWED",
    )?.id as string;
  });

  it("blocks a pass without evidence and rejects a pending private document", async () => {
    const { linkVerificationEvidenceWithClient, transitionVerificationWithClient } =
      await import("@/server/services/verifications");
    await transitionVerificationWithClient(client(), actorId, identityCheckId, "IN_REVIEW");
    await expect(
      transitionVerificationWithClient(client(), actorId, identityCheckId, "PASSED", {
        scopeStatement: "Parcel identity references for the named synthetic property.",
      }),
    ).rejects.toThrow(/eligible evidence/);
    const pendingId = crypto.randomUUID();
    const pending = await client()
      .from("private_documents")
      .insert({
        id: pendingId,
        property_id: propertyId,
        document_type: "OWNER_DOCUMENT",
        storage_bucket: "verification-documents-private",
        object_path: `properties/${propertyId}/verification/${pendingId}.pdf`,
        mime_type: "application/pdf",
        scan_status: "PENDING",
        original_file_name: "pending-owner-record.pdf",
        visibility: "PRIVATE",
        created_by: actorId,
        updated_by: actorId,
      });
    if (pending.error) throw pending.error;
    await expect(
      linkVerificationEvidenceWithClient(client(), actorId, identityCheckId, {
        privateDocumentId: pendingId,
        evidenceType: "OWNER_DOCUMENT",
        sourceClass: "URBANEDGE_OPERATIONAL_POLICY",
      }),
    ).rejects.toThrow(/clean trusted scan/);
  });

  it("completes document → review → scoped result without enabling public output", async () => {
    const {
      getAdminVerificationDetailWithClient,
      linkVerificationEvidenceWithClient,
      transitionVerificationWithClient,
    } = await import("@/server/services/verifications");
    cleanDocumentId = crypto.randomUUID();
    const database = client();
    const inserted = await database.from("private_documents").insert({
      id: cleanDocumentId,
      property_id: propertyId,
      document_type: "OWNER_DOCUMENT",
      storage_bucket: "verification-documents-private",
      object_path: `properties/${propertyId}/verification/${cleanDocumentId}.pdf`,
      mime_type: "application/pdf",
      scan_status: "CLEAN",
      original_file_name: "private-owner-identity.pdf",
      visibility: "PRIVATE",
      created_by: actorId,
      updated_by: actorId,
    });
    if (inserted.error) throw inserted.error;
    const evidenceId = await linkVerificationEvidenceWithClient(
      database,
      actorId,
      identityCheckId,
      {
        privateDocumentId: cleanDocumentId,
        evidenceType: "OWNER_DOCUMENT",
        sourceClass: "URBANEDGE_OPERATIONAL_POLICY",
        evidenceReference: "SYNTHETIC-IDENTITY",
      },
    );
    if (!evidenceId) throw new Error("Evidence link did not return an identifier.");
    const advanced = await database.rpc("advance_verification_evidence", {
      requested_actor_id: actorId,
      requested_evidence_id: evidenceId,
      requested_state: "REVIEWED",
    });
    if (advanced.error) throw advanced.error;
    await transitionVerificationWithClient(database, actorId, identityCheckId, "PASSED_WITH_NOTE", {
      scopeStatement:
        "Survey number and parcel reference were compared for this synthetic property fixture.",
      limitations: "Identity correspondence only; no boundary or title conclusion.",
      notes: "The available record is owner-provided and was not source-verified.",
      riskLevel: "LOW",
      recheckAt: "2099-01-01T00:00:00Z",
    });
    const detail = await getAdminVerificationDetailWithClient(database, propertyId);
    const check = detail?.checks.find((item) => item.id === identityCheckId);
    expect(check).toMatchObject({
      status: "PASSED_WITH_NOTE",
      publicVisible: false,
      publicDisclosureEligible: false,
    });
    expect(check?.evidence[0]?.provenance).toBe("REVIEWED");
    expect(check?.reviewedAt).not.toBeNull();
    const publicRows = await database
      .from("public_property_verification_summaries")
      .select("id")
      .eq("property_id", propertyId);
    expect(publicRows.data).toEqual([]);
  });

  it("records safe actor-attributed audit/history without private paths or filenames", async () => {
    const database = client();
    const [history, audits] = await Promise.all([
      database
        .from("verification_history")
        .select("event_type")
        .eq("property_verification_id", identityCheckId),
      database
        .from("audit_logs")
        .select("actor_admin_id,before_state,after_state")
        .eq("actor_admin_id", actorId)
        .eq("action", "VERIFICATION_CHANGE"),
    ]);
    expect(history.data?.map(({ event_type }) => event_type)).toEqual(
      expect.arrayContaining(["STATUS_CHANGED", "EVIDENCE_LINKED", "EVIDENCE_REVIEWED"]),
    );
    const auditPayload = JSON.stringify(audits.data);
    expect(auditPayload).not.toContain("private-owner-identity.pdf");
    expect(auditPayload).not.toContain(cleanDocumentId);
    expect(audits.data?.every(({ actor_admin_id }) => actor_admin_id === actorId)).toBe(true);
  });
});
