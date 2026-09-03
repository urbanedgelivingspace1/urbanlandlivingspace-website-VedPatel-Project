import Link from "next/link";

import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import { listAdminProperties } from "@/server/services/property-drafts";

export default async function AdminPropertiesPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ q?: string; category?: string }> }>) {
  await requireActiveAdminPage();
  const filters = await searchParams;
  const properties = await listAdminProperties({ query: filters.q, category: filters.category });
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-[var(--brand-gold-deep)] uppercase">
            Inventory
          </p>
          <h1 className="font-display text-3xl font-semibold">Properties</h1>
          <p className="mt-1 text-sm text-slate-600">
            Admin-only curated drafts. Public visibility is controlled separately.
          </p>
        </div>
        <Link
          href="/admin/properties/new"
          className="rounded-lg bg-[var(--brand-navy)] px-4 py-2 text-sm font-bold text-white"
        >
          Create property draft
        </Link>
      </header>
      <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_14rem_auto]">
        <label className="text-sm font-semibold">
          Search
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Property ID or title"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-semibold">
          Category
          <select
            name="category"
            defaultValue={filters.category ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">All categories</option>
            <option value="AGRICULTURAL">Agricultural</option>
            <option value="NA">NA</option>
            <option value="INDUSTRIAL">Industrial</option>
          </select>
        </label>
        <button
          className="self-end rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold"
          type="submit"
        >
          Filter
        </button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-600 uppercase">
            <tr>
              {[
                "Property ID",
                "Category",
                "Transaction",
                "Location",
                "Area",
                "Price / POR",
                "Availability",
                "Publication",
                "Verification",
                "Media",
                "Updated",
              ].map((heading) => (
                <th className="px-4 py-3" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {properties.map((property) => (
              <tr key={property.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    className="font-bold text-[var(--brand-navy)] underline-offset-2 hover:underline"
                    href={`/admin/properties/${property.id}`}
                  >
                    {property.propertyCode}
                  </Link>
                  {property.title ? (
                    <span className="mt-1 block max-w-52 truncate text-xs text-slate-500">
                      {property.title}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">{property.category}</td>
                <td className="px-4 py-3">{property.transactionType}</td>
                <td className="px-4 py-3">{property.districtName}</td>
                <td className="px-4 py-3">
                  {property.areaValue} {property.areaUnit}
                </td>
                <td className="px-4 py-3">
                  {property.priceMode === "PRICE_ON_REQUEST"
                    ? "POR"
                    : property.priceAmount !== null
                      ? new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).format(property.priceAmount)
                      : property.priceMode.replaceAll("_", " ")}
                </td>
                <td className="px-4 py-3">{property.availabilityStatus.replaceAll("_", " ")}</td>
                <td className="px-4 py-3">
                  <StatusPill value={property.publicationStatus} />
                </td>
                <td className="px-4 py-3">{property.verificationCount || "Not started"}</td>
                <td className="px-4 py-3">{property.mediaCount || "Not added"}</td>
                <td className="px-4 py-3">
                  {new Intl.DateTimeFormat("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Kolkata",
                  }).format(new Date(property.updatedAt))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {properties.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-600">
            No property records match these filters.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function StatusPill({ value }: Readonly<{ value: string }>) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold">
      {value.replaceAll("_", " ")}
    </span>
  );
}
