import Link from "next/link";
import type { Metadata } from "next";

import { AdminPageHeader, WorkspaceTabs } from "@/components/admin/admin-ui";
import { measureAdminPerf } from "@/server/admin-perf";
import { SiteVisitQueue } from "@/components/admin/site-visit-queue";
import { getSiteVisitReferenceData, listSiteVisits } from "@/server/services/site-visits";

export const metadata: Metadata = { title: "Site visits | Operations" };

export default async function SiteVisitsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const value = (key: string) => (typeof params[key] === "string" ? params[key] : undefined);
  const filters = {
    q: value("q"),
    status: value("status"),
    bucket: value("bucket"),
    followUp: value("followUp"),
    assigned: value("assigned"),
  };
  const [visits, refs] = await measureAdminPerf("/admin/site-visits", () =>
    Promise.all([
      listSiteVisits({
        query: filters.q,
        status: filters.status,
        bucket: filters.bucket,
        followUp: filters.followUp,
        assignedTo: filters.assigned,
      }),
      getSiteVisitReferenceData(),
    ]),
  );
  return (
    <section className="mx-auto max-w-[1500px]">
      <AdminPageHeader
        eyebrow="CRM · Field operations"
        title="Site visits"
        description="Confirm appointments, keep customer and property context together, and record the next step."
        actions={
          <Link href="/admin/site-visits/calendar" className="button button-primary">
            Schedule view
          </Link>
        }
      />
      <WorkspaceTabs
        label="CRM workspaces"
        active="site-visits"
        tabs={[
          { key: "leads", label: "Leads", href: "/admin/leads" },
          { key: "pipeline", label: "Pipeline", href: "/admin/leads/pipeline" },
          { key: "follow-ups", label: "Follow-ups", href: "/admin/follow-ups" },
          { key: "site-visits", label: "Site visits", href: "/admin/site-visits" },
        ]}
      />
      <SiteVisitQueue visits={visits} admins={refs.admins} filters={filters} />
    </section>
  );
}
