import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { beforeAll, describe, expect, it, vi } from "vitest";

import type { AdminPropertyDraftInput } from "@/features/properties/domain/admin-property-draft";
import type { Database } from "@/types/database.generated";

vi.mock("server-only", () => ({}));

let database: SupabaseClient<Database>;
let actorId: string;
let propertyId: string;
let imageId: string;
let documentId: string;
let activeAdminClient: SupabaseClient<Database>;
let nonAdminClient: SupabaseClient<Database>;
let anonymousClient: SupabaseClient<Database>;

const districtId = "00000000-0000-4000-8000-000000000003";
const unitId = "10000000-0000-4000-8000-000000000006";

function draft(): AdminPropertyDraftInput {
  return {
    landCategory: "AGRICULTURAL",
    primaryTransactionType: "BUY",
    listingTitle: "Synthetic M7 integration property",
    districtId,
    displayAreaValue: 2,
    displayAreaUnitId: unitId,
    location: {
      visibility: "HIDDEN",
      privateLatitude: 23.022505,
      privateLongitude: 72.571365,
      publicLatitude: null,
      publicLongitude: null,
      publicAccuracyMetres: null,
      locationNotes: "PRIVATE_M7_COORDINATE_CANARY",
    },
    offer: {
      transactionType: "BUY",
      priceMode: "PRICE_ON_REQUEST",
      currencyCode: "INR",
      negotiable: false,
    },
    categoryDetails: { landCategory: "AGRICULTURAL" },
  };
}

const passivePdf = Buffer.from(
  "%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n2 0 obj << /Type /Page >> endobj\n%%EOF",
);

beforeAll(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !serviceKey || !anonKey)
    throw new Error("Local M7 integration environment is missing.");
  database = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  anonymousClient = createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const password = `Synthetic-${unique}-Only!`;
  const adminEmail = `m7-admin-${unique}@example.invalid`;
  const nonAdminEmail = `m7-user-${unique}@example.invalid`;
  const [admin, nonAdmin] = await Promise.all([
    database.auth.admin.createUser({ email: adminEmail, password, email_confirm: true }),
    database.auth.admin.createUser({ email: nonAdminEmail, password, email_confirm: true }),
  ]);
  if (!admin.data.user || admin.error) throw admin.error ?? new Error("Could not create admin.");
  if (!nonAdmin.data.user || nonAdmin.error)
    throw nonAdmin.error ?? new Error("Could not create non-admin.");
  actorId = admin.data.user.id;
  const profile = await database.from("admin_profiles").insert({
    user_id: actorId,
    display_name: "Synthetic M7 integration admin",
    role: "ADMIN",
    is_active: true,
  });
  if (profile.error) throw profile.error;
  activeAdminClient = createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  nonAdminClient = createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const [adminSession, nonAdminSession] = await Promise.all([
    activeAdminClient.auth.signInWithPassword({ email: adminEmail, password }),
    nonAdminClient.auth.signInWithPassword({ email: nonAdminEmail, password }),
  ]);
  if (adminSession.error) throw adminSession.error;
  if (nonAdminSession.error) throw nonAdminSession.error;
  const { persistPropertyDraft } = await import("@/server/services/property-drafts");
  propertyId = await persistPropertyDraft(database, actorId, draft());
});

