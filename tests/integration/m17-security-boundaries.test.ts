import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Database } from "@/types/database.generated";

const sensitiveTables = [
  "parties",
  "leads",
  "lead_requirements",
  "lead_activities",
  "lead_follow_ups",
  "site_visits",
  "owner_submissions",
  "private_documents",
  "verification_evidence",
  "verification_history",
  "audit_logs",
  "property_locations",
] as const;

let apiUrl: string;
let anonKey: string;
let serviceClient: ReturnType<typeof createClient<Database>>;
let userId: string;
let accessToken: string;

function restHeaders(token: string) {
  return { apikey: anonKey, authorization: `Bearer ${token}`, "content-type": "application/json" };
}

beforeAll(async () => {
  apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!apiUrl || !anonKey || !serviceKey) throw new Error("Local M17 test environment is missing.");

  serviceClient = createClient<Database>(apiUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const email = `m17-boundary-${unique}@example.invalid`;
  const password = `Synthetic-${unique}-Only!`;
  const created = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (created.error || !created.data.user)
    throw created.error ?? new Error("Could not create M17 actor.");
  userId = created.data.user.id;
  const browser = createClient<Database>(apiUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const signedIn = await browser.auth.signInWithPassword({ email, password });
  if (signedIn.error || !signedIn.data.session)
    throw signedIn.error ?? new Error("Could not authenticate M17 actor.");
  accessToken = signedIn.data.session.access_token;
});

afterAll(async () => {
  if (userId) await serviceClient.auth.admin.deleteUser(userId);
});

describe.sequential("M17 browser-to-data security boundaries", () => {
  it("denies anonymous base-table reads and returns no rows to authenticated non-admins", async () => {
    for (const table of sensitiveTables) {
      const anonymous = await fetch(`${apiUrl}/rest/v1/${table}?select=*&limit=1`, {
        headers: restHeaders(anonKey),
      });
      expect(anonymous.ok, `${table} unexpectedly allowed anonymous access`).toBe(false);

      const nonAdmin = await fetch(`${apiUrl}/rest/v1/${table}?select=*&limit=1`, {
        headers: restHeaders(accessToken),
      });
      expect(nonAdmin.status, `${table} non-admin query status`).toBe(200);
      expect(await nonAdmin.json()).toEqual([]);
    }
  });

  it("keeps the search backing view and audit writer outside browser ACLs", async () => {
    for (const token of [anonKey, accessToken]) {
      const backingView = await fetch(
        `${apiUrl}/rest/v1/public_property_search?select=id&limit=1`,
        { headers: restHeaders(token) },
      );
      expect(backingView.ok).toBe(false);

      const auditWriter = await fetch(`${apiUrl}/rest/v1/rpc/write_audit_log`, {
        method: "POST",
        headers: restHeaders(token),
        body: JSON.stringify({ p_action: "CREATE", p_entity_type: "attack" }),
      });
      expect(auditWriter.ok).toBe(false);
    }
  });

  it("denies browser mutation of public views and every guessed private-storage path", async () => {
    for (const token of [anonKey, accessToken]) {
      const projectionMutation = await fetch(
        `${apiUrl}/rest/v1/public_property_listings?id=eq.00000000-0000-4000-8000-000000000000`,
        { method: "DELETE", headers: restHeaders(token) },
      );
      expect(projectionMutation.ok).toBe(false);

      const guessedPrivateObject = await fetch(
        `${apiUrl}/storage/v1/object/authenticated/verification-documents-private/properties/guessed/private.pdf`,
        { headers: restHeaders(token) },
      );
      expect(guessedPrivateObject.ok).toBe(false);

      const publicBucketUpload = await fetch(
        `${apiUrl}/storage/v1/object/property-media-public/attacker/m17.webp`,
        {
          method: "POST",
          headers: { ...restHeaders(token), "content-type": "image/webp" },
          body: "not-an-image",
        },
      );
      expect(publicBucketUpload.ok).toBe(false);
    }
  });
});
