"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "home" },
  { label: "Properties", href: "/admin/properties", icon: "property" },
  { label: "Leads", href: "/admin/leads", icon: "people" },
] as const;

const secondaryItems = [
  { label: "Seller enquiries", href: "/admin/submissions" },
  { label: "Guides & website", href: "/admin/guides" },
  { label: "Website settings", href: "/admin/settings/seo" },
] as const;

export function AdminNavigation({ canManageSecurity }: Readonly<{ canManageSecurity: boolean }>) {
  const pathname = usePathname() ?? "";
  const isCurrent = (href: string) =>
    href === "/admin/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label="Admin" className="px-3 py-4 md:px-4 md:py-6">
      <p className="px-3 text-xs font-bold tracking-[0.14em] text-slate-400 uppercase">Main</p>
      <ul className="mt-2 space-y-1">
        {primaryItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              prefetch={false}
              aria-current={isCurrent(item.href) ? "page" : undefined}
              className="admin-nav-link"
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <details className="mt-8 border-t border-slate-200 pt-5">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100">
          More
          <span aria-hidden="true" className="text-slate-400">
            ⌄
          </span>
        </summary>
        <ul className="mt-1 space-y-1">
          {secondaryItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch={false}
                aria-current={isCurrent(item.href) ? "page" : undefined}
                className="admin-nav-link admin-nav-link-secondary"
              >
                {item.label}
              </Link>
            </li>
          ))}
          {canManageSecurity ? (
            <li>
              <Link
                href="/admin/settings/security"
                prefetch={false}
                aria-current={isCurrent("/admin/settings/security") ? "page" : undefined}
                className="admin-nav-link admin-nav-link-secondary"
              >
                Security & activity
              </Link>
            </li>
          ) : null}
        </ul>
      </details>
    </nav>
  );
}

function NavIcon({ name }: Readonly<{ name: (typeof primaryItems)[number]["icon"] }>) {
  const paths = {
    home: <path d="M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9 20v-6h6v6" />,
    property: <path d="M4 20V8l8-5 8 5v12M8 20v-7h8v7M3 20h18" />,
    people: (
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    ),
  } as const;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
