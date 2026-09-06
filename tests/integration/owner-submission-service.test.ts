import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { OWNER_PRIVACY_NOTICE_VERSION } from "@/features/owner-submissions/domain/contracts";
import { ownerSubmissionInputSchema } from "@/features/owner-submissions/domain/validation";

vi.mock("server-only", () => ({}));

let actorId: string;
let approvedSubmissionId: string;
let approvedVersion = 1;
const districtId = "00000000-0000-4000-8000-000000000003";
const unitId = "10000000-0000-4000-8000-000000000006";

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Local integration environment is missing.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function input(
  idempotencyKey: string,
  phone: string,
  landCategory: "AGRICULTURAL" | "NA" | "INDUSTRIAL" = "NA",
) {
  return ownerSubmissionInputSchema.parse({
    action: "OWNER_LAND_SUBMISSION",
    idempotencyKey,
    ownerIntent: "SELL",
    landCategory,
    name: "Synthetic M15 Owner",
    phone,
    preferredContact: "PHONE",
    ownerRelationship: "OWNER",
    districtId,
    talukaText: "Sanand",
    villageText: "Synthetic M15 village",
    locationVisibilityPreference: "HIDDEN",
    privateLatitude: 22.9,
    privateLongitude: 72.3,
    areaValue: 4,
    areaUnitId: unitId,
    priceMode: "EXACT_TOTAL",
    askingPriceAmount: 12_000_000,
    negotiable: true,
    sourceDescription: "Private owner-provided description for controlled review.",
    categoryClaims:
      landCategory === "AGRICULTURAL"
        ? { tenureClaim: "Owner says old tenure", surveyReference: "PRIVATE-M15-AG" }
        : landCategory === "INDUSTRIAL"
          ? { industrialContext: "Owner says private estate", plotReference: "PRIVATE-M15-IN" }
          : { naStatusClaim: "Owner says NA", surveyReference: "PRIVATE-M15" },
    mediaClaims: {},
    contactConsent: true,
    informationDeclaration: true,
    privacyConsent: true,
    publicationReviewAcknowledgement: true,
    documentCertificationAcknowledgement: true,
    privacyNoticeVersion: OWNER_PRIVACY_NOTICE_VERSION,
  });
}

async function approve(submissionId: string) {
  const c = client();
  for (const [next, note] of [
    ["CONTACTED", "Owner reached for review"],
    ["UNDER_REVIEW", null],
    ["APPROVED", null],
  ] as const) {
    const result = await c.rpc("transition_owner_submission", {
      requested_actor_id: actorId,
      requested_submission_id: submissionId,
      requested_expected_version: approvedVersion,
      requested_next_status: next,
      requested_note: note,
    });
    if (result.error) throw result.error;
    approvedVersion += 1;
  }
}

beforeAll(async () => {
  const c = client();
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const user = await c.auth.admin.createUser({
    email: `m15-${unique}@example.invalid`,
    password: `Synthetic-${unique}-Only!`,
    email_confirm: true,
  });
  if (!user.data.user) throw user.error;
  actorId = user.data.user.id;
  const profile = await c.from("admin_profiles").insert({
    user_id: actorId,
    display_name: "Synthetic M15 Admin",
    role: "ADMIN",
    is_active: true,
  });
  if (profile.error) throw profile.error;
});

