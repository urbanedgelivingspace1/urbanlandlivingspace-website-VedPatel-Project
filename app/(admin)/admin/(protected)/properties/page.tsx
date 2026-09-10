import Link from "next/link";

import { measureAdminPerf } from "@/server/admin-perf";
import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import {
  getAdminPropertyFilterOptions,
  listAdminProperties,
} from "@/server/services/property-drafts";

type PropertySearchParams = {
  q?: string;
  category?: string;
  publication?: string;
  availability?: string;
  district?: string;
  sort?: string;
  page?: string;
};

const filterControlClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

export default async function AdminPropertiesPage({
  searchParams,
}: Readonly<{ searchParams: Promise<PropertySearchParams> }>) {
  await requireActiveAdminPage();
  const filters = await searchParams;
  const page = Number.parseInt(filters.page ?? "1", 10) || 1;
  const [result, options] = await measureAdminPerf("/admin/properties", () =>
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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-[var(--brand-gold-deep)] uppercase">
            Inventory
          </p>
          <h1 className="font-display text-3xl font-semibold">Properties</h1>
          <p className="mt-1 text-sm text-slate-600">
            {result.total} propert{result.total === 1 ? "y" : "ies"}. Publishing and availability
            are controlled separately.
          </p>
        </div>
        <Link
          href="/admin/properties/new"
          className="rounded-lg bg-[var(--brand-navy)] px-4 py-2 text-sm font-bold text-white"
        >
          Create property
        </Link>
      </header>

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
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {result.items.map((property) => (
            <article
              key={property.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-bold text-[var(--brand-gold-deep)]">
                    {property.propertyCode}
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-slate-950">
                    {property.title ||
                      `${property.areaValue} ${property.areaUnit} ${property.category} land`}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{property.districtName}</p>
                </div>
                <p className="shrink-0 text-right text-sm font-bold text-slate-950">
                  {formatPrice(property.priceMode, property.priceAmount)}
                </p>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <Status label="Publication" value={property.publicationStatus} />
                <Status label="Availability" value={property.availabilityStatus} />
              </dl>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-600">
                  {property.mediaCount} photo{property.mediaCount === 1 ? "" : "s"} ·{" "}
                  {property.documentCount} document{property.documentCount === 1 ? "" : "s"}
                </p>
                <Link className="button button-secondary" href={`/admin/properties/${property.id}`}>
                  Open property
                </Link>
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

function Status({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-lg bg-slate-50 p-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-bold text-slate-800">{value.replaceAll("_", " ")}</dd>
    </div>
  );
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
