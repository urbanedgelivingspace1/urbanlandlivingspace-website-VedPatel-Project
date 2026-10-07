import Link from "next/link";

import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/admin-ui";
import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import { getAdminStorageHealth, listAdminMedia } from "@/server/services/property-media";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  await requireActiveAdminPage();
  const [media, storage] = await Promise.all([listAdminMedia(), getAdminStorageHealth()]);
  const listingMedia = media.filter(
    (asset) => asset.mediaType === "IMAGE" || asset.mediaType === "BROCHURE",
  );
  const unused = listingMedia.filter(
    (asset) => asset.archivedAt || asset.processingStatus === "FAILED",
  );
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Inventory operations"
        title="Media library"
        description="Review property photos and brochures, identify items that need attention, and return to the property to make changes."
      />
      <section className="grid gap-4 sm:grid-cols-4">
        <Metric label="Photos & brochures" value={listingMedia.length} />
        <Metric
          label="Added"
          value={
            listingMedia.filter(
              (asset) => asset.processingStatus === "APPROVED" && !asset.archivedAt,
            ).length
          }
        />
        <Metric label="Needs attention / removed" value={unused.length} />
        <Metric label="Registry storage" value={`${storage.usagePercent.toFixed(1)}%`} />
      </section>
      <p
        role="status"
        className={`rounded-lg border p-3 text-sm ${
          storage.state === "HEALTHY"
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-amber-300 bg-amber-50 text-amber-950"
        }`}
      >
        Storage registry: {formatBytes(storage.usedBytes)} of {formatBytes(storage.budgetBytes)}
        configured budget. Warning at {storage.warningPercent}%; uploads stop at
        {` ${storage.hardStopPercent}%`}.
      </p>
      {listingMedia.length === 0 ? (
        <EmptyState
          title="No media assets"
          description="Upload photos and documents from a property workspace."
          action={{ href: "/admin/properties", label: "Open properties" }}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3">Property</th>
                <th className="p-3">Type</th>
                <th className="p-3">State</th>
              </tr>
            </thead>
            <tbody>
              {listingMedia.map((asset) => (
                <tr key={asset.id} className="border-t border-slate-200">
                  <td className="p-3">
                    <Link
                      href={`/admin/properties/${asset.propertyId}/media`}
                      className="font-bold underline"
                    >
                      {asset.propertyCode}
                    </Link>
                    <br />
                    <span className="text-xs text-slate-500">
                      {asset.propertyTitle || "Untitled draft"}
                    </span>
                  </td>
                  <td className="p-3">{asset.mediaType === "BROCHURE" ? "Brochure" : "Photo"}</td>
                  <td className="p-3">
                    <StatusBadge
                      tone={
                        asset.archivedAt || asset.processingStatus === "FAILED"
                          ? "danger"
                          : asset.processingStatus === "APPROVED"
                            ? "success"
                            : "warning"
                      }
                    >
                      {asset.archivedAt
                        ? "Removed"
                        : asset.processingStatus === "APPROVED"
                          ? "Added"
                          : asset.processingStatus === "FAILED"
                            ? "Needs attention"
                            : "Processing"}
                    </StatusBadge>
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

function Metric({ label, value }: Readonly<{ label: string; value: number | string }>) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
