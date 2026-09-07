"use server";

import { redirect } from "next/navigation";

import { AdminAuthorizationError } from "@/features/admin/domain/authorization";
import { adminLoginSchema } from "@/lib/validation/auth-schemas";
import { requireActiveAdmin } from "@/server/auth/authorization";
import { createAuthenticatedServerClient } from "@/server/supabase/authenticated";

function isRedirectSignal(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    ((error as { digest: string }).digest.startsWith("NEXT_REDIRECT") ||
      (error as { digest: string }).digest.startsWith("NEXT_NOT_FOUND"))
  );
}

export async function signInAdmin(formData: FormData): Promise<never> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/admin/login?reason=invalid_input");

  let client;
  try {
    client = await createAuthenticatedServerClient();
  } catch (error) {
    if (isRedirectSignal(error)) throw error;
    console.error("admin_sign_in_client_init_failed", {
      error: error instanceof Error ? error.name : "UnknownError",
    });
    redirect("/admin/login?reason=service_unavailable");
  }

  let authError;
  try {
    const { error } = await client.auth.signInWithPassword(parsed.data);
    authError = error;
  } catch (error) {
    if (isRedirectSignal(error)) throw error;
    console.error("admin_sign_in_transport_failed", {
      error: error instanceof Error ? error.name : "UnknownError",
    });
    redirect("/admin/login?reason=service_unavailable");
  }

  if (authError) {
    const isRateLimited =
      authError.status === 429 ||
      authError.code === "over_request_rate_limit" ||
      authError.code === "over_email_send_rate_limit";

    if (isRateLimited) {
      console.warn("admin_sign_in_rate_limited", {
        status: authError.status,
        code: authError.code,
      });
      redirect("/admin/login?reason=rate_limited");
    }

    const isInvalidCredentials =
      authError.code === "invalid_credentials" ||
      authError.code === "invalid_grant" ||
      authError.code === "validation_failed" ||
      authError.status === 400;

    if (isInvalidCredentials) {
      console.warn("admin_sign_in_failed", {
        reason: "INVALID_CREDENTIALS",
        code: authError.code,
      });
      redirect("/admin/login?reason=invalid_credentials");
    }

    console.error("admin_sign_in_service_error", {
      status: authError.status ?? 500,
      code: authError.code ?? "UNKNOWN_AUTH_ERROR",
    });
    redirect("/admin/login?reason=service_unavailable");
  }

  try {
    await requireActiveAdmin();
  } catch (authorizationError) {
    if (isRedirectSignal(authorizationError)) throw authorizationError;
    await client.auth.signOut({ scope: "local" });
    const reason =
      authorizationError instanceof AdminAuthorizationError
        ? authorizationError.reason.toLowerCase()
        : "unauthorized";
    redirect(`/admin/login?reason=${reason}`);
  }

  redirect("/admin/dashboard");
}

export async function signOutAdmin(): Promise<never> {
  const client = await createAuthenticatedServerClient();
  await client.auth.signOut({ scope: "local" });
  redirect("/admin/login?reason=signed_out");
}