describe.sequential("M15 owner submission service integration", () => {
  it("persists owner supply atomically without creating inventory", async () => {
    const { persistOwnerSubmission } = await import("@/server/services/owner-submissions");
    approvedSubmissionId = randomUUID();
    const parsed = input(randomUUID(), "9876543215");
    const result = await persistOwnerSubmission(
      client(),
      parsed,
      "1".repeat(64),
      approvedSubmissionId,
      [],
    );
    expect(result).toMatchObject({ target_submission_id: approvedSubmissionId, replayed: false });
    const [submission, consents, properties] = await Promise.all([
      client()
        .from("owner_submissions")
        .select("status,owner_intent,primary_transaction_type,converted_property_id")
        .eq("id", approvedSubmissionId)
        .single(),
      client()
        .from("owner_submission_consents")
        .select("purpose")
        .eq("owner_submission_id", approvedSubmissionId),
      client().from("properties").select("id").eq("id", approvedSubmissionId),
    ]);
    expect(submission.data).toEqual({
      status: "NEW",
      owner_intent: "SELL",
      primary_transaction_type: "BUY",
      converted_property_id: null,
    });
    expect(consents.data).toHaveLength(5);
    expect(properties.data).toEqual([]);
  });

  it("replays the same idempotency key without duplicate state", async () => {
    const { persistOwnerSubmission } = await import("@/server/services/owner-submissions");
    const parsed = input(randomUUID(), "9876543215");
    const replay = await persistOwnerSubmission(
      client(),
      parsed,
      "1".repeat(64),
      approvedSubmissionId,
      [],
    );
    expect(replay).toMatchObject({ target_submission_id: approvedSubmissionId, replayed: true });
    expect(
      (await client().from("owner_submissions").select("id").eq("id", approvedSubmissionId)).data,
    ).toHaveLength(1);
  });

  it("persists Agricultural and Industrial category claims as separate private submissions", async () => {
    const { persistOwnerSubmission } = await import("@/server/services/owner-submissions");
    const cases = [
      ["AGRICULTURAL", "9876543225", "2"],
      ["INDUSTRIAL", "9876543235", "3"],
    ] as const;
    for (const [category, phone, hashCharacter] of cases) {
      const submissionId = randomUUID();
      await persistOwnerSubmission(
        client(),
        input(randomUUID(), phone, category),
        hashCharacter.repeat(64),
        submissionId,
        [],
      );
      const row = await client()
        .from("owner_submissions")
        .select("land_category,category_claims,status")
        .eq("id", submissionId)
        .single();
      expect(row.data?.land_category).toBe(category);
      expect(row.data?.status).toBe("NEW");
      expect(row.data?.category_claims).not.toEqual({});
    }
  });

  it("rolls back an invalid conversion and keeps approval distinct", async () => {
    await approve(approvedSubmissionId);
    const failed = await client().rpc("convert_owner_submission_to_property", {
      requested_actor_id: actorId,
      requested_submission_id: approvedSubmissionId,
      requested_expected_version: approvedVersion,
      requested_payload: { listingTitle: "M15 draft" },
    });
    expect(failed.error?.message).toContain("CURATED_PUBLIC_COPY_REQUIRED");
    const row = await client()
      .from("owner_submissions")
      .select("status,converted_property_id,version")
      .eq("id", approvedSubmissionId)
      .single();
    expect(row.data).toEqual({
      status: "APPROVED",
      converted_property_id: null,
      version: approvedVersion,
    });
  });

  it("allows exactly one concurrent explicit conversion and creates a DRAFT with verification", async () => {
    const payload = {
      listingTitle: "Curated M15 NA land",
      publicDescription: "Reviewed public copy for the draft property.",
      locationVisibility: "APPROXIMATE",
      priceMode: "PRICE_ON_REQUEST",
      negotiable: true,
    };
    const results = await Promise.all([
      client().rpc("convert_owner_submission_to_property", {
        requested_actor_id: actorId,
        requested_submission_id: approvedSubmissionId,
        requested_expected_version: approvedVersion,
        requested_payload: payload,
      }),
      client().rpc("convert_owner_submission_to_property", {
        requested_actor_id: actorId,
        requested_submission_id: approvedSubmissionId,
        requested_expected_version: approvedVersion,
        requested_payload: payload,
      }),
    ]);
    expect(results.filter((result) => !result.error)).toHaveLength(1);
    expect(results.filter((result) => result.error)).toHaveLength(1);
    const submission = await client()
      .from("owner_submissions")
      .select("status,converted_property_id")
      .eq("id", approvedSubmissionId)
      .single();
    const propertyId = submission.data?.converted_property_id;
    expect(submission.data?.status).toBe("CONVERTED");
    const [property, verifications] = await Promise.all([
      client()
        .from("properties")
        .select("publication_status,published_at")
        .eq("id", propertyId)
        .single(),
      client().from("property_verifications").select("id,status").eq("property_id", propertyId),
    ]);
    expect(property.data).toEqual({ publication_status: "DRAFT", published_at: null });
    expect(verifications.data?.length).toBeGreaterThan(0);
    expect(verifications.data?.every((item) => item.status === "NOT_STARTED")).toBe(true);
  });
});
