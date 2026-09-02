import type { ReactNode } from "react";

import { SiteHeader } from "@/components/foundation/site-header";

type PublicLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--surface-muted)]">
      <SiteHeader />
      {children}
    </div>
  );
}
