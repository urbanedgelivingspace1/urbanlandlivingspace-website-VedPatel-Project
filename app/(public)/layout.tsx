import type { ReactNode } from "react";

import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { loadPublicBusinessConfig } from "@/server/queries/public-page-data";

type PublicLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const config = await loadPublicBusinessConfig();
  return (
    <div className="min-h-screen bg-[var(--surface-muted)]">
      <SiteHeader config={config} />
      {children}
      <SiteFooter config={config} />
    </div>
  );
}
