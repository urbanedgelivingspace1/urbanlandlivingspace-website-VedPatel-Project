"use server";

import { redirect } from "next/navigation";

import { AdminAuthorizationError } from "@/features/admin/domain/authorization";
import { adminLoginSchema } from "@/lib/validation/auth-schemas";
import { requireActiveAdmin } from "@/server/auth/authorization";
import { createAuthenticatedServerClient } from "@/server/supabase/authenticated";

export async function signInAdmin(formData: FormData): Promise<never> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/admin/login?reason=invalid_input");

  const client = await createAuthenticatedServerClient();
  const { error } = await client.auth.signInWithPassword(parsed.data);
  if (error) {
    console.warn("admin_sign_in_failed", { reason: "INVALID_CREDENTIALS" });
    redirect("/admin/login?reason=invalid_credentials");
  }

  try {
    await requireActiveAdmin();
  } catch (authorizationError) {
    await client.auth.signOut();
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
  await client.auth.signOut();
  redirect("/admin/login?reason=signed_out");
}
