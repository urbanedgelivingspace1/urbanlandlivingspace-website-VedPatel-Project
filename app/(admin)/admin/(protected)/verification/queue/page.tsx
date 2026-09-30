import Link from "next/link";

import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/admin-ui";
import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import { listVerificationQueue } from "@/server/services/verifications";

export const dynamic = "force-dynamic";

export default async function VerificationQueuePage() {
  await requireActiveAdminPage();
  const properties = await listVerificationQueue();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Inventory · Evidence workflow"
        title="Verification queue"
        description="Review applicable checks and supporting evidence before a property is considered for publishing. Progress is not a legal conclusion."
      />
      {properties.length === 0 ? (
        <EmptyState
          title="No properties to verify"
          description="Create a property draft before starting the evidence workflow."
          action={{ href: "/admin/properties/new", label: "Add property" }}
        />
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
                    <StatusBadge
                      tone={
                        property.passed === property.totalChecks && property.totalChecks > 0
                          ? "success"
                          : "warning"
                      }
                    >
                      {property.passed} of {property.totalChecks} passed
                    </StatusBadge>
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
