import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getPublicAreaUnits } from "@/server/queries/public-reference-data";
import { getOwnerSubmissionWorkspace } from "@/server/services/owner-submissions";
import { createPublicServerClient } from "@/server/supabase/public";

import { convertOwnerSubmissionAction } from "../../actions";

export const metadata: Metadata = { title: "Convert owner submission" };

export default async function ConvertOwnerSubmissionPage({
  params,
  searchParams,
}: Readonly<{ params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }>) {
  const { id } = await params;
  const { error } = await searchParams;
  const [workspace, units] = await Promise.all([
    getOwnerSubmissionWorkspace(id),
    getPublicAreaUnits(createPublicServerClient()),
  ]);
  if (!workspace) notFound();
  if (workspace.submission.status !== "APPROVED")
    redirect(
      `/admin/submissions/${id}?error=${encodeURIComponent("Only an approved submission can be converted.")}`,
    );
  const { submission, district } = workspace;
  const suggestedTitle = `${submission.land_category === "NA" ? "NA" : submission.land_category === "AGRICULTURAL" ? "Agricultural" : "Industrial"} land in ${submission.village_text || district?.name || "Gujarat"}`;
  return (
    <section className="max-w-4xl">
      <Link className="text-sm font-semibold text-slate-600" href={`/admin/submissions/${id}`}>
        ← {submission.submission_reference}
      </Link>
      <h1 className="font-display mt-2 text-4xl font-semibold">
        Create a controlled property draft
      </h1>
      <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
        <strong>This action does not publish.</strong> It creates one DRAFT property, keeps owner
        documents private, and leaves publication subject to the existing readiness checks.
      </div>
      {error ? (
        <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-red-900">{error}</p>
      ) : null}
      <form
        action={convertOwnerSubmissionAction.bind(null, id)}
        className="mt-6 grid gap-5 rounded-xl border border-slate-200 bg-white p-6"
      >
        <input type="hidden" name="expectedVersion" value={submission.version} />
        <label className="grid gap-1 font-semibold">
          Curated listing title
          <input
            className="rounded-lg border border-slate-300 p-3"
            name="listingTitle"
            required
            minLength={5}
            maxLength={220}
            defaultValue={suggestedTitle}
          />
        </label>
        <label className="grid gap-1 font-semibold">
          Curated public description
          <textarea
            className="rounded-lg border border-slate-300 p-3"
            name="publicDescription"
            required
            minLength={10}
            maxLength={10000}
            rows={7}
            placeholder="Write reviewed public copy. Do not paste unverified owner claims as facts."
          />
        </label>
        <label className="grid gap-1 font-semibold">
          Public address (optional)
          <input
            className="rounded-lg border border-slate-300 p-3"
            name="publicAddress"
            maxLength={1000}
            defaultValue={[submission.village_text, submission.taluka_text, district?.name]
              .filter(Boolean)
              .join(", ")}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 font-semibold">
            Location visibility
            <select
              className="rounded-lg border border-slate-300 p-3"
              name="locationVisibility"
              defaultValue="APPROXIMATE"
            >
              <option value="APPROXIMATE">Approximate</option>
              <option value="HIDDEN">Hidden</option>
              <option value="EXACT">Exact (coordinates still remain unset)</option>
            </select>
          </label>
          <label className="grid gap-1 font-semibold">
            Price mode
            <select
              className="rounded-lg border border-slate-300 p-3"
              name="priceMode"
              defaultValue={submission.price_mode}
            >
              <option value="PRICE_ON_REQUEST">Price on request</option>
              <option value="EXACT_TOTAL">Exact total</option>
              <option value="PER_UNIT">Per unit</option>
            </select>
          </label>
          <label className="grid gap-1 font-semibold">
            Total price (₹, when exact)
            <input
              className="rounded-lg border border-slate-300 p-3"
              name="priceAmount"
              type="number"
              min="0"
              step="1"
              defaultValue={submission.asking_price_amount ?? ""}
            />
          </label>
          <label className="grid gap-1 font-semibold">
            Per-unit price (₹, when per-unit)
            <input
              className="rounded-lg border border-slate-300 p-3"
              name="pricePerUnit"
              type="number"
              min="0"
              step="0.01"
              defaultValue={submission.asking_price_per_unit ?? ""}
            />
          </label>
          <label className="grid gap-1 font-semibold">
            Price unit
            <select
              className="rounded-lg border border-slate-300 p-3"
              name="priceUnitId"
              defaultValue={submission.price_unit_id ?? ""}
            >
              <option value="">Choose when per-unit</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.display_name}
                  {unit.symbol ? ` (${unit.symbol})` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex items-start gap-2">
          <input name="negotiable" type="checkbox" defaultChecked={submission.is_negotiable} />
          <span>Negotiable</span>
        </label>
        <label className="flex items-start gap-2 rounded-lg border border-slate-200 p-4">
          <input name="confirmation" type="checkbox" required />
          <span>
            I confirm that I reviewed the public copy and understand this creates a private DRAFT
            only. Publication requires a separate preview, readiness review, and publish action.
          </span>
        </label>
        <div className="flex flex-wrap gap-3">
          <button className="button button-primary" type="submit">
            Create draft property
          </button>
          <Link className="button button-outline" href={`/admin/submissions/${id}`}>
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
