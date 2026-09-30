import Link from "next/link";
import type { ReactNode } from "react";

type PageHeaderProps = Readonly<{
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}>;

export function AdminPageHeader({ eyebrow, title, description, actions, meta }: PageHeaderProps) {
  return (
    <header className="admin-page-header">
      <div className="min-w-0">
        {eyebrow ? <p className="admin-eyebrow">{eyebrow}</p> : null}
        <h1 className="admin-page-title">{title}</h1>
        {description ? <p className="admin-page-description">{description}</p> : null}
        {meta ? <div className="mt-3">{meta}</div> : null}
      </div>
      {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </header>
  );
}

export function AdminToolbar({
  children,
  label,
}: Readonly<{ children: ReactNode; label: string }>) {
  return (
    <div className="admin-toolbar" role="group" aria-label={label}>
      {children}
    </div>
  );
}

const tones = {
  neutral: "admin-badge-slate",
  info: "admin-badge-blue",
  success: "admin-badge-green",
  warning: "admin-badge-amber",
  danger: "admin-badge-red",
} as const;

export function StatusBadge({
  children,
  tone = "neutral",
}: Readonly<{ children: ReactNode; tone?: keyof typeof tones }>) {
  return <span className={`admin-badge ${tones[tone]}`}>{children}</span>;
}

export function EmptyState({
  title,
  description,
  action,
  compact = false,
}: Readonly<{
  title: string;
  description: string;
  action?: Readonly<{ href: string; label: string }>;
  compact?: boolean;
}>) {
  return (
    <div className={compact ? "admin-empty admin-empty-compact" : "admin-empty"}>
      <span className="admin-empty-icon" aria-hidden="true">
        ✓
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? (
        <Link href={action.href} className="button button-secondary mt-4">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function WorkspaceTabs({
  label,
  tabs,
  active,
}: Readonly<{
  label: string;
  tabs: readonly Readonly<{ key: string; label: string; href: string; count?: number }>[];
  active: string;
}>) {
  return (
    <nav aria-label={label} className="admin-workspace-tabs">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          prefetch={false}
          aria-current={active === tab.key ? "page" : undefined}
          className="admin-tab"
        >
          {tab.label}
          {tab.count !== undefined ? <span className="admin-tab-count">{tab.count}</span> : null}
        </Link>
      ))}
    </nav>
  );
}

export function AdminSection({
  title,
  description,
  action,
  children,
  className = "",
}: Readonly<{
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <section className={`admin-section ${className}`}>
      <div className="admin-section-heading">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  href,
  detail,
  tone = "slate",
}: Readonly<{
  label: string;
  value: number;
  href: string;
  detail?: string;
  tone?: "slate" | "red" | "amber" | "green" | "blue" | "violet";
}>) {
  return (
    <Link href={href} prefetch={false} className={`admin-metric admin-metric-${tone}`}>
      <span className="admin-metric-label">{label}</span>
      <strong>{value}</strong>
      <span className="admin-metric-detail">{detail ?? "Open queue"} →</span>
    </Link>
  );
}

export function QuickActionBar({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="admin-quick-actions">{children}</div>;
}
