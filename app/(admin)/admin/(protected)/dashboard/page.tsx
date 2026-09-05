import type { Metadata } from "next";
import Link from "next/link";
import { classifyFollowUp } from "@/features/crm/domain/follow-ups";
import { listFollowUps, listLeads } from "@/server/services/crm";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [leads, followUps] = await Promise.all([listLeads({}), listFollowUps()]);
  const cards = [
    {
      label: "New leads",
      value: leads.filter((lead) => lead.status === "NEW").length,
      href: "/admin/leads?status=NEW",
    },
    {
      label: "Overdue follow-ups",
      value: followUps.filter(
        (followUp) => classifyFollowUp(followUp.due_at, followUp.completed_at) === "OVERDUE",
      ).length,
      href: "/admin/follow-ups",
    },
    {
      label: "Due today",
      value: followUps.filter(
        (followUp) => classifyFollowUp(followUp.due_at, followUp.completed_at) === "TODAY",
      ).length,
      href: "/admin/follow-ups",
    },
  ];
  return (
    <section aria-labelledby="dashboard-heading">
      <p className="text-xs font-bold tracking-[0.16em] text-[var(--brand-navy)] uppercase">
        Operational workspace
      </p>
      <h1 id="dashboard-heading" className="font-display mt-2 text-4xl font-semibold">
        Dashboard
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate-600">
        What needs attention today across the private brokerage pipeline.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            href={card.href}
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-[var(--brand-navy)]"
          >
            <h2 className="font-semibold">{card.label}</h2>
            <p className="font-display mt-2 text-4xl">{card.value}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
