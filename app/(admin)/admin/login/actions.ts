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
      category: "CLIENT_INIT_FAILURE",
      errorClass: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message.slice(0, 200) : "Initialization failed",
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
      category: "TRANSPORT_FAILURE",
      errorClass: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message.slice(0, 200) : "Transport request failed",
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
        category: "RATE_LIMITED",
        code: authError.code ?? "over_request_rate_limit",
        status: authError.status ?? 429,
        errorClass: authError.name ?? "AuthApiError",
      });
      redirect("/admin/login?reason=rate_limited");
    }

    if (authError.code === "invalid_credentials") {
      console.warn("admin_sign_in_failed", {
        category: "INVALID_CREDENTIALS",
        code: authError.code,
        status: authError.status ?? 400,
        errorClass: authError.name ?? "AuthApiError",
      });
      redirect("/admin/login?reason=invalid_credentials");
    }

    console.error("admin_sign_in_service_error", {
      category: "SERVICE_ERROR",
      code: authError.code ?? "UNKNOWN_AUTH_ERROR",
      status: authError.status ?? 500,
      errorClass: authError.name ?? "AuthApiError",
      message: authError.message
        ? authError.message.slice(0, 200)
        : "Authentication service failure",
    });
    redirect("/admin/login?reason=service_unavailable");
  }

  try {
    await requireActiveAdmin();
  } catch (authorizationError) {
    if (isRedirectSignal(authorizationError)) throw authorizationError;
    await client.auth.signOut({ scope: "local" });
    if (authorizationError instanceof AdminAuthorizationError) {
      redirect(`/admin/login?reason=${authorizationError.reason.toLowerCase()}`);
    }
    console.error("admin_sign_in_authorization_check_failed", {
      category: "SERVICE_ERROR",
      errorClass: authorizationError instanceof Error ? authorizationError.name : "UnknownError",
      message:
        authorizationError instanceof Error
          ? authorizationError.message.slice(0, 200)
          : "Authorization check error",
    });
    redirect("/admin/login?reason=service_unavailable");
  }

  redirect("/admin/dashboard");
}

export async function signOutAdmin(): Promise<never> {
  const client = await createAuthenticatedServerClient();
  await client.auth.signOut({ scope: "local" });
  redirect("/admin/login?reason=signed_out");
}
