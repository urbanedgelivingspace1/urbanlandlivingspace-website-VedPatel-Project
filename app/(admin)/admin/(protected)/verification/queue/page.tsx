import Link from "next/link";

import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import { listVerificationQueue } from "@/server/services/verifications";

export const dynamic = "force-dynamic";

export default async function VerificationQueuePage() {
  await requireActiveAdminPage();
  const properties = await listVerificationQueue();
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold tracking-widest text-[var(--brand-gold-deep)] uppercase">
          Scoped evidence workflow
        </p>
        <h1 className="font-display text-3xl font-semibold">Verification queue</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Checks are property-, category-, transaction- and evidence-specific. Counts are workload
          indicators only; they are never a property score or legal conclusion.
        </p>
      </header>
      {properties.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          Create a property draft before starting verification.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3">Property</th>
                <th className="p-3">Context</th>
                <th className="p-3">Scoped progress</th>
                <th className="p-3">Attention</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.propertyId} className="border-t border-slate-200">
                  <td className="p-3">
                    <Link
                      href={`/admin/verification/${property.propertyId}`}
                      className="font-bold underline"
                    >
                      {property.propertyCode}
                    </Link>
                    <span className="block text-xs text-slate-500">
                      {property.title || "Untitled property draft"}
                    </span>
                  </td>
                  <td className="p-3">
                    {property.category} · {property.transactionType}
                  </td>
                  <td className="p-3">
                    {property.passed} scoped passed / {property.totalChecks} applicable
                  </td>
                  <td className="p-3">
                    {property.inReview} in review · {property.requiresReview} requires review ·{" "}
                    {property.dueOrExpired} due
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
