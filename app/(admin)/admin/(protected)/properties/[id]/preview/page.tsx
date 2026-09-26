import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import { getPublicationPreview } from "@/server/services/property-publication";

export const metadata: Metadata = {
  title: "Preview listing",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function PropertyPublicationPreviewPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  await requireActiveAdminPage();
  const preview = await getPublicationPreview(id);
  if (!preview) notFound();
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold tracking-widest text-[var(--brand-gold-deep)] uppercase">
          Preview Listing
        </p>
        <h1 className="font-display text-3xl font-semibold">
          {preview.title ?? "Untitled property"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Check how the listing will look before publishing it.
        </p>
      </header>
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2">
        <Preview label="Property ID" value={preview.propertyCode} />
        <Preview label="Website address" value={preview.slug} />
        <Preview label="Category" value={friendly(preview.category)} />
        <Preview label="Transaction" value={friendly(preview.transactionType)} />
        <Preview label="Availability" value={friendly(preview.availability)} />
        <Preview label="Area" value={preview.area} />
        <Preview label="Price" value={friendly(preview.priceMode)} />
        <Preview label="Listing location" value={preview.publicAddress ?? preview.location.label} />
        <Preview label="Location display" value={friendly(preview.location.visibility)} />
        <Preview label="Cover image description" value={preview.cover?.altText} />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-display text-xl font-semibold">Listing Description</h2>
        <p className="mt-2 font-semibold">{preview.summary ?? "No summary recorded."}</p>
        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
          {preview.description ?? "No description recorded."}
        </p>
      </section>
      <Link
        href={`/admin/properties/${id}`}
        className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold"
      >
        Back to property
      </Link>
    </div>
  );
}

function friendly(value: string | null | undefined) {
  return value
    ? value
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/^./, (letter) => letter.toUpperCase())
    : value;
}

function Preview({ label, value }: Readonly<{ label: string; value: string | null | undefined }>) {
  return (
    <div>
      <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value || "Not recorded"}</p>
    </div>
  );
}
