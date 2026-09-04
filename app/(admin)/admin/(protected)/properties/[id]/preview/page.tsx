import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import { getPublicationPreview } from "@/server/services/property-publication";

export const metadata: Metadata = {
  title: "Property publication preview",
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
          Admin-only · noindex preview
        </p>
        <h1 className="font-display text-3xl font-semibold">
          {preview.title ?? "Untitled property"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          This preview uses explicit public-safe fields and does not make the property public.
        </p>
      </header>
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2">
        <Preview label="Property ID" value={preview.propertyCode} />
        <Preview label="Slug" value={preview.slug} />
        <Preview label="Category" value={preview.category} />
        <Preview label="Transaction" value={preview.transactionType} />
        <Preview label="Availability" value={preview.availability} />
        <Preview label="Area" value={preview.area} />
        <Preview label="Price" value={preview.priceMode?.replaceAll("_", " ")} />
        <Preview label="Public location" value={preview.publicAddress ?? preview.location.label} />
        <Preview label="Location mode" value={preview.location.visibility} />
        <Preview label="Cover alt text" value={preview.cover?.altText} />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-display text-xl font-semibold">Public copy</h2>
        <p className="mt-2 font-semibold">{preview.summary ?? "No public summary recorded."}</p>
        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
          {preview.description ?? "No public description recorded."}
        </p>
      </section>
      <Link
        href={`/admin/properties/${id}`}
        className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold"
      >
        Back to publication readiness
      </Link>
    </div>
  );
}

function Preview({ label, value }: Readonly<{ label: string; value: string | null | undefined }>) {
  return (
    <div>
      <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value || "Not recorded"}</p>
    </div>
  );
}
