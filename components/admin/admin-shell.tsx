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
    <div className="admin-app min-h-screen text-slate-950">
      <header className="admin-topbar">
        <Link href="/admin/dashboard" className="flex items-center gap-3 no-underline">
          <span className="admin-brand-mark">UE</span>
          <span>
            <span className="block text-sm font-bold tracking-wide">UrbanEdge</span>
            <span className="block text-[11px] text-emerald-100/65">Real-estate operations</span>
          </span>
        </Link>
        <form action="/admin/leads" className="admin-global-search" role="search">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            name="q"
            aria-label="Search customers, phone or email"
            placeholder="Search customers or phone…"
          />
        </form>
        <div className="flex items-center gap-2 sm:gap-3">
          <details className="admin-create-menu">
            <summary>+ Create</summary>
            <div>
              <Link href="/admin/leads/new">New lead</Link>
              <Link href="/admin/properties/new">New property</Link>
              <Link href="/admin/submissions">Seller enquiry</Link>
              <Link href="/admin/site-visits">Site visit</Link>
            </div>
          </details>
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
      <div className="mx-auto grid max-w-[1800px] md:grid-cols-[15rem_1fr]">
        <aside className="admin-sidebar">
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
        <main className="min-w-0 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-12">{children}</main>
      </div>
      <nav aria-label="Quick actions" className="admin-mobile-actions">
        <Link href="/admin/leads">Leads</Link>
        <Link href="/admin/follow-ups">Follow-ups</Link>
        <Link href="/admin/leads/new" className="admin-mobile-add">
          +
        </Link>
        <Link href="/admin/site-visits">Visits</Link>
        <Link href="/admin/properties">Properties</Link>
      </nav>
    </div>
  );
}