describe.sequential("M7 media and private storage integration", () => {
  it("uploads a normalized private-stage image, deduplicates it, and promotes an immutable copy", async () => {
    const source = await sharp({
      create: { width: 1200, height: 800, channels: 3, background: "#997a45" },
    })
      .jpeg()
      .withMetadata({ exif: { IFD0: { ImageDescription: "PRIVATE_EXIF_LOCATION_CANARY" } } })
      .toBuffer();
    const file = new File([source], "owner-private-name.jpg", { type: "image/jpeg" });
    const { approvePropertyMediaWithClient, uploadPropertyImageWithClient } =
      await import("@/server/services/property-media");
    const first = await uploadPropertyImageWithClient(database, actorId, propertyId, file, {
      altText: "Synthetic field frontage",
    });
    imageId = first.id;
    expect(first.duplicate).toBe(false);
    const duplicate = await uploadPropertyImageWithClient(database, actorId, propertyId, file, {
      altText: "Synthetic field frontage",
    });
    expect(duplicate).toEqual({ id: imageId, duplicate: true });
    const staged = await database
      .from("media_assets")
      .select("storage_bucket,object_path,mime_type,checksum_sha256,visibility")
      .eq("id", imageId)
      .single();
    expect(staged.data).toMatchObject({
      storage_bucket: "property-media-private",
      mime_type: "image/webp",
      visibility: "ADMIN_ONLY",
    });
    expect(staged.data?.object_path).toMatch(
      new RegExp(`^properties/${propertyId}/private-media/[0-9a-f-]+\\.webp$`),
    );
    await approvePropertyMediaWithClient(database, actorId, imageId);
    const approved = await database
      .from("media_assets")
      .select("storage_bucket,object_path,visibility,processing_status,approved_at")
      .eq("id", imageId)
      .single();
    expect(approved.data).toMatchObject({
      storage_bucket: "property-media-public",
      visibility: "PUBLIC",
      processing_status: "APPROVED",
    });
    const publicUrl = database.storage
      .from("property-media-public")
      .getPublicUrl(approved.data?.object_path as string).data.publicUrl;
    expect((await fetch(publicUrl)).status).toBe(200);
  });

  it("processes photo batches independently and selects the first approved cover", async () => {
    const firstSource = await sharp({
      create: { width: 1200, height: 800, channels: 3, background: "#789267" },
    })
      .jpeg()
      .toBuffer();
    const secondSource = await sharp({
      create: { width: 1200, height: 800, channels: 3, background: "#675a92" },
    })
      .png()
      .toBuffer();
    const { uploadPropertyImagesBatchWithClient } =
      await import("@/server/services/property-media");
    const result = await uploadPropertyImagesBatchWithClient(database, actorId, propertyId, [
      new File([firstSource], "front-view.jpg", { type: "image/jpeg" }),
      new File(["not an image"], "invalid-file.png", { type: "image/png" }),
      new File([secondSource], "road-view.png", { type: "image/png" }),
    ]);

    expect(result.uploaded).toBe(2);
    expect(result.results).toEqual([
      expect.objectContaining({ fileName: "front-view.jpg", ok: true }),
      expect.objectContaining({ fileName: "invalid-file.png", ok: false }),
      expect.objectContaining({ fileName: "road-view.png", ok: true }),
    ]);
    const rows = await database
      .from("media_assets")
      .select("mime_type,storage_bucket,visibility,processing_status,is_cover,alt_text")
      .eq("property_id", propertyId)
      .eq("media_type", "IMAGE")
      .is("archived_at", null)
      .order("sort_order");
    expect(rows.error).toBeNull();
    expect(rows.data?.filter((row) => row.processing_status === "APPROVED")).toHaveLength(3);
    expect(rows.data?.filter((row) => row.is_cover)).toHaveLength(1);
    const coverId = rows.data?.find((row) => row.is_cover)?.alt_text;
    expect(rows.data?.slice(1)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          mime_type: "image/webp",
          storage_bucket: "property-media-public",
          visibility: "PUBLIC",
          alt_text: "Synthetic M7 integration property - property photo 2",
        }),
        expect.objectContaining({
          mime_type: "image/webp",
          storage_bucket: "property-media-public",
          visibility: "PUBLIC",
          alt_text: "Synthetic M7 integration property - property photo 3",
        }),
      ]),
    );

    const laterSource = await sharp({
      create: { width: 1200, height: 800, channels: 3, background: "#92675a" },
    })
      .webp()
      .toBuffer();
    await uploadPropertyImagesBatchWithClient(database, actorId, propertyId, [
      new File([laterSource], "later-view.webp", { type: "image/webp" }),
    ]);
    const coverAfterLaterUpload = await database
      .from("media_assets")
      .select("alt_text")
      .eq("property_id", propertyId)
      .eq("is_cover", true)
      .is("archived_at", null)
      .single();
    expect(coverAfterLaterUpload.data?.alt_text).toBe(coverId);
  });

  it("lets one cover choice safely finish an older staged photo", async () => {
    const source = await sharp({
      create: { width: 1200, height: 800, channels: 3, background: "#446688" },
    })
      .jpeg()
      .toBuffer();
    const { setPropertyCoverWithClient, uploadPropertyImageWithClient } =
      await import("@/server/services/property-media");
    const staged = await uploadPropertyImageWithClient(
      database,
      actorId,
      propertyId,
      new File([source], "older-staged-photo.jpg", { type: "image/jpeg" }),
    );

    await setPropertyCoverWithClient(database, actorId, propertyId, staged.id);

    const selected = await database
      .from("media_assets")
      .select("storage_bucket,visibility,processing_status,is_cover,alt_text")
      .eq("id", staged.id)
      .single();
    expect(selected.error).toBeNull();
    expect(selected.data).toMatchObject({
      storage_bucket: "property-media-public",
      visibility: "PUBLIC",
      processing_status: "APPROVED",
      is_cover: true,
    });
    expect(selected.data?.alt_text).toBe("Synthetic M7 integration property - property photo");
  });

  it("normalizes external video identity without storing a video binary", async () => {
    const { addExternalPropertyMediaWithClient } = await import("@/server/services/property-media");
    const first = await addExternalPropertyMediaWithClient(
      database,
      actorId,
      propertyId,
      "DRONE_VIDEO",
      "https://youtu.be/AbCdEf12345?utm_source=private",
    );
    const duplicate = await addExternalPropertyMediaWithClient(
      database,
      actorId,
      propertyId,
      "DRONE_VIDEO",
      "https://www.youtube.com/watch?v=AbCdEf12345&feature=share",
    );
    expect(duplicate).toEqual({ id: first.id, duplicate: true });
    const row = await database
      .from("media_assets")
      .select(
        "external_url,external_provider,external_media_id,storage_bucket,object_path,media_subtype",
      )
      .eq("id", first.id)
      .single();
    expect(row.data).toMatchObject({
      external_url: "https://www.youtube.com/watch?v=AbCdEf12345",
      external_provider: "YOUTUBE",
      external_media_id: "AbCdEf12345",
      storage_bucket: null,
      object_path: null,
      media_subtype: "DRONE_VIDEO",
    });
  });

  it("connects, replaces, and archives a canonical Google Drive brochure", async () => {
    const { saveGoogleDriveBrochureWithClient } = await import("@/server/services/property-media");
    const first = await saveGoogleDriveBrochureWithClient(
      database,
      actorId,
      propertyId,
      "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz_12345/view?usp=sharing",
    );
    expect(first).toMatchObject({ duplicate: false, replaced: false });
    const firstRow = await database
      .from("media_assets")
      .select(
        "external_url,external_provider,external_media_id,storage_bucket,object_path,visibility,processing_status,scan_status",
      )
      .eq("id", first.id)
      .single();
    expect(firstRow.data).toMatchObject({
      external_url: "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz_12345/view",
      external_provider: "GOOGLE_DRIVE",
      external_media_id: "1AbCdEfGhIjKlMnOpQrStUvWxYz_12345",
      storage_bucket: null,
      object_path: null,
      visibility: "PUBLIC",
      processing_status: "APPROVED",
      scan_status: null,
    });

    const replacement = await saveGoogleDriveBrochureWithClient(
      database,
      actorId,
      propertyId,
      "https://drive.google.com/open?id=2BcDeFgHiJkLmNoPqRsTuVwXyZ_67890",
    );
    expect(replacement).toMatchObject({ duplicate: false, replaced: true });
    const oldRow = await database
      .from("media_assets")
      .select("archived_at")
      .eq("id", first.id)
      .single();
    expect(oldRow.data?.archived_at).not.toBeNull();

    await expect(
      saveGoogleDriveBrochureWithClient(database, actorId, propertyId, "javascript:alert(1)"),
    ).rejects.toThrow(/valid Google Drive file link/);

    // The public wrapper uses the same archive RPC; archive directly with the service-role
    // client here so the integration test remains independent of request authentication.
    const removed = await database.rpc("archive_property_media", {
      requested_actor_id: actorId,
      requested_media_id: replacement.id,
    });
    expect(removed.error).toBeNull();
    const active = await database
      .from("media_assets")
      .select("id")
      .eq("property_id", propertyId)
      .eq("media_type", "BROCHURE")
      .is("archived_at", null);
    expect(active.data).toEqual([]);
  });

  it("keeps unpublished media out of anonymous public application projections", async () => {
    const result = await anonymousClient
      .from("public_property_media")
      .select("*")
      .eq("property_id", propertyId);
    expect(result.error).toBeNull();
    expect(result.data).toEqual([]);
    expect(JSON.stringify(result.data)).not.toContain("PRIVATE_");
  });

  it("stores owner/legal evidence only in the private document boundary", async () => {
    const { uploadPrivatePropertyDocumentWithClient } =
      await import("@/server/services/property-media");
    const result = await uploadPrivatePropertyDocumentWithClient(
      database,
      actorId,
      propertyId,
      "LEGAL_DOCUMENT",
      new File([passivePdf], "PRIVATE_OWNER_TITLE_RECORD.pdf", { type: "application/pdf" }),
    );
    documentId = result.id;
    expect(result.scanStatus).toBe("CLEAN");
    const row = await database
      .from("private_documents")
      .select("storage_bucket,object_path,visibility,scan_status")
      .eq("id", documentId)
      .single();
    expect(row.data).toMatchObject({
      storage_bucket: "verification-documents-private",
      visibility: "PRIVATE",
      scan_status: "CLEAN",
    });
    expect(row.data?.object_path).toMatch(
      new RegExp(`^properties/${propertyId}/documents/[0-9a-f-]+\\.pdf$`),
    );
  });

  it("denies private reads/path guesses and every direct browser storage mutation", async () => {
    const guessed = `properties/${propertyId}/documents/${documentId}.pdf`;
    for (const client of [anonymousClient, nonAdminClient, activeAdminClient]) {
      const privateList = await client.storage.from("verification-documents-private").list("");
      expect(privateList.data ?? []).toEqual([]);
      expect(JSON.stringify(privateList.data)).not.toContain(documentId);
      const privateDownload = await client.storage
        .from("verification-documents-private")
        .download(guessed);
      expect(privateDownload.error).not.toBeNull();
      const privateUpload = await client.storage
        .from("verification-documents-private")
        .upload(`attacker/${Date.now()}.pdf`, passivePdf, { contentType: "application/pdf" });
      expect(privateUpload.error).not.toBeNull();
      const publicUpload = await client.storage
        .from("property-media-public")
        .upload(`attacker/${Date.now()}.webp`, Buffer.from("not-an-image"), {
          contentType: "image/webp",
        });
      expect(publicUpload.error).not.toBeNull();
      const privateBucketMutation = await client.storage.updateBucket(
        "verification-documents-private",
        { public: true },
      );
      expect(privateBucketMutation.error).not.toBeNull();
    }
    const privateRows = await nonAdminClient.from("private_documents").select("id,object_path");
    expect(privateRows.data ?? []).toEqual([]);
    expect(JSON.stringify(privateRows.data)).not.toContain(documentId);
  });

  it("mints only resource-authorized temporary URLs and rejects path swaps and expiry", async () => {
    const { createPrivateDocumentSignedUrlWithClient } =
      await import("@/server/services/property-media");
    const signed = await createPrivateDocumentSignedUrlWithClient(
      database,
      actorId,
      documentId,
      "EXPIRY_TEST",
      1,
    );
    expect(signed.expiresInSeconds).toBe(1);
    expect((await fetch(signed.signedUrl)).status).toBe(200);
    const swapped = signed.signedUrl.replace(documentId, "ffffffff-ffff-4fff-8fff-ffffffffffff");
    expect((await fetch(swapped)).status).not.toBe(200);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    expect((await fetch(signed.signedUrl)).status).not.toBe(200);
    const audit = await database
      .from("audit_logs")
      .select("actor_admin_id,after_state,before_state,reason")
      .eq("entity_id", documentId)
      .eq("action", "DOCUMENT_ACCESS")
      .single();
    expect(audit.data?.actor_admin_id).toBe(actorId);
    expect(JSON.stringify(audit.data)).not.toContain("/storage/v1/object/sign");
  });
});
