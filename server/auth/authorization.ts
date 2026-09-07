import "server-only";

import { cache } from "react";

import {
  AdminAuthorizationError,
  authorizeAdminIdentity,
  type ActiveAdmin,
} from "@/features/admin/domain/authorization";
import { logAdminPerf } from "@/server/admin-perf";
import { createAuthenticatedServerClient } from "@/server/supabase/authenticated";

export const requireActiveAdmin = cache(async (): Promise<ActiveAdmin> => {
  const authStart = performance.now();
  const client = await createAuthenticatedServerClient();

  const getUserStart = performance.now();
  const { data: userData, error: userError } = await client.auth.getUser();
  const getUserMs = performance.now() - getUserStart;

  if (userError || !userData.user) {
    console.warn("admin_authorization_denied", { reason: "NO_SESSION" });
    throw new AdminAuthorizationError("NO_SESSION");
  }

  const profileStart = performance.now();
  const { data: profile, error: profileError } = await client
    .from("admin_profiles")
    .select("user_id, display_name, role, is_active")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  const adminAuthMs = performance.now() - profileStart;

  if (profileError || !profile?.is_active) {
    console.warn("admin_authorization_denied", { reason: "NOT_ACTIVE_ADMIN" });
    throw new AdminAuthorizationError("NOT_ACTIVE_ADMIN");
  }

  const totalAuthMs = performance.now() - authStart;
  logAdminPerf({
    route: "auth:requireActiveAdmin",
    authMs: totalAuthMs,
    getUserMs,
    adminAuthMs,
  });

  return authorizeAdminIdentity(userData.user, profile);
});
