import Link from "next/link";

import { SiteVisitQueue } from "@/components/admin/site-visit-queue";
import { getSiteVisitReferenceData, listSiteVisits } from "@/server/services/site-visits";

export default async function SiteVisitCalendarPage() {
  const [visits, refs] = await Promise.all([listSiteVisits({}), getSiteVisitReferenceData()]);
  return (
    <section aria-labelledby="schedule-heading">
      <Link href="/admin/site-visits" className="text-sm font-semibold text-[var(--brand-navy)]">
        ← Site visit queue
      </Link>
      <p className="mt-5 text-xs font-bold tracking-[.16em] text-[var(--brand-navy)] uppercase">
        Internal schedule
      </p>
      <h1 id="schedule-heading" className="font-display mt-2 text-4xl font-semibold">
        Visit schedule
      </h1>
      <p className="mt-2 text-slate-600">
        Today and upcoming slots; this is not an external calendar reservation.
      </p>
      {(["TODAY", "UPCOMING"] as const).map((bucket) => (
        <section key={bucket} className="mt-8" aria-labelledby={`bucket-${bucket}`}>
          <h2 id={`bucket-${bucket}`} className="font-display text-2xl">
            {bucket === "TODAY" ? "Today" : "Upcoming"}
          </h2>
          <SiteVisitQueue
            visits={visits.filter((visit) => visit.bucket === bucket)}
            admins={refs.admins}
            filters={{ bucket }}
          />
        </section>
      ))}
    </section>
  );
}
