import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return (
    <section aria-labelledby="dashboard-heading">
      <p className="text-xs font-bold tracking-[0.16em] text-[var(--brand-navy)] uppercase">
        Operational workspace
      </p>
      <h1 id="dashboard-heading" className="font-display mt-2 text-4xl font-semibold">
        Dashboard
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate-600">
        The secure admin boundary is active. Inventory, CRM, verification and publishing tools will
        appear as their milestones pass.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {["Inventory", "CRM", "Verification"].map((label) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold">{label}</h2>
            <p className="mt-2 text-sm text-slate-500">
              No production data is loaded. Feature milestone pending.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
