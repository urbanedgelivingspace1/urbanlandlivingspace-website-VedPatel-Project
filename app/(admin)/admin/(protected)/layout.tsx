import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { signOutAdmin } from "@/app/(admin)/admin/login/actions";
import { AdminAuthorizationError } from "@/features/admin/domain/authorization";
import { requireActiveAdmin } from "@/server/auth/authorization";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  let admin;
  try {
    admin = await requireActiveAdmin();
  } catch (error) {
    const reason =
      error instanceof AdminAuthorizationError ? error.reason.toLowerCase() : "unauthorized";
    redirect(`/admin/login?reason=${reason}`);
  }

  return (
    <AdminShell admin={admin} signOutAction={signOutAdmin}>
      {children}
    </AdminShell>
  );
}
