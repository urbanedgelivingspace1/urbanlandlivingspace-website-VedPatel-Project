"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  {
    label: "Main",
    items: [{ label: "Action centre", href: "/admin/dashboard", icon: "home" }],
  },
  {
    label: "CRM",
    items: [
      { label: "Leads", href: "/admin/leads", icon: "people" },
      { label: "Pipeline", href: "/admin/leads/pipeline", icon: "pipeline" },
      { label: "Follow-ups", href: "/admin/follow-ups", icon: "task" },
      { label: "Site visits", href: "/admin/site-visits", icon: "calendar" },
    ],
  },
  {
    label: "Properties",
    items: [
      { label: "All properties", href: "/admin/properties", icon: "property" },
      { label: "Seller enquiries", href: "/admin/submissions", icon: "seller" },
      { label: "Verification", href: "/admin/verification/queue", icon: "verify" },
      { label: "Media library", href: "/admin/media", icon: "media" },
    ],
  },
  {
    label: "Website",
    items: [
      { label: "Guides & content", href: "/admin/guides", icon: "content" },
      { label: "Locations", href: "/admin/locations", icon: "location" },
      { label: "SEO & redirects", href: "/admin/seo", icon: "search" },
    ],
  },
] as const;

export function AdminNavigation({ canManageSecurity }: Readonly<{ canManageSecurity: boolean }>) {
  const pathname = usePathname() ?? "";
  const isCurrent = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href;
    if (href === "/admin/leads" && pathname.startsWith("/admin/leads/pipeline")) return false;
    if (href === "/admin/verification/queue") return pathname.startsWith("/admin/verification");
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav aria-label="Admin" className="admin-navigation">
      {groups.map((group) => (
        <div key={group.label} className="admin-nav-group">
          <p className="admin-nav-label">{group.label}</p>
          <ul className="mt-1 space-y-0.5">
            {group.items.map((item) => (
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
        </div>
      ))}
      <div className="admin-nav-group border-t border-slate-200 pt-4">
        <p className="admin-nav-label">Settings</p>
        <ul className="mt-1 space-y-0.5">
          <li>
            <Link
              href="/admin/settings/seo"
              prefetch={false}
              aria-current={isCurrent("/admin/settings/seo") ? "page" : undefined}
              className="admin-nav-link"
            >
              <NavIcon name="settings" />
              Website settings
            </Link>
          </li>
          {canManageSecurity ? (
            <li>
              <Link
                href="/admin/settings/security"
                prefetch={false}
                aria-current={isCurrent("/admin/settings/security") ? "page" : undefined}
                className="admin-nav-link"
              >
                <NavIcon name="security" />
                Security & activity
              </Link>
            </li>
          ) : null}
        </ul>
      </div>
    </nav>
  );
}

type IconName = (typeof groups)[number]["items"][number]["icon"] | "settings" | "security";

function NavIcon({ name }: Readonly<{ name: IconName }>) {
  const paths = {
    home: <path d="M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9 20v-6h6v6" />,
    property: <path d="M4 20V8l8-5 8 5v12M8 20v-7h8v7M3 20h18" />,
    people: (
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    ),
    pipeline: (
      <path d="M4 5h4v4H4zM10 5h4v4h-4zM16 5h4v4h-4zM6 9v5m6-5v5m6-5v5M4 15h4v4H4zM10 15h4v4h-4zM16 15h4v4h-4z" />
    ),
    task: <path d="M9 5h11M9 12h11M9 19h11M4 5l1 1 2-2M4 12l1 1 2-2M4 19l1 1 2-2" />,
    calendar: <path d="M4 5h16v15H4zM8 3v4m8-4v4M4 10h16M8 14h2m3 0h3" />,
    seller: <path d="M12 21s7-4.3 7-11V5l-7-2-7 2v5c0 6.7 7 11 7 11Zm-3-9 2 2 4-5" />,
    verify: <path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Zm-3 9 2 2 4-5" />,
    media: <path d="M4 5h16v14H4zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-4 7 5-5 3 3 2-2 6 6" />,
    content: <path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5" />,
    location: (
      <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    ),
    search: <path d="m21 21-4.4-4.4M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />,
    settings: (
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7-3.5 2-1-2-3-2 .5-1.5-1L15 5h-6l-.5 2.5-1.5 1L5 8l-2 3 2 1v2l-2 1 2 3 2-.5 1.5 1L9 21h6l.5-2.5 1.5-1 2 .5 2-3-2-1v-2Z" />
    ),
    security: <path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Zm0 6v4m0 3h.01" />,
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
