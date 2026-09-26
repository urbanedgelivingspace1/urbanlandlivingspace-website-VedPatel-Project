import Link from "next/link";

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

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-800">Listings and land records</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Properties
          </h1>
          <p className="mt-2 text-base text-slate-600">
            {result.total} propert{result.total === 1 ? "y" : "ies"} in your records.
          </p>
        </div>
        <Link href="/admin/properties/new" className="button button-primary">
          + Add Property
        </Link>
      </header>

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
        <div className="grid gap-3">
          {result.items.map((property) => (
            <article
              key={property.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,.03)] hover:border-emerald-500 sm:p-5"
            >
              <div className="grid gap-4 sm:grid-cols-[minmax(15rem,1.5fr)_minmax(9rem,.7fr)_minmax(10rem,.8fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-800">{property.propertyCode}</p>
                  <Link
                    href={`/admin/properties/${property.id}`}
                    prefetch={false}
                    className="mt-1 block truncate text-base font-bold text-slate-950 hover:text-emerald-800"
                  >
                    {property.title ||
                      `${property.areaValue} ${property.areaUnit} ${friendly(property.category)} land`}
                  </Link>
                  <p className="mt-1 text-sm text-slate-600">
                    {property.districtName} · {friendly(property.transactionType)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Area</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {property.areaValue} {property.areaUnit}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {property.mediaCount} photos · {property.documentCount} docs
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Price</p>
                  <p className="mt-1 text-sm font-bold text-slate-950">
                    {formatPrice(property.priceMode, property.priceAmount)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Updated {formatDate(property.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <div className="flex flex-wrap gap-2">
                    <Status value={property.publicationStatus} />
                    <Status value={property.availabilityStatus} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Link
                      href={`/admin/properties/${property.id}`}
                      prefetch={false}
                      className="button button-secondary px-3 py-1.5 text-xs font-semibold"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/properties/${property.id}/edit`}
                      prefetch={false}
                      className="button button-secondary px-3 py-1.5 text-xs font-semibold"
                    >
                      Edit
                    </Link>
                    <DeleteDraftButton
                      propertyId={property.id}
                      expectedUpdatedAt={property.updatedAt}
                      propertyTitle={property.title ?? property.propertyCode}
                      isPublished={property.publicationStatus === "PUBLISHED"}
                      action={deletePropertyDraftAction}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No properties match these filters.
        </p>
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
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
