import { createClient } from "@supabase/supabase-js";

import { assertSafeTestEnvironment } from "@/lib/testing/environment-safety";

export default async function globalSetup() {
  assertSafeTestEnvironment({
    APP_ENV: process.env.APP_ENV,
    TEST_SUPABASE_PROJECT_REF: process.env.TEST_SUPABASE_PROJECT_REF,
    PRODUCTION_SUPABASE_PROJECT_REF: process.env.PRODUCTION_SUPABASE_PROJECT_REF,
    TEST_TARGET_URL: process.env.TEST_TARGET_URL,
    PRODUCTION_SITE_URL: process.env.PRODUCTION_SITE_URL,
    TEST_SAFETY_TOKEN: process.env.TEST_SAFETY_TOKEN,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Local E2E Supabase configuration is missing.");

  const client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const password = `Synthetic-${unique}-Only!`;
  const createdUserIds: string[] = [];
  const createSyntheticUser = async (kind: string) => {
    const email = `synthetic-${kind}-${unique}@example.invalid`;
    const { data, error } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) throw error ?? new Error("Synthetic user creation failed.");
    createdUserIds.push(data.user.id);
    return { id: data.user.id, email };
  };

  const active = await createSyntheticUser("active-admin");
  const inactive = await createSyntheticUser("inactive-admin");
  const nonAdmin = await createSyntheticUser("non-admin");

  const { error: profileError } = await client.from("admin_profiles").insert([
    {
      user_id: active.id,
      display_name: "Synthetic E2E Admin",
      role: "ADMIN",
      is_active: true,
    },
    {
      user_id: inactive.id,
      display_name: "Synthetic Inactive Admin",
      role: "ADMIN",
      is_active: false,
    },
  ]);
  if (profileError) {
    await Promise.all(createdUserIds.map((id) => client.auth.admin.deleteUser(id)));
    throw profileError;
  }

  process.env.E2E_ADMIN_EMAIL = active.email;
  process.env.E2E_INACTIVE_ADMIN_EMAIL = inactive.email;
  process.env.E2E_NON_ADMIN_EMAIL = nonAdmin.email;
  process.env.E2E_ADMIN_PASSWORD = password;

  return async () => {
    // Append-only M6 audit rows intentionally retain their actor FK. Clean actors
    // that produced no audit history; the guarded local suite is followed by a
    // database reset, which removes the remaining synthetic actor with its audit.
    const { data: auditActors } = await client
      .from("audit_logs")
      .select("actor_admin_id")
      .in("actor_admin_id", createdUserIds);
    const retained = new Set((auditActors ?? []).map((row) => row.actor_admin_id));
    const removable = createdUserIds.filter((id) => !retained.has(id));
    if (removable.length > 0) {
      await client.from("admin_profiles").delete().in("user_id", removable);
      await Promise.all(removable.map((id) => client.auth.admin.deleteUser(id)));
    }
  };
}
