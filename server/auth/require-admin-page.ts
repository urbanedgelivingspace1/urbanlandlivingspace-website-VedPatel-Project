import "server-only";

import { redirect } from "next/navigation";

import { AdminAuthorizationError } from "@/features/admin/domain/authorization";
import { requireActiveAdmin } from "@/server/auth/authorization";

export async function requireActiveAdminPage() {
  try {
    return await requireActiveAdmin();
  } catch (error) {
    const reason =
      error instanceof AdminAuthorizationError ? error.reason.toLowerCase() : "unauthorized";
    redirect(`/admin/login?reason=${reason}`);
  }
}
