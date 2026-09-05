import Link from "next/link";
import type { Metadata } from "next";

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
  const [visits, refs] = await Promise.all([
    listSiteVisits({
      query: filters.q,
      status: filters.status,
      bucket: filters.bucket,
      followUp: filters.followUp,
      assignedTo: filters.assigned,
    }),
    getSiteVisitReferenceData(),
  ]);
  return (
    <section aria-labelledby="site-visits-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[.16em] text-[var(--brand-navy)] uppercase">
            Visit operations
          </p>
          <h1 id="site-visits-heading" className="font-display mt-2 text-4xl font-semibold">
            Site visit queue
          </h1>
          <p className="mt-2 text-slate-600">
            Manual coordination in Asia/Kolkata. Up to 100 operational matches.
          </p>
        </div>
        <Link href="/admin/site-visits/calendar" className="button button-outline">
          Schedule view
        </Link>
      </div>
      <SiteVisitQueue visits={visits} admins={refs.admins} filters={filters} />
    </section>
  );
}
