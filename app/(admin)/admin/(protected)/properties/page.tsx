import Link from "next/link";

import { AdminPageHeader, EmptyState } from "@/components/admin/admin-ui";
import { DeleteDraftButton } from "@/components/admin/delete-draft-button";
import { measureAdminPerf } from "@/server/admin-perf";
import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import {
  getAdminPropertyFilterOptions,
  listAdminProperties,
} from "@/server/services/property-drafts";
import { deletePropertyDraftAction } from "./actions";

type PropertySearchParams = {
  q?: string;
  category?: string;
  publication?: string;
  availability?: string;
  district?: string;
  sort?: string;
  page?: string;
  deleted?: string;
};

const filterControlClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";
const propertyViews = [
  ["All", "/admin/properties"],
  ["Drafts", "/admin/properties?publication=DRAFT"],
  ["Published", "/admin/properties?publication=PUBLISHED"],
  ["Under Negotiation", "/admin/properties?availability=UNDER_NEGOTIATION"],
  ["Sold", "/admin/properties?availability=SOLD"],
] as const;

export default async function AdminPropertiesPage({
  searchParams,
}: Readonly<{ searchParams: Promise<PropertySearchParams> }>) {
  await requireActiveAdminPage();
  const filters = await searchParams;
  const page = Number.parseInt(filters.page ?? "1", 10) || 1;

  let result: Awaited<ReturnType<typeof listAdminProperties>> = {
    items: [],
    page,
    pageSize: 24,
    total: 0,
    totalPages: 1,
  };
  let options: Awaited<ReturnType<typeof getAdminPropertyFilterOptions>> = { districts: [] };
  let errorNotice: string | null = null;

  try {
    const [fetchedResult, fetchedOptions] = await measureAdminPerf("/admin/properties", () =>
      Promise.all([
        listAdminProperties({
          query: filters.q,
          category: filters.category,
          publication: filters.publication,
          availability: filters.availability,
          districtId: filters.district,
          sort: filters.sort,
          page,
        }),
        getAdminPropertyFilterOptions(),
      ]),
    );
    result = fetchedResult;
    options = fetchedOptions;
  } catch (err) {
    console.error("admin_properties_fetch_error", err);
    errorNotice =
      "Some property information could not be loaded. Refresh the page or contact technical support if the problem continues.";
  }

  return (
    <div className="space-y-6">
      {filters.deleted === "1" ? (
        <div
          role="status"
          className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Property deleted successfully.</span>
          </div>
          <Link
            href="/admin/properties"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </Link>
        </div>
      ) : null}

      {errorNotice ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 shadow-xs"
        >
          <p className="font-bold">Properties could not be loaded</p>
          <p className="mt-1">{errorNotice}</p>
        </div>
      ) : null}

      <AdminPageHeader
        eyebrow="Inventory operations"
        title="Properties"
        description={`${result.total} propert${result.total === 1 ? "y" : "ies"} across draft and live inventory.`}
        actions={
          <Link href="/admin/properties/new" className="button button-primary">
            + Add property
          </Link>
        }
      />

      <nav
        aria-label="Property views"
        className="flex gap-1 overflow-x-auto border-b border-slate-200"
      >
        {propertyViews.map(([label, href]) => {
          const active =
            label === "All"
              ? !filters.publication && !filters.availability
              : href.includes(`=${filters.publication ?? filters.availability}`);
          return (
            <Link
              key={label}
              href={href}
              prefetch={false}
              aria-current={active ? "page" : undefined}
              className="admin-tab"
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-6">
        <FilterField label="Search">
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Property ID or title"
            className={filterControlClass}
          />
        </FilterField>
        <FilterSelect
          label="Category"
          name="category"
          value={filters.category}
          options={[
            ["", "All categories"],
            ["AGRICULTURAL", "Agricultural"],
            ["NA", "NA"],
            ["INDUSTRIAL", "Industrial"],
          ]}
        />
        <FilterSelect
          label="Publication"
          name="publication"
          value={filters.publication}
          options={[
            ["", "All publication states"],
            ["DRAFT", "Draft"],
            ["PUBLISHED", "Published"],
            ["UNPUBLISHED", "Unpublished"],
            ["ARCHIVED", "Archived"],
          ]}
        />
        <FilterSelect
          label="Availability"
          name="availability"
          value={filters.availability}
          options={[
            ["", "All availability states"],
            ["AVAILABLE", "Available"],
            ["UNDER_NEGOTIATION", "Under negotiation"],
            ["SOLD", "Sold"],
            ["RENTED", "Rented"],
            ["LEASED", "Leased"],
            ["OFF_MARKET", "Off market"],
          ]}
        />
        <FilterSelect
          label="District"
          name="district"
          value={filters.district}
          options={[
            ["", "All districts"],
            ...options.districts.map((district) => [district.id, district.name] as const),
          ]}
        />
        <FilterSelect
          label="Sort"
          name="sort"
          value={filters.sort}
          options={[
            ["newest", "Recently updated"],
            ["oldest", "Least recently updated"],
            ["code", "Property ID"],
          ]}
        />
        <div className="flex flex-wrap gap-2 lg:col-span-6">
          <button className="button button-primary" type="submit">
            Apply filters
          </button>
          <Link className="button button-secondary" href="/admin/properties">
            Clear
          </Link>
        </div>
      </form>

      {result.items.length ? (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Publication</th>
                  <th className="px-4 py-3">Availability</th>

                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.items.map((property) => (
                  <tr key={property.id} className="hover:bg-slate-50/70">
                    <td className="max-w-xs px-4 py-3">
                      <Link
                        href={`/admin/properties/${property.id}`}
                        prefetch={false}
                        className="font-bold text-slate-950 hover:text-emerald-800"
                      >
                        {property.propertyCode}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-slate-600">
                        {property.title || `${friendly(property.category)} land`}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {property.districtName} · {friendly(property.transactionType)}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold">
                      {property.areaValue} {property.areaUnit}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold">
                      {formatPrice(property.priceMode, property.priceAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <Status value={property.publicationStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <Status value={property.availabilityStatus} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/properties/${property.id}`}
                          prefetch={false}
                          className="button button-secondary"
                        >
                          Open
                        </Link>
                        <details className="relative" name="property-actions">
                          <summary
                            className="button button-secondary cursor-pointer list-none"
                            aria-label={`More actions for ${property.propertyCode}`}
                          >
                            •••
                          </summary>
                          <div className="absolute right-0 z-20 mt-1 min-w-44 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                            <Link
                              href={`/admin/properties/${property.id}/edit`}
                              prefetch={false}
                              className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Edit property
                            </Link>
                            <DeleteDraftButton
                              propertyId={property.id}
                              expectedUpdatedAt={property.updatedAt}
                              propertyTitle={property.title ?? property.propertyCode}
                              isPublished={property.publicationStatus === "PUBLISHED"}
                              action={deletePropertyDraftAction}
                            />
                          </div>
                        </details>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 lg:hidden">
            {result.items.map((property) => (
              <article
                key={property.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/properties/${property.id}`}
                      className="font-bold text-slate-950"
                    >
                      {property.propertyCode}
                    </Link>
                    <p className="mt-1 truncate text-sm text-slate-600">
                      {property.title || `${friendly(property.category)} land`}
                    </p>
                  </div>
                  <Status value={property.publicationStatus} />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {property.districtName} · {property.areaValue} {property.areaUnit} ·{" "}
                  {formatPrice(property.priceMode, property.priceAmount)}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Status value={property.availabilityStatus} />
                  <Link href={`/admin/properties/${property.id}`} className="button button-primary">
                    Open workspace
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title="No properties found"
          description="Try clearing a filter or add the first property to this inventory view."
          action={{ href: "/admin/properties/new", label: "Add property" }}
        />
      )}

      {result.totalPages > 1 ? (
        <nav className="flex items-center justify-between" aria-label="Property pages">
          <PageLink disabled={result.page <= 1} filters={filters} page={result.page - 1}>
            Previous
          </PageLink>
          <p className="text-sm text-slate-600">
            Page {result.page} of {result.totalPages}
          </p>
          <PageLink
            disabled={result.page >= result.totalPages}
            filters={filters}
            page={result.page + 1}
          >
            Next
          </PageLink>
        </nav>
      ) : null}
    </div>
  );
}

function FilterField({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <label className="text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}

function FilterSelect({
  label,
  name,
  value,
  options,
}: Readonly<{
  label: string;
  name: string;
  value?: string;
  options: readonly (readonly [string, string])[];
}>) {
  return (
    <FilterField label={label}>
      <select name={name} defaultValue={value ?? ""} className={filterControlClass}>
        {options.map(([optionValue, optionLabel]) => (
          <option value={optionValue} key={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </FilterField>
  );
}

function Status({ value }: Readonly<{ value: string }>) {
  const tone =
    value === "PUBLISHED" || value === "AVAILABLE"
      ? "admin-badge-green"
      : value === "UNDER_NEGOTIATION"
        ? "admin-badge-amber"
        : value === "SOLD" || value === "OFF_MARKET"
          ? "admin-badge-red"
          : "admin-badge-slate";
  return <span className={`admin-badge ${tone}`}>{friendly(value)}</span>;
}

function friendly(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function formatPrice(mode: string, amount: number | null) {
  if (mode === "PRICE_ON_REQUEST" || amount === null) return "Price on request";
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(2)} L`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function PageLink({
  disabled,
  filters,
  page,
  children,
}: Readonly<{
  disabled: boolean;
  filters: PropertySearchParams;
  page: number;
  children: React.ReactNode;
}>) {
  if (disabled) return <span className="button button-secondary opacity-50">{children}</span>;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value && key !== "page") params.set(key, value);
  }
  params.set("page", String(page));
  return (
    <Link className="button button-secondary" href={`/admin/properties?${params.toString()}`}>
      {children}
    </Link>
  );
}
