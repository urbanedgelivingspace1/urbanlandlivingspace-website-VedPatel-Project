import type { Metadata } from "next";

import { getSecurityHealth } from "@/server/services/security-health";

export const metadata: Metadata = { title: "Security health" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SecurityHealthPage() {
  const health = await getSecurityHealth();

  return (
    <section aria-labelledby="security-health-heading">
      <p className="text-sm font-bold tracking-wider text-amber-700 uppercase">Configuration</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 id="security-health-heading" className="text-3xl font-bold">
          Security health
        </h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            health.overall === "READY"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-900"
          }`}
        >
          {health.overall}
        </span>
      </div>
      <p className="mt-3 max-w-3xl text-slate-600">
        Safe readiness signals only. Credentials, private object paths and customer data are never
        displayed here.
      </p>
      <dl className="admin-detail-list mt-8">
        <div>
          <dt>Environment</dt>
          <dd>{health.environment}</dd>
        </div>
        <div>
          <dt>Audited migration</dt>
          <dd>{health.migration}</dd>
        </div>
        <div>
          <dt>Checked</dt>
          <dd>
            {new Date(health.checkedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
          </dd>
        </div>
      </dl>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {health.checks.map((check) => (
          <article key={check.key} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-semibold">{check.label}</h2>
              <span
                className={`text-xs font-bold ${
                  check.status === "READY" ? "text-emerald-700" : "text-amber-800"
                }`}
              >
                {check.status}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{check.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
