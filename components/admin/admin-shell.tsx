import Link from "next/link";
import type { ReactNode } from "react";

import { AdminNavigation } from "@/components/admin/admin-navigation";
import type { ActiveAdmin } from "@/features/admin/domain/authorization";

type AdminShellProps = Readonly<{
  admin: ActiveAdmin;
  signOutAction: () => Promise<never>;
  children: ReactNode;
}>;

export function AdminShell({ admin, signOutAction, children }: AdminShellProps) {
  return (
    <div className="admin-app min-h-screen bg-[#f4f6f3] text-slate-950">
      <header className="sticky top-0 z-40 flex min-h-[4.5rem] items-center justify-between gap-4 border-b border-white/10 bg-[#102d27] px-4 py-3 text-white sm:px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-3 no-underline">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-[#d7bd7a]/35 bg-[#d7bd7a]/10 font-display text-xl font-bold text-[#ead9a8]">
            U
          </span>
          <span>
            <span className="block text-sm font-bold tracking-wide">Urban Land</span>
            <span className="block text-xs text-emerald-100/65">Brokerage Admin</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden text-right text-sm sm:block">
            <p className="font-semibold">{admin.displayName}</p>
            <p className="text-xs capitalize text-emerald-100/60">
              {admin.role.replaceAll("_", " ").toLowerCase()}
            </p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="min-h-11 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1680px] md:grid-cols-[15.5rem_1fr]">
        <aside className="border-b border-slate-200 bg-white md:sticky md:top-[4.5rem] md:h-[calc(100vh-4.5rem)] md:border-r md:border-b-0">
          <details className="group md:hidden">
            <summary className="cursor-pointer px-5 py-4 font-semibold">Menu</summary>
            <AdminNavigation
              canManageSecurity={admin.role === "SUPER_ADMIN" || admin.role === "ADMIN"}
            />
          </details>
          <div className="hidden md:block">
            <AdminNavigation
              canManageSecurity={admin.role === "SUPER_ADMIN" || admin.role === "ADMIN"}
            />
          </div>
        </aside>
        <main className="min-w-0 p-4 sm:p-7 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
