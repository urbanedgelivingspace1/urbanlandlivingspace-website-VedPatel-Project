import "server-only";

import {
  AdminAuthorizationError,
  authorizeAdminIdentity,
  type ActiveAdmin,
} from "@/features/admin/domain/authorization";
import { createAuthenticatedServerClient } from "@/server/supabase/authenticated";

export async function requireActiveAdmin(): Promise<ActiveAdmin> {
  const client = await createAuthenticatedServerClient();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) {
    console.warn("admin_authorization_denied", { reason: "NO_SESSION" });
    throw new AdminAuthorizationError("NO_SESSION");
  }

  const { data: profile, error: profileError } = await client
    .from("admin_profiles")
    .select("user_id, display_name, role, is_active")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (profileError || !profile?.is_active) {
    console.warn("admin_authorization_denied", { reason: "NOT_ACTIVE_ADMIN" });
    throw new AdminAuthorizationError("NOT_ACTIVE_ADMIN");
  }

  return authorizeAdminIdentity(userData.user, profile);
}
