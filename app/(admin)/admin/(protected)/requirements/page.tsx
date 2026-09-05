import Link from "next/link";
import { listRequirements } from "@/server/services/crm";
import { formatIndiaDateTime } from "@/features/crm/domain/follow-ups";
export default async function RequirementsPage() {
  const items = await listRequirements();
  return <RequirementList items={items} title="Buyer requirements" />;
}
export function RequirementList({
  items,
  title,
}: {
  items: Awaited<ReturnType<typeof listRequirements>>;
  title: string;
}) {
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[.16em] text-[var(--brand-navy)] uppercase">
            Demand book
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold">{title}</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/requirements/unmatched" className="button button-outline">
            Unmatched
          </Link>
          <Link href="/admin/leads/new" className="button button-primary">
            New lead
          </Link>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {items.length ? (
          <table className="min-w-[850px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                {[
                  "Requirement / lead",
                  "Demand",
                  "Area",
                  "Budget",
                  "Matches",
                  "Next follow-up",
                  "Updated",
                ].map((h) => (
                  <th className="px-4 py-3" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(({ requirement, lead, matchCount, areaUnit }) =>
                lead ? (
                  <tr key={requirement.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/requirements/${requirement.id}`}
                        className="font-bold text-[var(--brand-navy)]"
                      >
                        {lead.name}
                      </Link>
                      <span className="block text-xs text-slate-500">{lead.leadReference}</span>
                    </td>
                    <td className="px-4 py-3">
                      {[lead.transaction, lead.category, lead.districtName]
                        .filter(Boolean)
                        .join(" · ")}
                    </td>
                    <td className="px-4 py-3">
                      {requirement.min_area_value ?? "—"}–{requirement.max_area_value ?? "—"}{" "}
                      {areaUnit ?? ""}
                    </td>
                    <td className="px-4 py-3">
                      {lead.budgetMin ?? "—"}–{lead.budgetMax ?? "—"}
                    </td>
                    <td className="px-4 py-3">{matchCount}</td>
                    <td className="px-4 py-3">
                      {lead.nextFollowUpAt
                        ? formatIndiaDateTime(lead.nextFollowUpAt)
                        : "Not scheduled"}
                    </td>
                    <td className="px-4 py-3">{formatIndiaDateTime(requirement.updated_at)}</td>
                  </tr>
                ) : null,
              )}
            </tbody>
          </table>
        ) : (
          <p className="p-10 text-center text-slate-500">No buyer requirements found.</p>
        )}
      </div>
    </section>
  );
}
