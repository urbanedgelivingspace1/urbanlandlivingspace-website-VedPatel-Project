import Link from "next/link";

import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import { getAdminStorageHealth, listAdminMedia } from "@/server/services/property-media";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  await requireActiveAdminPage();
  const [media, storage] = await Promise.all([listAdminMedia(), getAdminStorageHealth()]);
  const unused = media.filter((asset) => asset.archivedAt || asset.processingStatus === "FAILED");
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold tracking-widest text-[var(--brand-gold-deep)] uppercase">
          Inventory operations
        </p>
        <h1 className="font-display text-3xl font-semibold">Media registry</h1>
        <p className="mt-1 text-sm text-slate-600">
          Review asset status, detect failed/archived candidates, and return to the owning property
          for controlled changes.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-4">
        <Metric label="All assets" value={media.length} />
        <Metric
          label="Approved"
          value={
            media.filter((asset) => asset.processingStatus === "APPROVED" && !asset.archivedAt)
              .length
          }
        />
        <Metric label="Failed / unused" value={unused.length} />
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
      {media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No media assets are registered.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3">Property</th>
                <th className="p-3">Type</th>
                <th className="p-3">State</th>
                <th className="p-3">Visibility</th>
              </tr>
            </thead>
            <tbody>
              {media.map((asset) => (
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
                  <td className="p-3">{asset.mediaSubtype || asset.mediaType}</td>
                  <td className="p-3">{asset.archivedAt ? "ARCHIVED" : asset.processingStatus}</td>
                  <td className="p-3">{asset.visibility}</td>
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
