import type { ReactNode } from "react";

import type { ActiveAdmin } from "@/features/admin/domain/authorization";

type AdminShellProps = Readonly<{
  admin: ActiveAdmin;
  signOutAction: () => Promise<never>;
  children: ReactNode;
}>;

const groups = [
  { label: "Workspace", items: ["Dashboard"] },
  { label: "Inventory", items: ["Properties", "Media", "Verification"] },
  { label: "Operations", items: ["Leads", "Site visits", "Owner submissions"] },
  { label: "Publishing", items: ["Guides", "SEO pages", "Settings"] },
] as const;

export function AdminShell({ admin, signOutAction, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="flex min-h-16 items-center justify-between gap-4 bg-slate-950 px-4 py-3 text-white sm:px-6">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--brand-gold)] uppercase">
            UrbanEdge
          </p>
          <p className="font-display text-lg">Land Space Admin</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right text-xs sm:block">
            <p className="font-semibold">{admin.displayName}</p>
            <p className="text-slate-400">{admin.role.replaceAll("_", " ")}</p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1600px] md:grid-cols-[15rem_1fr]">
        <aside className="border-b border-slate-200 bg-white md:min-h-[calc(100vh-4rem)] md:border-r md:border-b-0">
          <details className="group md:hidden">
            <summary className="cursor-pointer px-5 py-4 font-semibold">Admin navigation</summary>
            <AdminNavigation />
          </details>
          <div className="hidden md:block">
            <AdminNavigation />
          </div>
        </aside>
        <main className="min-w-0 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

function AdminNavigation() {
  return (
    <nav aria-label="Admin" className="space-y-6 px-5 pt-2 pb-6 md:pt-6">
      {groups.map((group) => (
        <section key={group.label} aria-labelledby={`nav-${group.label.toLowerCase()}`}>
          <h2
            id={`nav-${group.label.toLowerCase()}`}
            className="text-xs font-bold tracking-wider text-slate-500 uppercase"
          >
            {group.label}
          </h2>
          <ul className="mt-2 space-y-1">
            {group.items.map((item) => (
              <li key={item}>
                {item === "Dashboard" ? (
                  <a
                    href="/admin/dashboard"
                    className="block rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold"
                  >
                    {item}
                  </a>
                ) : (
                  <span
                    className="block rounded-lg px-3 py-2 text-sm text-slate-500"
                    title="Available in a later milestone"
                  >
                    {item}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}
